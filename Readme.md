[![NPM version][npm-image]][npm-url]
[![Build Status][build-image]][build-url]
[![Dependency Status][deps-image]][deps-url]

# @furkot/import-csv

Import [CSV] files into [Furkot] road trip planner.

## Install

```sh
$ npm install --save furkot-import-csv
```

## Usage

Use as a transform stream: pipe network responses, files etc. and listen on `data` event.

```js
var furkotImportCsv = require('furkot-import-csv');
var request = require('getlet');

request('https://example.com/my.csv')
  .pipe(furkotImportCsv)
  .on('data', function(trip) {
    console.log(trip);
  });
```

## Format

CSV files imported by Furkot are expected to have following fields:
- `name` - place name; mandatory
- `lat` - latitude of the place; mandatory unless `address` is provided
- `lon` - longitude of the place; mandatory unless `address` is provided
- `address` - place address as comma-delimited string; mandatory unless `lat` and `lon` are provided
- `url` - place url; optional
- `notes` - place description up to 256 characters; optional
- `pin` - icon representing the place, from the list of Furkot [icons]; optional
- `duration` - stop duration in minutes; optional

If the first line of the imported file contains the names, fields can be in any order and only
mandatory ones need to be present. In the absence of the header line with field names, fields in the
file have to be exactly in the order listed above.

Any text field that contains commas (specifically the `address`) has to be enclosed in double-
quotes, e.g. *"1022 William T Morrissey Boulevard, Dorchester, MA 02122, USA"*.

## License

MIT © [code42day](https://code42day.com)

[Furkot]: https://furkot.com
[CSV]: http://en.wikipedia.org/wiki/Comma-separated_values
[icons]: https://furkot.github.io/icon-fonts/build/furkot.html

[npm-image]: https://img.shields.io/npm/v/@furkot/import-csv
[npm-url]: https://npmjs.org/package/@furkot/import-csv

[build-url]: https://github.com/furkot/import-csv/actions/workflows/check.yaml
[build-image]: https://img.shields.io/github/actions/workflow/status/furkot/import-csv/check.yaml?branch=main

[deps-image]: https://img.shields.io/librariesio/release/npm/@furkot/import-csv
[deps-url]: https://libraries.io/npm/@furkot%2Fimport-csv
