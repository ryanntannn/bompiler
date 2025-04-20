const ZERO_REGISTER = "R31";

export function transform(ast) {
  // transform the AST into a new format
  // this is where you would do your transformations
  const newAst = {
    type: "UASMProgram",
    body: [],
    labels: [],
  };

  let progOut = false;

  for (let node of ast.body) {
    if (node.type === "VariableDeclaration") {
      newAst.labels.push({
        type: "LabelDeclaration",
        name: node.name,
      });
      transformAssignment(newAst, node);
      continue;
    }

    if (node.type === "AssignmentExpression") {
      transformAssignment(newAst, node);
      continue;
    }

    if (node.type === "CallExpression") {
      if (!progOut) {
        progOut = true;
        // add the program label
        newAst.labels.push({
          type: "LabelDeclaration",
          name: "program",
        });
      }

      // handle function calls
      const outAddress = "program";
      handleCallExpression(newAst, node, outAddress);

      continue;
    }

    throw new TypeError("Unknown node type: " + node.type);
  }

  return newAst;
}

function transformAssignment(newAst, node) {
  if (node.value.type === "NumberLiteral") {
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
    // handle function calls
    const outAddress = node.name;
    handleCallExpression(newAst, node.value, outAddress);
  }
}

function handleCallExpression(newAst, node, outAddress) {
  // check if the expression is a built-in function
  if (node.name === "sum") {
    // we know sum has 2 parameters

    const param1 = node.params[0];
    const param2 = node.params[1];

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
      address: outAddress,
      reg2: ZERO_REGISTER,
    });
    return;
  }

  if (node.name === "print") {
    // we know print has 1 parameter
    const param = node.params[0];

    if (param.type === "Identifier") {
      newAst.body.push({
        type: "LD",
        reg1: ZERO_REGISTER,
        address: param.value,
        reg2: "R1",
      });
    } else if (param.type === "NumberLiteral") {
      newAst.body.push({
        type: "ADDC",
        reg1: ZERO_REGISTER,
        constant: param.value,
        reg2: "R1",
      });
    } else {
      throw new TypeError("Unknown parameter type: " + param.type);
    }

    newAst.body.push({
      type: "ST",
      reg1: "R1",
      address: outAddress,
      reg2: ZERO_REGISTER,
    });
    return;
  }

  throw new TypeError("Unknown function call: " + node.name);
}
