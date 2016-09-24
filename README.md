# linter-autocomplete-jing

[![Travis CI Status](https://travis-ci.org/aerhard/linter-autocomplete-jing.svg?branch=master)](https://travis-ci.org/aerhard/linter-autocomplete-jing)
[![Appveyor CI Status](https://ci.appveyor.com/api/projects/status/github/aerhard/linter-autocomplete-jing?branch=master&svg=true)](https://ci.appveyor.com/project/aerhard/linter-autocomplete-jing)
[![Circle CI Status](https://circleci.com/gh/aerhard/linter-autocomplete-jing/tree/master.svg?style=shield&circle-token=93c48cdbcad41ba1b7cd08f231286b94b195de53)](https://circleci.com/gh/aerhard/linter-autocomplete-jing)
[![Dependencies](https://david-dm.org/aerhard/linter-autocomplete-jing.svg)](https://david-dm.org/aerhard/linter-autocomplete-jing)

Autocomplete and on-the-fly validation of XML documents in Atom.

Supported schema types:

* *Validation*: RELAX NG (XML and compact syntax), Schematron (1.5, ISO), W3C Schema (XSD 1.0) and DTD
* *Autocomplete*: RELAX NG (XML and compact syntax), W3C Schema (XSD 1.0)

XML document processing is handled in Java by [an extended version of Jing](https://github.com/aerhard/jing-trang), Saxon HE and Xerces.

## Installation

Run `apm install linter-autocomplete-jing` or select the package in Atom's Settings view / Install Packages.

The package depends on a Java Runtime Environment (JRE) v1.6 or above. If running `java -version` on the command line returns an appropriate version number, you should be set. Otherwise, install a recent JRE and provide the path to the Java executable either in the PATH environment variable or in the linter-autocomplete-jing package settings in Atom.

## Settings

* *Java Executable Path:* The path to the Java executable (`java`).
* *JVM Arguments:* Space-separated list of arguments to get passed to the Java Virtual Machine on which the validation server is run.
* *Schema Cache Size:* The maximum number of schemata retained simultaneously in memory. (There is a -- now fixed -- bug in a recent version of Atom's Settings View preventing users from setting 0 as a value in numeric fields, see the discussion at https://github.com/atom/settings-view/issues/783).
* *Display Schema Parser Warnings:* Whether or not to display warning messages from the schema parser.
* *XML Catalog:* The path to the XML Catalog file to be used in validation.
* *Autocomplete Priority*: The inclusion priority of the Autocomplete Plus provider. In order to exclude other autocomplete providers, the number must be larger than the other providers' priorities. Defaults to 2.
* *Autocomplete Scope*: The schema types which should be used for autocomplete.

(In order to edit the settings, open Atom's settings view by pressing <kbd>Ctrl-,</kbd> or by selecting "Packages" / "Settings View" / "Open" in the main menu). In the "Packages" tab, search for "linter-autocomplete-jing" and click the "Settings" button.)

## Commands

* *linter-autocomplete-jing:clear-schema-cache*: Removes all schema and catalog data from the in-memory cache so it will get read from disk in the next validation run.

## File types

Validation and autocomplete get activated when the document in the active editor tab has one of the following grammars: `text.xml`, `text.xml.xsl`, `text.xml.plist` or `text.mei`. The Atom core package [language-xml](https://atom.io/packages/language-xml) (installed by default) assigns a large set of common XML file extensions to `text.xml` and `text.xml.xsl`. XML property lists are supported by another core package, [language-property-list](https://atom.io/packages/language-property-list). In order to associate `.mei` files with `text.mei`, install [language-mei](https://atom.io/packages/language-xml).

Send a pull request or create an issue on the [Github page of this package](https://github.com/aerhard/linter-autocomplete-jing) when you would like to extend the list of supported grammars. If there's no grammar available for a specifiy file name extension, you can either request to extend the list at https://github.com/atom/language-xml or create a local association in your `config.cson`:

1. Open `config.cson` by pressing <kbd>Ctrl-Shift-P</kbd> and then entering `Open Your Config`
2. Add or extend the `customFileTypes` property of `core`

The following example assigns the `.tei` and `.odd` extensions to `text.xml`:  

```
  core:
    customFileTypes:
      "text.xml": [
        "tei"
        "odd"
      ]
```

## Specifying Schemata

You can specify schemata by providing a DOCTYPE declaration, XSI schema instance attributes or xml-model processing instructions; see https://github.com/aerhard/linter-autocomplete-jing/tree/master/spec/validation/xml for a collection of examples).   
If your documents contain references to remote schemata, you can improve performance and reduce network traffic by using an XML catalog file to map remote resources to local files. Projects like the Text Encoding Initiative (TEI) provide [packages](https://sourceforge.net/projects/tei/files/TEI-P5-all/) which include catalog files that can be added to the linter settings.

## Development

While developing, run `npm run watch` to transpile the ES6 code in `src` to ES5 in `lib`.
