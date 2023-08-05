const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const fs = require('fs');
const parse = require('..');

describe('furkot import csv', function () {

  it('should parse csv', function (t, done) {
    const stream = fs.createReadStream(__dirname + '/fixtures/italy.csv');
    parse(stream, function (err, trip) {
      const expected = require('./fixtures/italy.json');
      assert.ifError(err);
      assert.deepEqual(trip, expected);
      done();
    });
  });

  it('should parse csv without header', function (t, done) {
    const stream = fs.createReadStream(__dirname + '/fixtures/italy-no-header.csv');
    parse(stream, function (err, trip) {
      const expected = require('./fixtures/italy.json');
      assert.ifError(err);
      assert.deepEqual(trip, expected);
      done();
    });
  });

  it('should parse csv with duration', function (t, done) {
    const stream = fs.createReadStream(__dirname + '/fixtures/duration.csv');
    parse(stream, function (err, trip) {
      const expected = require('./fixtures/duration.json');
      assert.ifError(err);
      assert.deepEqual(trip, expected);
      done();
    });
  });

  it('should parse csv without coordinates', function (t, done) {
    const stream = fs.createReadStream(__dirname + '/fixtures/no-coords-cap-header.csv');
    parse(stream, function (err, trip) {
      const expected = require('./fixtures/no-coords-cap-header.json');
      assert.ifError(err);
      assert.deepEqual(trip, expected);
      done();
    });
  });

  it('should parse csv in Garmin custom POI format', function (t, done) {
    const stream = fs.createReadStream(__dirname + '/fixtures/garmin-poi.csv');
    parse(stream, function (err, trip) {
      const expected = require('./fixtures/garmin-poi.json');
      assert.ifError(err);
      assert.deepEqual(trip, expected);
      done();
    });
  });

  it('should parse driving log csv', function (t, done) {
    const stream = fs.createReadStream(__dirname + '/fixtures/driving-log.csv');
    parse(stream, function (err, trip) {
      const expected = require('./fixtures/driving-log.json');
      assert.ifError(err);
      assert.deepEqual(trip, expected);
      done();
    });
  });

  it('should parse empty csv', function (t, done) {
    const stream = fs.createReadStream(__dirname + '/fixtures/empty.csv');
    parse(stream, function (err, trip) {
      assert.ifError(err);
      assert.deepEqual(trip, {});
      done();
    });
  });

  it('should parse empty driving log csv', function (t, done) {
    const stream = fs.createReadStream(__dirname + '/fixtures/empty-driving-log.csv');
    parse(stream, function (err, trip) {
      assert.ifError(err);
      assert.deepEqual(trip, {});
      done();
    });
  });

  it('should raise error on unquoted csv file', function (t, done) {
    const stream = fs.createReadStream(__dirname + '/fixtures/unquoted.csv');
    parse(stream, function (err, trip) {
      assert.equal(err?.code, 'CSV_RECORD_INCONSISTENT_COLUMNS');
      assert.ok(!trip);
      done();
    });
  });

  it('should raise error on invalid csv file', function (t, done) {
    const stream = fs.createReadStream(__dirname + '/fixtures/invalid.csv');
    parse(stream, function (err, trip) {
      assert.equal(err?.code, 'CSV_INVALID_COLUMN_MAPPING');
      assert.ok(!trip);
      done();
    });
  });
});
