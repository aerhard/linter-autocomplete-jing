<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<schema xmlns="http://www.ascc.net/xml/schematron">
  <ns prefix="example" uri="http://www.example.com"/>
  <pattern name="root-child">
    <rule context="example:root">
      <assert test="count(*) = 1">The root element may only contain one child element.</assert>
    </rule>
  </pattern>
  <pattern name="child-att">
    <rule context="example:child">
      <assert test="@x='a'">A child element must contain an x attribute with value 'a'.</assert>
    </rule>
  </pattern>
  <diagnostics/>
</schema>
