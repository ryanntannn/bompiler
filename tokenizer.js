/**
 * Converts a C code string into an array of tokens
 * @param {string} input
 */
export function tokenizer(input) {
  let current = 0;
  let tokens = [];

  while (current < input.length) {
    let char = input[current];

    let LETTERS = /[a-zA-Z]/;

    if (LETTERS.test(char)) {
      let value = "";

      while (LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }

      // check for keywords
      switch (value) {
        case "int":
          tokens.push({ type: "keyword", value });
          break;
        case "return":
          tokens.push({ type: "keyword", value });
          break;
        case "if":
          tokens.push({ type: "keyword", value });
          break;
        case "else":
          tokens.push({ type: "keyword", value });
          break;
        case "while":
          tokens.push({ type: "keyword", value });
          break;
        default:
          tokens.push({ type: "name", value });
      }
      continue;
    }

    let NUMBERS = /[0-9]/;
    if (NUMBERS.test(char)) {
      let value = "";

      while (NUMBERS.test(char)) {
        value += char;
        char = input[++current];
      }

      tokens.push({ type: "number", value });
      continue;
    }

    let WHITESPACE = /\s/;
    if (WHITESPACE.test(char)) {
      current++;
      continue;
    }

    if (char === "(") {
      tokens.push({ type: "paren", value: "(" });
      current++;
      continue;
    }

    if (char === ")") {
      tokens.push({ type: "paren", value: ")" });
      current++;
      continue;
    }

    if (char === "{") {
      tokens.push({ type: "brace", value: "{" });
      current++;
      continue;
    }

    if (char === "}") {
      tokens.push({ type: "brace", value: "}" });
      current++;
      continue;
    }

    if (char === ",") {
      tokens.push({ type: "comma", value: "," });
      current++;
      continue;
    }

    if (char === "=") {
      tokens.push({ type: "assign", value: "=" });
      current++;
      continue;
    }

    if (char === ";") {
      tokens.push({ type: "semicolon", value: ";" });
      current++;
      continue;
    }

    throw new TypeError("I dont know what this character is: " + char);
  }

  return tokens;
}
