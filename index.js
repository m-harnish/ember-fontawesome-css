'use strict';

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const faPath = path.dirname(require.resolve('@fortawesome/fontawesome-free/package.json'));

module.exports = {
  name: require('./package').name,

  treeForVendor(tree) {
    let trees = [];

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
    let funnel = new Funnel(faPath, {
      destDir: 'fontawesome',
      include: ['css/*', `webfonts/${fontFormatPattern}`]
    });

    trees.push(funnel);
    if (tree) trees.push(tree);

    return new MergeTrees(trees);
  },

  included() {
    this._super.included.apply(this, arguments);

    let app = this._findHost(this);
    this.app = app;

    let target = app;
    target.options = target.options || {};
    this.fontAwesomeCssConfig = target.options['ember-fontawesome-css'] || {};

    let cssPath = 'vendor/fontawesome/css';
    let fontsPath = 'vendor/fontawesome/webfonts';
    let fontsFolderPath = '/webfonts';
    let absoluteFontsPath = path.join(faPath, 'webfonts');

    // Import CSS directly
    let files = this.fontAwesomeCssConfig.cssFiles || ['fontawesome', 'solid', 'regular', 'brands'];
    files.forEach((file) => {
      target.import( { development: path.join(cssPath, `${file}.css`),
                       production: path.join(cssPath, `${file}.min.css`) } );
    });

    // Import all files in the fonts folder when option not defined or enabled
    if (!('includeFontFiles' in this.fontAwesomeCssConfig) || this.fontAwesomeCssConfig.includeFontFiles) {
      // Get all of the font files
      let fontsToImport = fs.readdirSync(absoluteFontsPath);
      let filesInFonts  = []; // Bucket for filenames already in the fonts folder
      let fontsSkipped  = []; // Bucket for fonts not imported because they already have been

      // Find files already imported into the fonts folder
      (target.otherAssetPaths || []).forEach(function(asset) {
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
          `${this.name}: Fonts already imported into the "/fonts" folder [${fontsSkipped.join(', ')}] by another addon or in your ember-cli-build.js, ` +
          `disable the import from other locations or disable the Font Awesome import by setting \`includeFontFiles:false\` for the "${this.name}" ` +
          `options in your ember-cli-build.js`
        ));
      }
    }
  }

};
