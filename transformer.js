const ZERO_REGISTER = "R31";

export function transform(ast) {
  // transform the AST into a new format
  // this is where you would do your transformations
  const newAst = {
    type: "UASMProgram",
    body: [],
    labels: [],
  };

  for (let node of ast.body) {
    if (node.type === "VariableDeclaration") {
      // handle literal values
      if (node.value.type === "NumberLiteral") {
        newAst.labels.push({
          type: "LabelDeclaration",
          name: node.name,
        });
        newAst.body.push({
          type: "ADDC",
          reg1: ZERO_REGISTER,
          constant: node.value.value,
          reg2: "R9",
        });
        newAst.body.push({
          type: "ST",
          reg1: "R9",
          address: node.name,
          reg2: ZERO_REGISTER,
        });
      } else if (node.value.type === "CallExpression") {
        // check if the expression is a built-in function
        if (node.value.name === "sum") {
          // we know sum has 2 parameters

          const param1 = node.value.params[0];
          const param2 = node.value.params[1];

          /**
           * Load the parameters into registers
           */
          function handleParam(param, register) {
            if (param.type === "Identifier") {
              return {
                type: "LD",
                reg1: ZERO_REGISTER,
                address: param.value,
                reg2: register,
              };
            } else if (param.type === "NumberLiteral") {
              return {
                type: "ADDC",
                reg1: ZERO_REGISTER,
                constant: param.value,
                reg2: register,
              };
            } else {
              throw new TypeError("Unknown parameter type: " + param.type);
            }
          }

          newAst.labels.push({
            type: "LabelDeclaration",
            name: node.name,
          });
          newAst.body.push(handleParam(param1, "R1"));
          newAst.body.push(handleParam(param2, "R2"));
          newAst.body.push({
            type: "ADD",
            reg1: "R1",
            reg2: "R2",
            reg3: "R3",
          });
          newAst.body.push({
            type: "ST",
            reg1: "R3",
            address: node.name,
            reg2: ZERO_REGISTER,
          });
        }
      }
    }
  }

  return newAst;
}
