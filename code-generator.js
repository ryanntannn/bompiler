export function codeGenerator(node) {
  switch (node.type) {
    case "UASMProgram":
      return (
        ".include beta.uasm\n\n" +
        node.body.map(codeGenerator).join("\n") +
        "\n\n" +
        node.labels.map(codeGenerator).join("\n")
      );

    case "LabelDeclaration":
      return `\n\n${node.name}:`;
    case "VarLabelDeclaration":
      return `${node.name} : LONG(0)`;
    case "ADDC":
      return `ADDC(${node.reg1}, ${node.constant}, ${node.reg2})`;
    case "LD":
      return `LD(${node.reg1}, ${node.address}, ${node.reg2})`;
    case "ST":
      return `ST(${node.reg1}, ${node.address}, ${node.reg2})`;
    case "ADD":
      return `ADD(${node.reg1}, ${node.reg2}, ${node.reg3})`;
    case "CMPLE":
      return `CMPLE(${node.reg1}, ${node.reg2}, ${node.reg3})`;
    case "BEQ":
      return `BEQ(${node.reg1}, ${node.address}, ${node.reg2})`;
    case "BNE":
      return `BNE(${node.reg1}, ${node.address}, ${node.reg2})`;
    case "BR":
      return `BR(${node.address})`;
    case "HALT":
      return "HALT()";
    default:
      throw new TypeError("Unknown node type: " + node.type);
  }
}
