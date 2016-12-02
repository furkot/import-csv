var csv = require('csv');
var standardHeader = [ 'name', 'lat', 'lon', 'address', 'url', 'notes', 'pin' ];
var mandatoryHeader = [ 'name', 'lat', 'lon', 'address'];
var garminHeader = [ 'lon', 'lat', 'name', 'notes' ];

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
  return s;
}

function row2stop(result, prop) {
  if (result.row[prop]) {
    // ignore case in the CSV header
    result.stop[prop.toLowerCase()] = result.row[prop];
  }
  return result;
}

function parseRow(row, stops) {
  var stop = Object.keys(row).reduce(row2stop, {
    row: row,
    stop: {}
  }).stop;
  stop = conformStop(stop);
  stops.push(stop);
}

function matchField(mandatory) {
  var result = this;
  if (result.field === mandatory) {
    result[mandatory] = true;
    return true;
  }
}

function matchFurkotFormat(field) {
  var result = this;
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
  var stops = [], parser, error;
  parser = csv.parse({
      columns: function (row) {
        if (row && row.some(matchFurkotFormat, {})) {
          return row;
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
      var row;
      row = parser.read();
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
        fn(null, {
          stops: stops
        });
      }
    })
    .on('error', fn);
  file.pipe(parser);
}
