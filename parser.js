/**
 * Parses an array of tokens into an AST
 * @param {Array} tokens
 */
export function parser(tokens) {
  let current = 0;
  function walk() {
    let token = tokens[current];

    if (token.type === "number") {
      current++;
      return {
        type: "NumberLiteral",
        value: token.value,
      };
    }

    if (token.type === "name") {
      current++;
      // check for function call
      if (tokens[current].type === "paren" && tokens[current].value === "(") {
        current++;
        let args = [];
        while (
          tokens[current].type !== "paren" ||
          tokens[current].value !== ")"
        ) {
          // walk through the arguments
          if (tokens[current].type === "comma") {
            current++;
            continue;
          }
          args.push(walk());
        }
        current++;
        return {
          type: "CallExpression",
          name: token.value,
          params: args,
        };
      } else {
        return {
          type: "Identifier",
          value: token.value,
        };
      }
    }

    if (token.type === "keyword") {
      switch (token.value) {
        case "int":
          current++;
          // expect the next token to be a name
          let name = tokens[current];
          if (name.type !== "name") {
            throw new TypeError("Expected a name after int");
          }
          current++;
          // expect the next token to be either an assign or a paren
          let nextToken = tokens[current];
          if (nextToken.type === "assign") {
            current++;
            let value = walk();
            return {
              type: "VariableDeclaration",
              name: name.value,
              value,
            };
          }
        case "return":
          current++;
          return {
            type: "ReturnStatement",
            value: walk(),
          };
        default:
          throw new TypeError(
            "I dont know what this keyword is: " + token.value
          );
      }
    }

    // handle semicolon
    if (token.type === "semicolon") {
      current++;
      return null;
    }

    throw new TypeError("I dont know what this token is: " + token.type);
  }

  let ast = {
    type: "CProgram",
    body: [],
  };

  while (current < tokens.length) {
    let node = walk();
    if (node) {
      ast.body.push(node);
    }
  }

  return ast;
}
