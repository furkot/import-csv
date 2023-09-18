const test = require('node:test');
const assert = require('node:assert/strict');

const fs = require('node:fs/promises');
const path = require('node:path');

const parse = require('..');

/* global TextDecoderStream */

async function createFromStream(file) {
  const name = path.join(__dirname, file);
  const handle = await fs.open(name);
  return handle.readableWebStream().pipeThrough(new TextDecoderStream());
}

test('should parse csv', async function () {
  const stream = await createFromStream('/fixtures/italy.csv');
  const trip = await parse(stream);
  const expected = require('./fixtures/italy.json');
  assert.deepEqual(trip, expected);
});

test('should parse csv without header', async function () {
  const stream = await createFromStream('/fixtures/italy-no-header.csv');
  const trip = await parse(stream);
  const expected = require('./fixtures/italy.json');
  assert.deepEqual(trip, expected);
});

test('should parse csv with duration', async function () {
  const stream = await createFromStream('/fixtures/duration.csv');
  const trip = await parse(stream);
  const expected = require('./fixtures/duration.json');
  assert.deepEqual(trip, expected);
});

test('should parse csv without coordinates', async function () {
  const stream = await createFromStream('/fixtures/no-coords-cap-header.csv');
  const trip = await parse(stream);
  const expected = require('./fixtures/no-coords-cap-header.json');
  assert.deepEqual(trip, expected);
});

test('should parse csv in Garmin custom POI format', async function () {
  const stream = await createFromStream('/fixtures/garmin-poi.csv');
  const trip = await parse(stream);
  const expected = require('./fixtures/garmin-poi.json');
  assert.deepEqual(trip, expected);
});

test('should parse driving log csv', async function () {
  const stream = await createFromStream('/fixtures/driving-log.csv');
  const trip = await parse(stream);
  const expected = require('./fixtures/driving-log.json');
  assert.deepEqual(trip, expected);
});

test('should parse empty csv', async function () {
  const stream = await createFromStream('/fixtures/empty.csv');
  const trip = await parse(stream);
  assert.deepEqual(trip, {});
});

test('should parse empty driving log csv', async function () {
  const stream = await createFromStream('/fixtures/empty-driving-log.csv');
  const trip = await parse(stream);
  assert.deepEqual(trip, {});
});

test('should raise error on unquoted csv file', async function () {
  const stream = await createFromStream('/fixtures/unquoted.csv');
  await assert.rejects(parse(stream), { cause: 'CSV_RECORD_INCONSISTENT_COLUMNS' });
});

test('should raise error on invalid csv file', async function () {
  const stream = await createFromStream('/fixtures/invalid.csv');
  await assert.rejects(parse(stream), { cause: 'CSV_INVALID_COLUMN_MAPPING' });
});
