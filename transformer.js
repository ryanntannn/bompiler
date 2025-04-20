const ZERO_REGISTER = "R31";

const generator = labelGenerator();

function getNextLabel() {
  return generator.next().value;
}

export function transform(ast) {
  // transform the AST into a new format
  // this is where you would do your transformations
  const newAst = {
    type: "UASMProgram",
    body: [],
    labels: [],
  };

  for (let node of ast.body) {
    handleLine(newAst, node);
  }

  newAst.labels.push({
    type: "VarLabelDeclaration",
    name: "stack",
  });

  newAst.labels.push({
    type: "VarLabelDeclaration",
    name: "out",
  });

  newAst.body.push({
    type: "HALT",
  });

  return newAst;
}

function handleLine(newAst, node) {
  if (node.type === "VariableDeclaration") {
    newAst.labels.push({
      type: "VarLabelDeclaration",
      name: node.name,
    });
    transformAssignment(newAst, node);
    return;
  }

  if (node.type === "AssignmentExpression") {
    transformAssignment(newAst, node);
    return;
  }

  if (node.type === "CallExpression") {
    const outAddress = "out";
    handleCallExpression(newAst, node, outAddress);

    return;
  }

  if (node.type === "IfStatement") {
    handleIfStatement(newAst, node);
    return;
  }

  if (node.type === "WhileStatement") {
    handleWhileStatement(newAst, node);
    return;
  }

  throw new TypeError("Unknown node type: " + node.type);
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

function loadParamIntoRegister(newAst, param, register) {
  if (param.type === "CallExpression") {
    // handle function calls
    const outAddress = "stack";
    handleCallExpression(newAst, param, outAddress);
    newAst.body.push({
      type: "LD",
      reg1: ZERO_REGISTER,
      address: outAddress,
      reg2: register,
    });
  } else if (param.type === "Identifier") {
    newAst.body.push({
      type: "LD",
      reg1: ZERO_REGISTER,
      address: param.value,
      reg2: register,
    });
  } else if (param.type === "NumberLiteral") {
    newAst.body.push({
      type: "ADDC",
      reg1: ZERO_REGISTER,
      constant: param.value,
      reg2: register,
    });
  } else {
    throw new TypeError("Unknown parameter type: " + param.type);
  }
}

const OP_MAP = {
  sum: "ADD",
  sub: "SUB",
  mul: "MUL",
  div: "DIV",
  and: "AND",
  or: "OR",
  xor: "XOR",
  eq: "CMPEQ",
};

function handleCallExpression(newAst, node, outAddress) {
  // check if the expression is a built-in function
  if (OP_MAP[node.name]) {
    // we know sum has 2 parameters
    const type = OP_MAP[node.name];

    const param1 = node.params[0];
    const param2 = node.params[1];

    loadParamIntoRegister(newAst, param1, "R1");
    loadParamIntoRegister(newAst, param2, "R2");
    newAst.body.push({
      type: type,
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

  if (node.name === "moreThan") {
    const param1 = node.params[0];
    const param2 = node.params[1];
    handleMoreThan(newAst, param1, param2, outAddress);
    return;
  }

  if (node.name === "lessThan") {
    const param1 = node.params[0];
    const param2 = node.params[1];
    handleMoreThan(newAst, param2, param1, outAddress);
    return;
  }

  throw new TypeError("Unknown function call: " + node.name);
}

function handleMoreThan(newAst, param1, param2, outAddress) {
  loadParamIntoRegister(newAst, param1, "R1");
  loadParamIntoRegister(newAst, param2, "R2");
  newAst.body.push({
    type: "CMPLE",
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
}

function handleIfStatement(newAst, node) {
  // handle if statements
  const test = node.test;
  const consequent = node.consequent;
  const alternate = node.alternate;

  const consequentLabel = getNextLabel();
  const alternateLabel = getNextLabel();
  const endLabel = getNextLabel();

  if (test.type === "CallExpression") {
    // handle function calls
    const outAddress = "stack";
    handleCallExpression(newAst, test, outAddress);
    newAst.body.push({
      type: "LD",
      reg1: ZERO_REGISTER,
      address: outAddress,
      reg2: "R1",
    });
    newAst.body.push({
      type: "BEQ",
      reg1: "R1",
      address: consequentLabel,
      reg2: ZERO_REGISTER,
    });
    if (alternate) {
      newAst.body.push({
        type: "BNE",
        reg1: "R1",
        address: alternateLabel,
        reg2: ZERO_REGISTER,
      });
    }
    newAst.body.push({
      type: "BR",
      address: endLabel,
    });
  } else {
    throw new TypeError("Unknown test type: " + test.type);
  }

  newAst.body.push({
    type: "LabelDeclaration",
    name: consequentLabel,
  });
  for (let stmt of consequent) {
    // add a label
    handleLine(newAst, stmt);
  }
  newAst.body.push({
    type: "BR",
    address: endLabel,
  });

  if (alternate) {
    newAst.body.push({
      type: "LabelDeclaration",
      name: alternateLabel,
    });
    for (let stmt of alternate) {
      handleLine(newAst, stmt);
    }
    newAst.body.push({
      type: "BR",
      address: endLabel,
    });
  }

  newAst.body.push({
    type: "LabelDeclaration",
    name: endLabel,
  });
}

function handleWhileStatement(newAst, node) {
  const test = node.test;
  const body = node.body;

  const testLabel = getNextLabel();
  const bodyLabel = getNextLabel();
  const endLabel = getNextLabel();

  newAst.body.push({
    type: "LabelDeclaration",
    name: testLabel,
  });

  if (test.type === "CallExpression") {
    // handle function calls
    const outAddress = "stack";
    handleCallExpression(newAst, test, outAddress);
    newAst.body.push({
      type: "LD",
      reg1: ZERO_REGISTER,
      address: outAddress,
      reg2: "R1",
    });
    newAst.body.push({
      type: "BNE",
      reg1: "R1",
      address: bodyLabel,
      reg2: ZERO_REGISTER,
    });
    newAst.body.push({
      type: "BR",
      address: endLabel,
    });
  }
  newAst.body.push({
    type: "LabelDeclaration",
    name: bodyLabel,
  });
  for (let stmt of body) {
    // add a label
    handleLine(newAst, stmt);
  }
  newAst.body.push({
    type: "BR",
    address: testLabel,
  });

  newAst.body.push({
    type: "LabelDeclaration",
    name: endLabel,
  });
}

function* labelGenerator() {
  let counter = 0;
  while (true) {
    yield `label${counter++}`;
  }
}
