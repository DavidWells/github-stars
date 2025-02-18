---
repo: elierotenberg/react-css
name: react-css
homepage: NA
url: https://github.com/elierotenberg/react-css
stars: 35
starredAt: 2015-02-09T22:37:39Z
description: |-
    Converts plain CSS into (optionally auto-prefixed) React-style properties map.
---

react-css
=========
Converts plain CSS into (optionally auto-prefixed) React-style properties map.

Usage
=====
```js
/** @jsx React.DOM */
var React = require("react");
var fromCSS = require("react-css").fromCSS;

/* Pre-compute the CSS to avoid lengthy calculations at each render cycle */
var myComponentStyle = fromCSS("{ opacity: 0.5; }");

var MyComponent = React.createClass({
	render: function() {
		return (
			<div style={myComponentStyle}>
				/* ... */
			</div>
		);
	},
});
/* ... */
```
