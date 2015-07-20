var fs = require('fs');
var _ = require('underscore');
var CleanCss = require('clean-css');
var CssSyntaxTree = require('./cssAst.js');
var Extraction = require('./extraction.js');

////////////////////
// ARGUMENTS
// files    = an array of filepaths to html/js files OR a raw string of content to search through
// css      = an array of filepaths to css files OR a raw string of css to filter
// options  = (optional) {
//   write  : string (filepath to write purified css to. if false, function returns raw string)
//   minify : boolean (if true, will minify the purified css)
//   info   : boolean (if true, will log out stats of how much css was reduced)
// }
// callback = (optional) a function that the purified css will be passed into
////////////////////

var DEFAULT_OPTIONS = {
  write: false,
  minify: false,
  info: false
};

var purify = function(searchThrough, css, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};
  options = _.extend({}, DEFAULT_OPTIONS, options);

  var cssString = Array.isArray(css) ? concatFiles(css) : css;
  var content = Array.isArray(searchThrough) ? concatFiles(searchThrough) : searchThrough;
  content = reduceContent(content.toLowerCase());

  // Save these to give helpful info at the end
  var beginningLength = cssString.length;
  var startTime = new Date();

  // Turn css into abstract syntax tree
  var tree = new CssSyntaxTree(cssString, css[0]);

  // Narrow list down to things that are found in content
  setTimeout(function() {
    var extraction = new Extraction(content);
    var classes = extraction.filter(tree.classes);
    var specialClasses = extraction.filterBySearch(tree.specialClasses);
    var ids = extraction.filter(tree.ids);
    var specialIds = extraction.filterBySearch(tree.specialIds);
    var attrSelectors = extraction.filterBySearch(tree.attrSelectors);

    classes = classes.concat(specialClasses);
    ids = ids.concat(specialIds);
    var usedHtmlEls = extraction.filter(htmlEls);

    // Narrow CSS tree down to things that remain on the list
    var rejectedSelectorTwigs = tree.filterSelectors(classes, usedHtmlEls, ids, attrSelectors);
    var rejectedAtRuleTwigs = tree.filterAtRules(classes, usedHtmlEls, ids, attrSelectors);

    // Turn tree back into css
    var source = tree.toSrc();

    if (options.minify) {
      source = new CleanCss().minify(source).styles;
    }

    if (options.info) {
      printInfo(startTime, beginningLength, source.length);
    }

    if (options.rejected) {
      printRejected(rejectedSelectorTwigs.concat(rejectedAtRuleTwigs));
    }

    if (!options.output) {
      return callback ? callback(source) : source;
    } else {
      fs.writeFile(options.output, source, function(err) {
        if (err) return err;
      });
    }
  }, 1000);
};

module.exports = purify;

var concatFiles = function(files) {
  return files.reduce(function(total, file) {
    return total + fs.readFileSync(file, 'utf8') + ' ';
  }, '');
};

var reduceContent = function(content) {
  return content
    .split('\n').join('')
    .replace(/\s\s+/g, ' ');
};

var getRuleString = function(twig) {
  var ruleString = '';
  for (var i = 1; i < twig.length; i++) {
    var rulePart = twig[i];
    switch (rulePart[0]) {
      case 's':
        ruleString += rulePart[1] !== '\n' ? rulePart[1] : '';
        break;
      case 'clazz':
        ruleString += '.' + rulePart[1][1];
        break;
      case 'shash':
        ruleString += '#' + rulePart[1];
        break;
      case 'ident':
        ruleString += rulePart[1];
        break;
      case 'attrib':
        ruleString += '[' + rulePart[1][1] + ']';
        break;
      default:
        ruleString += 'Unsupported: ' + JSON.stringify(twig);
    }
  }
  return ruleString;
};

var printInfo = function(startTime, beginningLength, endingLength) {
  console.log('##################################');
  console.log('Before purify, CSS was ' + beginningLength + ' chars long.');
  console.log('After purify, CSS is ' + endingLength + ' chars long. (' +
    Math.floor((beginningLength / endingLength * 10)) / 10 + ' times smaller)');
  console.log('##################################');
  console.log('This function took: ', new Date() - startTime, 'ms');
};

var printRejected = function(rejectedTwigs) {
  console.log('##################################');
  console.log('Rejected selectors:');
  console.log(_.map(rejectedTwigs, getRuleString).join('\n'));
  console.log('##################################');
}

var htmlEls = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'abbr', 'acronym', 'address', 'applet', 'area', 'article', 'aside', 'audio', 'b', 'base', 'basefont', 'bdi', 'bdo', 'bgsound', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'command', 'content', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'frame', 'frameset', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'image', 'img', 'input', 'ins', 'isindex', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'listing', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meta', 'meter', 'multicol', 'nav', 'nobr', 'noembed', 'noframes', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'plaintext', 'pre', 'progress', 'q', 'rp', 'rt', 'rtc', 'ruby', 's', 'samp', 'script', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr', 'xmp'];
