// lets read the process.stdin stream :)
process.stdin.resume();
process.stdin.setEncoding('utf8');

var INTEGER = 'INTEGER',
    PLUS = 'PLUS',
    EOF = 'EOF';

function IsNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

Token = function(type, value){
  this.type = null;
  this.value = null;
  
  this.init = function(type, value) {
    this.type = type;
    this.value = value;
  };

  this.__str__ = function() {
    return 'Token(' + this.type + ', ' + this.value + ')';
  };

  this.__repr__ = function() {
    return this.__str__();
  };

  this.init(type, value);
};

var Interpreter = function(text){
  // client string input, e.g. "3+5"
  this.text = null;
  // index into this.text
  this.pos = null;
  // current token instance
  this.current_token = null;

  this.init = function(text) {
    this.text = text;
  };

  this.error = function() {
    throw new Error('Error parsing input');
  };

  /*
  Lexical analyzer (also known as scanner or tokenizer)

  This method is responsible for breaking a sentence
  apart into tokens. One token at a time.
  */
  this.get_next_token = function() {

    // is this.pos index past the end of the this.text ?
    // if so, then return EOF token because there is no more
    // input left to convert into tokens
    
    current_char = this.text.charAt(this.pos);

    // if the character is a digit then convert it to
    // integer, create an INTEGER token, increment this.pos
    // index to point to the next character after the digit,
    // and return the INTEGER token

    if (this.pos >= this.text.length) {
      return new Token(EOF, null);
    }

    if (IsNumeric(current_char)) {
      token = new Token(INTEGER, parseInt(current_char, 10));
      this.pos++;
      return token;
    }

    if (current_char == '+') {
      token = new Token(PLUS, current_char);
      this.pos++;
      return token;
    }

    this.error();
  };

  this.eat = function(token_type) {
    // compare the current token type with the passed token
    // type and if they match then "eat" the current token
    // and assign the next token to the this.current_token,
    // otherwise raise an exception.
    if (this.current_token.type == token_type) {
      this.current_token = this.get_next_token();
    } else {
      this.error();
    }
  };

  this.expr = function() {
    // expr -> INTEGER PLUS INTEGER
    // set current token to the first token taken from the input
    this.current_token = this.get_next_token();

    // we expect the current token to be a single-digit integer
    var left = this.current_token;
    this.eat(INTEGER);

    // we expect the current token to be a '+' token
    var op = this.current_token;
    this.eat(PLUS);
    

    // we expect the current token to be a single-digit integer
    var right = this.current_token;
    this.eat(INTEGER);
    
    // after the above call the self.current_token is set to
    // EOF token

    // at this point INTEGER PLUS INTEGER sequence of tokens
    // has been successfully found and the method can just
    // return the result of adding two integers, thus
    // effectively interpreting client input
    
    result = left.value + right.value;
    return result;
  };

  this.init(text);
};

// this is the equivalent of main()
console.log('calc> ');

process.stdin.on('data', function (text) {

  text = text.trim();

  if (text === 'quit') {
    console.log('bye bye!');
    process.exit();
  }

  try {
    interpreter = new Interpreter(text);
    result = interpreter.expr();
    console.log(result);
    console.log('calc> ');
  } catch(err) {
    console.log(err);
    process.exit();
  }
});