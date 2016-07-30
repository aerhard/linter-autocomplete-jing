<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<schema xmlns="http://purl.oclc.org/dsdl/schematron" queryBinding="xslt2">
  <ns prefix="example" uri="http://www.example.com"/>
  <pattern id="root-child">
    <rule context="example:root">
      <assert test="count(*) = 1">The root element may only contain one child element.</assert>
    </rule>
  </pattern>
  <pattern id="child-att">
    <rule context="example:child">
      <assert test="@x='a'">A child element must contain an x attribute with value 'a'.</assert>
    </rule>
  </pattern>
  <diagnostics/>
</schema>
