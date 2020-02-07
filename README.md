ember-fontawesome-css
==============================================================================

Quick and dirty Font Awesome 5+ CSS Ember add-on.

This packages the free Font Awesome 5 fonts+css as an Ember add-on, so that they
can be used in your Ember app.

Note that this will (hopefully) become obselete when the official ember-fontawesome
project supports the non-js version of the font library.

Based on code from https://github.com/martndemus/ember-font-awesome.

Compatibility
------------------------------------------------------------------------------

* Ember.js v3.4 or above
* Ember CLI v2.13 or above
* Node.js v8 or above


Installation
------------------------------------------------------------------------------

```
ember install ember-fontawesome-css
```


Usage
------------------------------------------------------------------------------

Add this package to your package.json along with whatever version of the
fontawesome-free library that you want to use. For example:

```
"devDependencies": {
  ...
  "ember-fontawesome-css": "^1.0.0",
  "@fortawesome/fontawesome-free": "^5.12.1",
}
```

You can optionally configure the following by adding one or more of these values
to your ember-cli-build.js:

```
"ember-fontawesome-css": {
  includeFontFiles: <true/false>
  cssFiles: <list of css file names to include>
  fontFormats: <list of font files to include, by extension>
}
```

* `includeFontFiles` - Set this to false if you include the font files another way
and don't want them to be included with this add-on.
  * Default: true
* `cssFiles` - A list of CSS files to include from Font Awesome in your build.
If they change the file names (or you don't need the regular fonts, for example), 
you can specify this.
  * Default: ['fontawesome', 'solid', 'regular'])
* `fontFormats` - A list of font files to include in your build.
  * Default: ['eot', 'svg', 'ttf', 'woff', 'woff2', 'otf']
  
After including the package, you should be able to rebuild your project and add
a font tag such as `<i class='fas fa-thumbs-up'></i>` to get an icon.

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
