'use strict';

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const Funnel = require('broccoli-funnel');
const faPath = path.dirname(require.resolve('@fortawesome/fontawesome-free/package.json'));

module.exports = {
  name: require('./package').name,

  treeForVendor() {
    // Get configured fontFormats
    let fontFormats = this.fontAwesomeCssConfig.fontFormats || ['eot', 'svg', 'ttf', 'woff', 'woff2', 'otf'];
    let fontFormatsString = fontFormats.join(',');

    let fontFormatPattern;
    if (fontFormats.length > 1) {
      fontFormatPattern = `*.{${fontFormatsString}}`;
    } else {
      fontFormatPattern = `*.${fontFormatsString}`;
    }
    // Funnel required font types
    return new Funnel(faPath, {
      destDir: 'fontawesome',
      include: ['css/*', `webfonts/${fontFormatPattern}`]
    });
  },

  included(app, parentAddon) {

    while (typeof app.import !== 'function' && (app.app || app.parent)) {
      app = app.app || app.parent;
    }

    // if app.import and parentAddon are blank, we're probably being consumed by an in-repo-addon
    // or engine, for which the "bust through" technique above does not work.
    if (typeof app.import !== 'function' && !parentAddon) {
      if (app.registry && app.registry.app) {
        app = app.registry.app;
      }
    }

    if (!parentAddon && typeof app.import !== 'function') {
      throw new Error('ember-fontawesome-css is being used within another addon or engine and is' +
        ' having trouble registering itself to the parent application.');
    }

    this.app = app;
    this._super.included.call(this, app);

    let target = (parentAddon || app);
    target.options = target.options || {};
    this.fontAwesomeCssConfig = target.options['ember-fontawesome-css'] || {};

    let cssPath = 'vendor/css';
    let fontsPath = 'vendor/webfonts';
    let fontsFolderPath = '/webfonts';
    let absoluteFontsPath = path.join(faPath, 'webfonts');

    // Import CSS directly
    let files = this.fontAwesomeCssConfig.cssFiles || ['fontawesome', 'solid', 'regular', 'brands'];
    files.forEach((file) => {
      target.import( { development: path.join(cssPath, file+'.css'), production: path.join(cssPath, file+'.min.css') } );
    });

    // Import all files in the fonts folder when option not defined or enabled
    if (!('includeFontFiles' in this.fontAwesomeCssConfig) || this.fontAwesomeCssConfig.includeFontFiles) {
      // Get all of the font files
      let fontsToImport = fs.readdirSync(absoluteFontsPath);
      let filesInFonts  = []; // Bucket for filenames already in the fonts folder
      let fontsSkipped  = []; // Bucket for fonts not imported because they already have been

      // Find files already imported into the fonts folder
      (target.otherAssetPaths || []).forEach(function(asset){
        if (asset.dest && asset.dest.indexOf('/webfonts') !== -1) {
          filesInFonts.push(asset.file);
        }
      });

      // Attempt to import each font, if not already imported
      fontsToImport.forEach(function(fontFilename){
        if (filesInFonts.indexOf(fontFilename) > -1) {
          fontsSkipped.push(fontFilename);
        } else {
          target.import(path.join(fontsPath, fontFilename), { destDir: fontsFolderPath });
        }
      });

      // Fonts that had already been imported, so we skipped..
      if (fontsSkipped.length) {
        this.ui.writeLine(chalk.red(
          this.name + ': Fonts already imported into the "/fonts" folder [' + fontsSkipped.join(', ') +
          '] by another addon or in your ember-cli-build.js, disable the import ' +
          'from other locations or disable the Font Awesome import by setting ' +
          '`includeFontFiles:false` for the "' + this.name + '" options in your ember-cli-build.js'
        ));
      }
    }
  }

};
