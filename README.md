# linter-jing

[![Travis CI Status](https://travis-ci.org/aerhard/linter-jing.svg?branch=master)](https://travis-ci.org/aerhard/linter-jing)
[![Appveyor CI Status](https://ci.appveyor.com/api/projects/status/github/aerhard/linter-jing?branch=master&svg=true)](https://ci.appveyor.com/project/aerhard/linter-jing)
[![Circle CI Status](https://circleci.com/gh/aerhard/linter-jing/tree/master.svg?style=shield&circle-token=93c48cdbcad41ba1b7cd08f231286b94b195de53)](https://circleci.com/gh/aerhard/linter-jing)

On-the-fly well-formedness check and validation of XML files in Atom. Supported schema types: RelaxNG (XML and compact syntax), Schematron (1.5, ISO) and W3C Schema (XSD).

## Installation

Run `apm install linter-jing` or select the package in Atom's Settings view / Install Packages.

The linter depends on the Java Runtime Environment (JRE) v1.6 or above. If running `java -version` on the command line returns an appropriate version number, you should be set. Otherwise, install a recent JRE and provide the path to the Java executable either in the PATH environment variable or in the linter-jing package settings in Atom.

## Settings

* *Java Executable Path:* The path to the Java executable file (`java`) to be used running Jing.
* *Display Schema Warnings:* Whether or not to display warning messages from the schema parser.

## Development

While developing, run `npm run watch` to transpile the ES6 code in `src` to ES5 in `lib`.
