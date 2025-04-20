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
      } else if (tokens[current].type === "assign") {
        // check for assignment
        current++;
        let value = walk();
        return {
          type: "AssignmentExpression",
          name: token.value,
          value,
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
        case "if":
          current++;
          // expect the next token to be a paren
          let paren = tokens[current];
          if (paren.type !== "paren" || paren.value !== "(") {
            throw new TypeError("Expected a paren after if");
          }
          current++;
          // expect the next token to be an expression
          let test = walk();
          // expect the next token to be a paren
          paren = tokens[current];
          if (paren.type !== "paren" || paren.value !== ")") {
            throw new TypeError("Expected a paren after if");
          }
          current++;
          // expect the next token to be a block
          let block = tokens[current];
          if (block.type !== "brace" || block.value !== "{") {
            throw new TypeError("Expected a brace after if");
          }
          current++;
          let consequent = [];
          while (
            tokens[current].type !== "brace" ||
            tokens[current].value !== "}"
          ) {
            let node = walk();
            if (node) {
              consequent.push(node);
            }
          }
          current++;
          // handle else statement
          if (
            tokens[current].type === "keyword" &&
            tokens[current].value === "else"
          ) {
            current++;
            // expect the next token to be a block
            block = tokens[current];
            if (block.type !== "brace" || block.value !== "{") {
              throw new TypeError("Expected a brace after else");
            }
            current++;
            let alternate = [];
            while (
              tokens[current].type !== "brace" ||
              tokens[current].value !== "}"
            ) {
              let node = walk();
              if (node) {
                alternate.push(node);
              }
            }
            current++;
            return {
              type: "IfStatement",
              test,
              consequent,
              alternate,
            };
          } else {
            return {
              type: "IfStatement",
              test,
              consequent,
            };
          }
        case "while":
          current++;
          // expect the next token to be a paren
          let whileParen = tokens[current];
          if (whileParen.type !== "paren" || whileParen.value !== "(") {
            throw new TypeError("Expected a paren after while");
          }
          current++;
          // expect the next token to be an expression
          let whileTest = walk();
          // expect the next token to be a paren
          whileParen = tokens[current];
          if (whileParen.type !== "paren" || whileParen.value !== ")") {
            throw new TypeError("Expected a paren after while");
          }
          current++;
          // expect the next token to be a block
          let whileBlock = tokens[current];
          if (whileBlock.type !== "brace" || whileBlock.value !== "{") {
            throw new TypeError("Expected a brace after while");
          }
          current++;
          let whileBody = [];
          while (
            tokens[current].type !== "brace" ||
            tokens[current].value !== "}"
          ) {
            let node = walk();
            if (node) {
              whileBody.push(node);
            }
          }
          current++;
          return {
            type: "WhileStatement",
            test: whileTest,
            body: whileBody,
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
