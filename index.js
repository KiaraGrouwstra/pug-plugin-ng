var characterParser = require('character-parser');

// Angular 2's opening brackets -- a sign a new attribute key has started
const ng2Re = /[*#([]/;

module.exports = {
  lex: {
    attrs: function () {
      return attrs.call(...arguments);
    }
  }
};

// *** REPLACED PART: ***
// // a part of the value
// return !characterParser.isPunctuator(str[x]) || quoteRe.test(str[x]);
// *** REPLACED WITH: ***
// // a part of the value,  unless it's an Angular2 opening bracket
// return !characterParser.isPunctuator(str[x]) || quoteRe.test(str[x]) || ng2Re.test(str[x]);

// adjusted from `attrs` at [pug-lexer](https://github.com/pugjs/pug-lexer/blob/master/index.js)
var attrs = function() {
  if ('(' == this.input.charAt(0)) {
    var startingLine = this.lineno;
    this.tokens.push(this.tok('start-attributes'));
    var index = this.bracketExpression().end
      , str = this.input.substr(1, index-1);

    this.incrementColumn(1);
    this.assertNestingCorrect(str);

    var quote = '';
    var self = this;

    this.consume(index + 1);

    var whitespaceRe = /[ \n\t]/;
    var quoteRe = /['"]/;

    var escapedAttr = true
    var key = '';
    var val = '';
    var state = characterParser.defaultState();
    var lineno = startingLine;
    var colnoBeginAttr = this.colno;
    var colnoBeginVal;
    var loc = 'key';
    var isEndOfAttribute = function (i) {
      // if the key is not started, then the attribute cannot be ended
      if (key.trim() === '') {
        colnoBeginAttr = this.colno;
        return false;
      }
      // if there's nothing more then the attribute must be ended
      if (i === str.length) return true;

      if (loc === 'key') {
        if (whitespaceRe.test(str[i])) {
          // find the first non-whitespace character
          for (var x = i; x < str.length; x++) {
            if (!whitespaceRe.test(str[x])) {
              // starts a `value`
              if (str[x] === '=' || str[x] === '!') return false;
              // will be handled when x === i
              else if (str[x] === ',') return false;
              // attribute ended
              else return true;
            }
          }
        }
        // if there's no whitespace and the character is not ',', the
        // attribute did not end.
        return str[i] === ',';
      } else if (loc === 'value') {
        // if the character is in a string or in parentheses/brackets/braces
        if (state.isNesting() || state.isString()) return false;
        // if the current value expression is not valid JavaScript, then
        // assume that the user did not end the value
        if (!self.assertExpression(val, true)) return false;
        if (whitespaceRe.test(str[i])) {
          // find the first non-whitespace character
          for (var x = i; x < str.length; x++) {
            if (!whitespaceRe.test(str[x])) {
              // if it is a JavaScript punctuator, then assume that it is
              // a part of the value, unless it's an Angular2 opening bracket
              return !characterParser.isPunctuator(str[x]) || quoteRe.test(str[x]) || ng2Re.test(str[x]);
            }
          }
        }
        // if there's no whitespace and the character is not ',', the
        // attribute did not end.
        return str[i] === ',';
      }
    }

    for (var i = 0; i <= str.length; i++) {
      if (isEndOfAttribute.call(this, i)) {
        if (val.trim()) {
          var saved = this.colno;
          this.colno = colnoBeginVal;
          this.assertExpression(val);
          this.colno = saved;
        }

        val = val.trim();

        if (key[0] === ':') this.incrementColumn(-key.length);
        else if (key[key.length - 1] === ':') this.incrementColumn(-1);
        if (key[0] === ':' || key[key.length - 1] === ':') {
          this.error('COLON_ATTRIBUTE', '":" is not valid as the start or end of an un-quoted attribute.');
        }
        key = key.trim();
        key = key.replace(/^['"]|['"]$/g, '');

        var tok = this.tok('attribute');
        tok.name = key;
        tok.val = '' == val ? true : val;
        tok.col = colnoBeginAttr;
        tok.mustEscape = escapedAttr;
        this.tokens.push(tok);

        key = val = '';
        loc = 'key';
        escapedAttr = false;
        this.lineno = lineno;
      } else {
        switch (loc) {
          case 'key-char':
            if (str[i] === quote) {
              loc = 'key';
              if (i + 1 < str.length && !/[ ,!=\n\t]/.test(str[i + 1]))
                this.error('INVALID_KEY_CHARACTER', 'Unexpected character "' + str[i + 1] + '" expected ` `, `\\n`, `\t`, `,`, `!` or `=`');
            } else {
              key += str[i];
            }
            break;
          case 'key':
            if (key === '' && quoteRe.test(str[i])) {
              loc = 'key-char';
              quote = str[i];
            } else if (str[i] === '!' || str[i] === '=') {
              escapedAttr = str[i] !== '!';
              if (str[i] === '!') {
                this.incrementColumn(1);
                i++;
              }
              if (str[i] !== '=') this.error('INVALID_KEY_CHARACTER', 'Unexpected character ' + str[i] + ' expected `=`');
              loc = 'value';
              colnoBeginVal = this.colno + 1;
              state = characterParser.defaultState();
            } else {
              key += str[i]
            }
            break;
          case 'value':
            state = characterParser.parseChar(str[i], state);
            val += str[i];
            break;
        }
      }
      if (str[i] === '\n') {
        // Save the line number locally to keep this.lineno at the start of
        // the attribute.
        lineno++;
        this.colno = 1;
        // If the key has not been started, update this.lineno immediately.
        if (!key.trim()) this.lineno = lineno;
      } else if (str[i] !== undefined) {
        this.incrementColumn(1);
      }
    }

    // Reset the line numbers based on the line started on
    // plus the number of newline characters encountered
    this.lineno = startingLine + (str.match(/\n/g) || []).length;

    this.tokens.push(this.tok('end-attributes'));
    this.incrementColumn(1);
    return true;
  }
}
