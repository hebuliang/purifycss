var _ = require('underscore');

var Extraction = function(content){
  this.content = content;

  // Get hash of word-parts appearing in content
  this.contentWords = getAllUsedWords(content);
};

module.exports = Extraction;

Extraction.prototype.filter = function(words){
  return _.filter(words, function(word){
    var splitWord = word.toLowerCase().split('-');

    if(splitWord.length === 1){
      return this.contentWords[word];
    } else {
      return this.contentWords[word] ||
             _.every(splitWord, function(part){
               return this.contentWords[part] || this.contentWords[part + '-'] ||
                      this.contentWords['-' + part + '-'] || this.contentWords['-' + part];
             }.bind(this));
    }
  }.bind(this));
};

Extraction.prototype.filterBySearch = function(words){
  return _.filter(words, function(word){
    return this.content.indexOf(word.replace(/\\/g, '')) > -1;
  }.bind(this));
};

var getAllUsedWords = function(content){
  var used = {};
  var word = "";

  for(var i = 0; i < content.length; i++){
    var chr = content[i];

    if(chr.match(/^[\w-]+$/)){
      word += chr;
    } else {
      used[word] = true;
      word = "";
    }
  }

  used[word] = true;

  return used;
};
