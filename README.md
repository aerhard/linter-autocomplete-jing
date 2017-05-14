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

You can find a basic set of common XML schemata and corresponding rules for linter-autocomplete-jing in the [xml-common-schemata](https://atom.io/packages/xml-common-schemata) package.  

XML document processing is handled in Java using [Jing](https://github.com/aerhard/jing-trang), [Xerces](http://xerces.apache.org/xerces2-j/) and [Saxon HE](http://saxon.sourceforge.net/). For the source code of the Java part see https://github.com/aerhard/xml-tools.

## Installation

Select the package in Atom's Settings View (<kbd>Ctrl-,</kbd>) / Install Packages or run `apm install linter-autocomplete-jing` from the command line.

The package depends on a Java Runtime Environment (JRE) v1.6 or above. If running `java -version` on the command line returns an appropriate version number, you should be set. Otherwise, install a recent JRE and provide the path to the Java executable either in the PATH environment variable or in the linter-autocomplete-jing package settings in Atom.

## Package Settings

| Settings Form                  | Atom Config Property  | Description  |
|--------------------------------|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Java Executable Path           | javaExecutablePath    | The path to the Java executable (`java`). |
| JVM Arguments                  | jvmArguments          | Space-separated list of arguments to get passed to the Java Virtual Machine on which the validation server is run. |
| Schema Cache Size              | schemaCacheSize       | The maximum number of schemata retained simultaneously in memory. |
| Display Schema Parser Warnings | displaySchemaWarnings | Whether or not to display warning messages from the schema parser. |
| XML Catalog                    | xmlCatalog            | The path to the XML Catalog file to be used in validation. |
| DTD Validation                 | dtdValidation         | Determines under which circumstances DTDs should be used in validation. Possible values: 'always', 'never' or 'only as fallback'. When 'only as fallback' is selected, documents get validated against DTDs only if no other schemata are available for validation. |
| XInclude Aware                 | xIncludeAware         | Whether or not validation should resolve XIncludes in the instance document. XInclude-aware validation is currently not supported in DTD-based validation. If this option is set to 'true' and your documents contain or refer to DOCTYPE declarations, you can prevent DTD error messages by adjusting the DTD Validation option. |
| XInclude Fixup Base URIs       | xIncludeFixupBaseUris | Whether or not xml:base attributes should be added / adjusted in documents included with XInclude statements. |
| XInclude Fixup Language       | xIncludeFixupLanguage | Whether or not xml:lang attributes should be added / adjusted in documents included with XInclude statements. |
| Autocomplete Priority          | autocompletePriority  | The inclusion priority of the Autocomplete Plus provider. In order to exclude other autocomplete providers, the number must be larger than the other providers' priorities. Defaults to 1 (In order to suppresses the default tag snippets provided by the `language-xml` package, set autocomplete priority to 2.) |
| Autocomplete Scope             | autocompleteScope     | The schema types which should be used for autocomplete. |
| Wildcard Suggestions           | wildcardSuggestions   | Inclusion of wildcards in autocomplete suggestions. Possible values: 'all', 'localparts', 'none'. |

(In order to edit the settings, press <kbd>Ctrl-,</kbd> or select "Packages" / "Settings View" / "Open" in the main menu. Then either navigate to the settings form ("Packages" tab, search for "linter-autocomplete-jing" and click the "Settings" button) or click the link to Atom's config file.

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

### Schema References in Source Documents

You can specify schemata by providing a DOCTYPE declaration, XSI schema instance attributes or xml-model processing instructions; see https://github.com/aerhard/linter-autocomplete-jing/tree/master/spec/validation/xml for a collection of examples).   
If your documents contain references to remote schemata, you can improve performance and reduce network traffic by using an XML catalog file to map remote resources to local files. Projects like the Text Encoding Initiative (TEI) provide [packages](https://sourceforge.net/projects/tei/files/TEI-P5-all/) which include catalog files that can be added to the linter settings.

### Schema Rules

If you'd like to avoid providing schema hints in each individual source document you can specify 'validation rules' in Atom's `config.cson` or in a separate Atom package.

Here are two demo rules, the first of which associates files ending with `.rng` with an RNG schema at `/path/to/relaxng.rng`, the second associating the root element namespace `urn:oasis:names:tc:entity:xmlns:xml:catalog` with the RNC schema at `/path/to/catalog.rnc`:

```
"linter-autocomplete-jing":
  rules: [
    {
      priority: 1
      test:
        pathRegex: "\\.rng$"
      outcome:
        schemaProps: [
          {
            lang: "rng"
            path: "/path/to/relaxng.rng"
          }
        ]
    }
    {
      priority: 1
      test:
        rootNs: "urn:oasis:names:tc:entity:xmlns:xml:catalog"
      outcome:
        schemaProps: [
          {
            lang: "rnc"
            path: "/path/to/catalog.rnc"
          }
        ]
    }
  ]
```

Each rule must contain a `test`, an `outcome` and a `priority` property. `test` contains the criteria which need to be fulfilled for that rule to apply. `outcome` contains the schema / catalog information to be used when the rule is matched. When there are multiple rules, the `outcome` of the first matched rule gets applied (order is significant). Rules with higher `priority` get evaluated first, rules with the same priority get evaluated in the order in which they are specified. Rules in `config.cson` always take precedence over rules from packages.

Possible properties of `test`:

* `pathRegex`: a regular expression string matching the full path of the current file
* `rootNs`: the namespace of the root element (string)
* `rootLocalName`: the localname of the root element (string)
* `rootAttributes`: the required attributes of the root element (object with attribute names as keys and expected attribute values as values)
* `publicId`: the Public ID specified in the DOCTYPE declaration

Possible properties of `outcome`:

* `dtdValidation`: (see above for possible values)
* `xIncludeAware`: whether or not validation should resolve XIncludes in the instance document (boolean)
* `xIncludeFixupBaseUris`: whether or not xml:base attributes should be added / adjusted in documents included with XInclude statements (boolean)
* `xIncludeFixupLanguage`: whether or not xml:lang attributes should be added / adjusted in documents included with XInclude statements (boolean)
* `xmlCatalog`: (see above for possible values)
* `schemaProps`: the schemata to be used in validation (array of objects with the properties `lang` and `path`. `path` specifies the file path of the schema, `lang` the schema language which must be one of 'rng', 'rnc', 'sch.iso', 'sch.15', 'xsd' or 'none')

For an example of an Atom package containing a schema and schema association rules see [demo package](https://github.com/aerhard/xml-demo-package).  

## Commands

* *linter-autocomplete-jing:clear-schema-cache*: Removes all schema and catalog data from the in-memory cache so it will get read from disk in the next validation run.


## Development

If you intend to adjust only the JavaScript part of the code, uninstall then linter-autocomplete-jing package in Atom, checkout https://github.com/aerhard/linter-autocomplete-jing from GitHub and link it to Atom by running `apm link` from the repository root (undo with `apm unlink`). The ES6 source code is in the `src` folder of the project. `npm run build` and `npm run watch` transpile the content of `src` to a single CoffeeScript file in `lib` which gets exposed to Atom. Both commands depend on Rollup (`npm i rollup -g`).
Press <kbd>Ctrl-Alt-R</kbd> in Atom to reload the updated module.

In order to make adjustments to the JavaScript as well as as the Java parts, checkout https://github.com/aerhard/xml-tools and follow the instructions in the README file.
