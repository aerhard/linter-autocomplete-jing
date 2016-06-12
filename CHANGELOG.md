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
