# linter-autocomplete-jing

[![Travis CI Status](https://travis-ci.org/aerhard/linter-autocomplete-jing.svg?branch=master)](https://travis-ci.org/aerhard/linter-autocomplete-jing)
[![Appveyor CI Status](https://ci.appveyor.com/api/projects/status/github/aerhard/linter-autocomplete-jing?branch=master&svg=true)](https://ci.appveyor.com/project/aerhard/linter-autocomplete-jing)
[![Circle CI Status](https://circleci.com/gh/aerhard/linter-autocomplete-jing/tree/master.svg?style=shield&circle-token=93c48cdbcad41ba1b7cd08f231286b94b195de53)](https://circleci.com/gh/aerhard/linter-autocomplete-jing)
[![Dependencies](https://david-dm.org/aerhard/linter-autocomplete-jing.svg)](https://david-dm.org/aerhard/linter-autocomplete-jing)
[![devDependencies Status](https://david-dm.org/aerhard/linter-autocomplete-jing/dev-status.svg)](https://david-dm.org/aerhard/linter-autocomplete-jing?type=dev)

Autocomplete and on-the-fly validation of XML documents in Atom.

Supported schema types:

* *Validation*: RELAX NG (XML and compact syntax), Schematron (1.5, ISO), W3C Schema (XSD 1.0) and DTD
* *Autocomplete*: RELAX NG (XML and compact syntax), W3C Schema (XSD 1.0)

XML document processing is handled in Java using [Jing](https://github.com/aerhard/jing-trang), [Xerces](http://xerces.apache.org/xerces2-j/) and [Saxon HE](http://saxon.sourceforge.net/). For the source code of the Java part see https://github.com/aerhard/xml-tools.

## Installation

Select the package in Atom's Settings View (<kbd>Ctrl-,</kbd>) / Install Packages or run `apm install linter-autocomplete-jing` from the command line.

The package depends on a Java Runtime Environment (JRE) v1.6 or above. If running `java -version` on the command line returns an appropriate version number, you should be set. Otherwise, install a recent JRE and provide the path to the Java executable either in the PATH environment variable or in the linter-autocomplete-jing package settings in Atom.

## Package Settings

* *Java Executable Path:* The path to the Java executable (`java`).
* *JVM Arguments:* Space-separated list of arguments to get passed to the Java Virtual Machine on which the validation server is run.
* *Schema Cache Size:* The maximum number of schemata retained simultaneously in memory. (There is a -- now fixed -- bug in a recent version of Atom's Settings View preventing users from setting 0 as a value in numeric fields, see the discussion at https://github.com/atom/settings-view/issues/783).
* *Display Schema Parser Warnings:* Whether or not to display warning messages from the schema parser.
* *XML Catalog:* The path to the XML Catalog file to be used in validation.
* *DTD Validation:* Determines under which circumstances DTDs should be used in validation. Possible values: 'always', 'never' or 'only as fallback'. When 'only as fallback' is selected, documents get validated against DTDs only if no other schemata are available for validation.
* *Autocomplete Priority*: The inclusion priority of the Autocomplete Plus provider. In order to exclude other autocomplete providers, the number must be larger than the other providers' priorities. Defaults to 2, which suppresses the default tag snippets provided by the `language-xml` package. (In order to re-enable them, set autocomplete priority to 1.)
* *Autocomplete Scope*: The schema types which should be used for autocomplete.
* *Wildcard Suggestions*: Inclusion of wildcards in autocomplete suggestions. Possible values: 'all', 'localparts', 'none'.

(In order to edit the settings, open Atom's settings view by pressing <kbd>Ctrl-,</kbd> or by selecting "Packages" / "Settings View" / "Open" in the main menu). In the "Packages" tab, search for "linter-autocomplete-jing" and click the "Settings" button.)

## Commands

* *linter-autocomplete-jing:clear-schema-cache*: Removes all schema and catalog data from the in-memory cache so it will get read from disk in the next validation run.

## File types

Validation and autocomplete get activated when the current file's grammar scope includes an item starting with `text.xml`. The Atom core package [language-xml](https://atom.io/packages/language-xml) (installed by default) assigns a large set of common XML file extensions to `text.xml` and `text.xml.xsl`. XML property lists (`text.xml.plist`) are supported by another core package, [language-property-list](https://atom.io/packages/language-property-list).

If a file extension you're working with isn't included in `language-xml` or any grammar derived from `text.xml` you can either request adding the extension at https://github.com/atom/language-xml or create a local association in your `config.cson`:

1. Open `config.cson` by pressing <kbd>Ctrl-Shift-P</kbd> and then entering `Open Your Config`
2. Add or extend the `customFileTypes` property of `core`

The following example assigns the `.tei`, `.mei` and `.odd` extensions to `text.xml`:  

```
  core:
    customFileTypes:
      "text.xml": [
        "tei"
        "mei"
        "odd"
      ]
```

A second way of supporting custom file extensions is creating a new grammar package based on `text.xml` and specifying the extensions in the grammar definition. An example can be found in the [demo package](https://github.com/aerhard/xml-demo-package).

## Specifying Schemata

You can specify schemata by providing a DOCTYPE declaration, XSI schema instance attributes or xml-model processing instructions; see https://github.com/aerhard/linter-autocomplete-jing/tree/master/spec/validation/xml for a collection of examples).   
If your documents contain references to remote schemata, you can improve performance and reduce network traffic by using an XML catalog file to map remote resources to local files. Projects like the Text Encoding Initiative (TEI) provide [packages](https://sourceforge.net/projects/tei/files/TEI-P5-all/) which include catalog files that can be added to the linter settings.

## Development

If you intend to adjust only the JavaScript part of the code, uninstall then linter-autocomplete-jing package in Atom, checkout https://github.com/aerhard/linter-autocomplete-jing from GitHub and link it to Atom by running `apm link` from the repository root (undo with `apm unlink`). The ES6 source code is in the `src` folder of the project. `npm run build` and `npm run watch` transpile the content of `src` to a single CoffeeScript file in `lib` which gets exposed to Atom. Both commands depend on Rollup (`npm i rollup -g`).
Press <kbd>Ctrl-Alt-R</kbd> in Atom to reload the updated module.

In order to make adjustments to the JavaScript as well as as the Java parts, checkout https://github.com/aerhard/xml-tools and follow the instructions in the README file.
