const { CsvLineStream } = require('@pirxpilot/csv-parse');

const standardHeader = ['name', 'lat', 'lon', 'address', 'url', 'notes', 'pin', 'duration'];
const mandatoryHeader = ['name', 'lat', 'lon', 'address'];
const garminHeader = ['lon', 'lat', 'name', 'notes'];
const drivingLogHeader = [
  'from',
  'from address',
  'to',
  'to address',
  'departure date',
  'departure time',
  'arrival date',
  'arrival time',
  'driving time',
  'distance',
  'total driving time',
  'total distance',
  'notes'
];
const drivingLog = [
  'name',
  'address',
  'to',
  'to_address',
  'd_date',
  'd_time',
  'a_date',
  'a_time',
  '',
  '',
  '',
  '',
  'notes'
];

module.exports = parseCsv;


function conformStop(s) {
  if (s.lat && s.lon) {
    s.coordinates = {
      lat: parseFloat(s.lat),
      lon: parseFloat(s.lon)
    };
    delete s.lat;
    delete s.lon;
  }
  if (s.duration) {
    const duration = parseFloat(s.duration);
    if (!Number.isNaN(duration) && duration >= 0) {
      s.duration = Math.round(duration * 60 * 1000); // minutes to millis
    } else {
      delete s.duration;
    }
  }
  return s;
}

function row2stop(result, prop) {
  if (prop && result.row[prop]) {
    // ignore case in the CSV header
    result.stop[prop.toLowerCase()] = result.row[prop];
  }
  return result;
}

function parseRow(row, stops) {
  let stop = Object.keys(row).reduce(row2stop, {
    row,
    stop: {}
  }).stop;
  stop = conformStop(stop);
  stops.push(stop);
}

function prepHeader(field) {
  return field.trim().toLowerCase();
}

function matchField(mandatory) {
  const result = this;
  if (prepHeader(result.field) === mandatory) {
    result[mandatory] = true;
    return true;
  }
}

function matchFurkotFormat(field) {
  const result = this;
  result.field = field;
  if (mandatoryHeader.some(matchField, result)) {
    return result.name && (result.address || (result.lat && result.lon));
  }
}

/* global WritableStream */

async function parseCsv(file) {
  const stops = [];
  const parser = new CsvLineStream({
    trim: true
  });


  let header = false;
  await file.pipeThrough(parser).pipeTo(new WritableStream({
    write: row => {
      if (!header) {
        header = columns(row);
      } else {
        parseRow(createRowObject(header, row), stops);
      }
    }
  }));

  if (!stops.length) {
    return {};
  }
  if (header === drivingLog) {
    let s = stops[stops.length - 1];
    stops.push({
      name: s.to,
      address: s.to_address,
      d_date: s.a_date,
      d_time: s.a_time,
      a_date: s.a_date,
      a_time: s.a_time
    });
    s = stops[0];
    let a = Date.parse([s.d_date, s.d_time].join('T'));
    stops.forEach(s => {
      const d = Date.parse([s.d_date, s.d_time].join('T'));
      s.duration = d - a;
      a = Date.parse([s.a_date, s.a_time].join('T'));
      delete s.to;
      delete s.to_address;
      delete s.d_date;
      delete s.d_time;
      delete s.a_date;
      delete s.a_time;
    });
  }
  return { stops };

  function columns(row) {
    if (row?.some(matchFurkotFormat, {})) {
      return row.map(prepHeader);
    }
    // is it driving log
    if (row?.length >= 4 && row.slice(0, 4).every((r, i) => prepHeader(r) === drivingLogHeader[i])) {
      return drivingLog;
    }
    // is it Garmin Custom POI file?
    // http://www8.garmin.com/products/poiloader/creating_custom_poi_files.jsp
    if (!(row.length < 3 || isNaN(parseFloat(row[0])) || isNaN(parseFloat(row[1])))) {
      parseRow(createRowObject(garminHeader, row), stops);
      return garminHeader;
    }
    parseRow(createRowObject(standardHeader, row, false), stops);
    if (stops.length && stops[0].coordinates &&
      isNaN(stops[0].coordinates.lat) && isNaN(stops[0].coordinates.lon)) {
      throw new Error('Invalid CSV file header', { cause: 'CSV_INVALID_COLUMN_MAPPING' });
    }
    // accept files without header
    return standardHeader;
  }
}

function createRowObject(header, row, strict = true) {
  if (strict && header.length < row.length) {
    throw new Error('Too many fields in a row', { cause: 'CSV_RECORD_INCONSISTENT_COLUMNS' });
  }
  return Object.fromEntries(header.map((h, index) => [h, row[index]?.trim()]));
}
