const { describe, it } = require('node:test');
const should = require('should');
const fs = require('fs');
const parse = require('..');

describe('furkot import csv', function () {

  it('should parse csv', function (t, done) {
    const stream = fs.createReadStream(__dirname + '/fixtures/italy.csv');
    parse(stream, function (err, trip) {
      const expected = require('./fixtures/italy.json');
      should.exist(trip);
      should.not.exist(err);
      trip.should.eql(expected);
      done();
    });
  });

  it('should parse csv without header', function (t, done) {
    const stream = fs.createReadStream(__dirname + '/fixtures/italy-no-header.csv');
    parse(stream, function (err, trip) {
      const expected = require('./fixtures/italy.json');
      should.exist(trip);
      should.not.exist(err);
      trip.should.eql(expected);
      done();
    });
  });

  it('should parse csv with duration', function (t, done) {
    const stream = fs.createReadStream(__dirname + '/fixtures/duration.csv');
    parse(stream, function (err, trip) {
      const expected = require('./fixtures/duration.json');
      should.exist(trip);
      should.not.exist(err);
      trip.should.eql(expected);
      done();
    });
  });

  it('should parse csv without coordinates', function (t, done) {
    const stream = fs.createReadStream(__dirname + '/fixtures/no-coords-cap-header.csv');
    parse(stream, function (err, trip) {
      const expected = require('./fixtures/no-coords-cap-header.json');
      should.exist(trip);
      should.not.exist(err);
      trip.should.eql(expected);
      done();
    });
  });

  it('should parse csv in Garmin custom POI format', function (t, done) {
    const stream = fs.createReadStream(__dirname + '/fixtures/garmin-poi.csv');
    parse(stream, function (err, trip) {
      const expected = require('./fixtures/garmin-poi.json');
      should.exist(trip);
      should.not.exist(err);
      trip.should.eql(expected);
      done();
    });
  });

  it('should parse driving log csv', function (t, done) {
    const stream = fs.createReadStream(__dirname + '/fixtures/driving-log.csv');
    parse(stream, function (err, trip) {
      const expected = require('./fixtures/driving-log.json');
      should.exist(trip);
      should.not.exist(err);
      trip.should.eql(expected);
      done();
    });
  });

  it('should parse empty csv', function (t, done) {
    const stream = fs.createReadStream(__dirname + '/fixtures/empty.csv');
    parse(stream, function (err, trip) {
      should.not.exist(err);
      trip.should.eql({});
      done();
    });
  });

  it('should parse empty driving log csv', function (t, done) {
    const stream = fs.createReadStream(__dirname + '/fixtures/empty-driving-log.csv');
    parse(stream, function (err, trip) {
      should.not.exist(err);
      trip.should.eql({});
      done();
    });
  });

  it('should raise error on unquoted csv file', function (t, done) {
    const stream = fs.createReadStream(__dirname + '/fixtures/unquoted.csv');
    parse(stream, function (err, trip) {
      should.exist(err);
      err.should.have.property('err', 'invalid');
      err.should.have.property('message');
      err.should.not.have.property('status');
      should.not.exist(trip);
      done();
    });
  });

  it('should raise error on invalid csv file', function (t, done) {
    const stream = fs.createReadStream(__dirname + '/fixtures/invalid.csv');
    parse(stream, function (err, trip) {
      should.exist(err);
      err.should.have.property('err', 'invalid');
      err.should.have.property('message');
      err.should.not.have.property('status');
      should.not.exist(trip);
      done();
    });
  });
});
