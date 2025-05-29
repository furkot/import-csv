import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

import parse from '../lib/import.js';

/* global TextDecoderStream */

async function createFromStream(file) {
  const name = path.resolve(import.meta.dirname, file);
  const handle = await fs.open(name);
  return handle.readableWebStream().pipeThrough(new TextDecoderStream());
}

async function loadJSON(file) {
  const name = path.resolve(import.meta.dirname, file);
  return JSON.parse(await fs.readFile(name, 'utf8'));
}

test('should parse csv', async () => {
  const stream = await createFromStream('./fixtures/italy.csv');
  const trip = await parse(stream);
  const expected = await loadJSON('./fixtures/italy.json');
  assert.deepEqual(trip, expected);
});

test('should parse csv without header', async () => {
  const stream = await createFromStream('./fixtures/italy-no-header.csv');
  const trip = await parse(stream);
  const expected = await loadJSON('./fixtures/italy.json');
  assert.deepEqual(trip, expected);
});

test('should parse csv with duration', async () => {
  const stream = await createFromStream('./fixtures/duration.csv');
  const trip = await parse(stream);
  const expected = await loadJSON('./fixtures/duration.json');
  assert.deepEqual(trip, expected);
});

test('should parse csv without coordinates', async () => {
  const stream = await createFromStream('./fixtures/no-coords-cap-header.csv');
  const trip = await parse(stream);
  const expected = await loadJSON('./fixtures/no-coords-cap-header.json');
  assert.deepEqual(trip, expected);
});

test('should parse csv in Garmin custom POI format', async () => {
  const stream = await createFromStream('./fixtures/garmin-poi.csv');
  const trip = await parse(stream);
  const expected = await loadJSON('./fixtures/garmin-poi.json');
  assert.deepEqual(trip, expected);
});

test('should parse driving log csv', async () => {
  const stream = await createFromStream('./fixtures/driving-log.csv');
  const trip = await parse(stream);
  const expected = await loadJSON('./fixtures/driving-log.json');
  assert.deepEqual(trip, expected);
});

test('should parse empty csv', async () => {
  const stream = await createFromStream('./fixtures/empty.csv');
  const trip = await parse(stream);
  assert.deepEqual(trip, {});
});

test('should parse empty driving log csv', async () => {
  const stream = await createFromStream('./fixtures/empty-driving-log.csv');
  const trip = await parse(stream);
  assert.deepEqual(trip, {});
});

test('should raise error on unquoted csv file', async () => {
  const stream = await createFromStream('./fixtures/unquoted.csv');
  await assert.rejects(parse(stream), { cause: 'CSV_RECORD_INCONSISTENT_COLUMNS' });
});

test('should raise error on invalid csv file', async () => {
  const stream = await createFromStream('./fixtures/invalid.csv');
  await assert.rejects(parse(stream), { cause: 'CSV_INVALID_COLUMN_MAPPING' });
});
