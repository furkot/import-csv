const csv = require('csv-parse');
const standardHeader = [ 'name', 'lat', 'lon', 'address', 'url', 'notes', 'pin', 'duration' ];
const mandatoryHeader = [ 'name', 'lat', 'lon', 'address'];
const garminHeader = [ 'lon', 'lat', 'name', 'notes' ];
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

function parseHeader(result, field, i) {
  result.row[result.header[i]] = field;
  return result;
}

function parseCsv(file, fn) {
  let error;
  let isDrivingLog;
  const stops = [];
  const parser = csv({
      columns: function (row) {
        if (row && row.some(matchFurkotFormat, {})) {
          return row.map(prepHeader);
        }
        // is it driving log
        if (row && row.length >= 4 && row.slice(0, 4).every((r, i) => prepHeader(r) === drivingLogHeader[i])) {
          isDrivingLog = true;
          return drivingLog;
        }
        // is it Garmin Custom POI file?
        // http://www8.garmin.com/products/poiloader/creating_custom_poi_files.jsp
        if (!(row.length < 3 || isNaN(parseFloat(row[0])) || isNaN(parseFloat(row[1])))) {
          parseRow(row.reduce(parseHeader, {
            header: garminHeader,
            row: {}
          }).row, stops);
          return garminHeader;
        }
        parseRow(row.reduce(parseHeader, {
          header: standardHeader,
          row: {}
        }).row, stops);
        if (stops.length && stops[0].coordinates &&
          isNaN(stops[0].coordinates.lat) && isNaN(stops[0].coordinates.lon)) {
          // wrong header -> wrong file
          return;
        }
        // accept files without header
        return standardHeader;
      },
      relax_column_count: true,
      trim: true
    })
    .on('readable', function () {
      let row = parser.read();
      if (row && Array.isArray(row)) {
        if (!error) {
          this.emit('error', {
            status: 422,
            err: 'invalid'
          });
          error = true;
          return;
        }
      }
      while (row) {
        if (row['undefined']) {
          if (!error) {
            this.emit('error', {
              status: 422,
              err: 'unquoted'
            });
            error = true;
            return;
          }
        }
        if (!error) {
          parseRow(row, stops);
        }
        row = parser.read();
      }
    })
    .on('finish', function() {
      if (!error) {
        if (isDrivingLog) {
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
        fn(null, {
          stops
        });
      }
    })
    .on('error', fn);
  file.pipe(parser);
}
