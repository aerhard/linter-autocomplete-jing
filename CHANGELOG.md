## 0.1.0
* Initial release

### 0.1.1
* Fix schema warning message format
* Make schema warning display optional, hidden by default
* Update dependencies

### 0.1.2
* Fix message parsing on Windows

## 0.2.0
* add support for `text.xml.xsl` and `text.xml.plist` grammar scopes
* add DTD support

## 0.3.0
* add XML catalog support

### 0.3.2
* fix supported Atom version range
* add prefix to schema / catalog error messages and render them as as warnings

### 0.3.3
* extend documentation

## 0.4.0
* support Schematron rules embedded in RNG and XSD files
* improve performance by moving Java validation to a socket server
* improve error messages

### 0.4.1
* fix bug in socket communication

### 0.4.2
* update validation server (fix error message output bug in Java)
* fix schema error highlighting in editor
* display schema language in linter messages

### 0.4.3
* avoid duplicate XML Parser error messages

## 0.5.0
* add autocomplete on basis of XSD, RNG and RNC schemata
* rename package as linter-autocomplete-jing
* improve linter messages
* replace 'http' with private URI scheme in tests to prevent failing tests caused by timeouts
* update dependencies

### 0.5.1
* auto-generate autocomplete test descriptions
* properly kill server process after tests
* support encodings other than UTF-8
* provide additional suggestions for element / attribute wildcards

### 0.5.2
* fix bug in XSD suggestions

### 0.5.3
* fix bug causing suggestions with xmlns="null"
* add comment and cdata suggestions
* prevent autocomplete in cdata sections

## 0.6.0
* insert self-closing tags when element content can only be empty
* make validation on basis of DTDs optional
* implement validation rule processing
* support hot-reloading of code after updates
* XSD-based suggestions: support substitution groups, take abstract elements into account, suggest xsi:nil
* fix parser exceptions not being reported in schema validation

### 0.6.1
* fix: support spaces in XSD schema references

## 0.7.0
* suggest IDs and KEYs in RNG and XSD autocomplete

### 0.7.1
* make schemaProps in rule outcome optional
* add publicId to rule tests

### 0.7.2
* fix attribute matching

## 0.8.0
* support XInclude-aware RNG, XSD and Schematron validation

### 0.8.1
* refactor
* update dev dependencies

### 0.8.2
* prevent path.dirname warning in recent Atom versions
