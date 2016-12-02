var should = require('should');
var fs = require('fs');
var parse = require('..');

describe('furkot import csv', function() {

  it('should parse csv', function(done) {
    var stream = fs.createReadStream(__dirname + '/fixtures/italy.csv');
    parse(stream, function(err, trip) {
      var expected = require('./fixtures/italy.json');
      should.exist(trip);
      should.not.exist(err);
      trip.should.eql(expected);
      done();
    });
  });

  it('should parse csv without header', function(done) {
    var stream = fs.createReadStream(__dirname + '/fixtures/italy-no-header.csv');
    parse(stream, function(err, trip) {
      var expected = require('./fixtures/italy.json');
      should.exist(trip);
      should.not.exist(err);
      trip.should.eql(expected);
      done();
    });
  });

  it('should parse csv in Garmin custom POI format', function(done) {
    var stream = fs.createReadStream(__dirname + '/fixtures/garmin-poi.csv');
    parse(stream, function(err, trip) {
      var expected = require('./fixtures/garmin-poi.json');
      should.exist(trip);
      should.not.exist(err);
      trip.should.eql(expected);
      done();
    });
  });

  it('should parse invalid csv', function(done) {
    var stream = fs.createReadStream(__dirname + '/fixtures/invalid.csv');
    parse(stream, function(err, trip) {
      should.exist(err);
      should.not.exist(trip);
      done();
    });
  });
});
