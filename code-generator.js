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
      return `${node.name} : LONG(0)`;
    case "ADDC":
      return `ADDC(${node.reg1}, ${node.constant}, ${node.reg2})`;
    case "LD":
      return `LD(${node.reg1}, ${node.address}, ${node.reg2})`;
    case "ST":
      return `ST(${node.reg1}, ${node.address}, ${node.reg2})`;
    case "ADD":
      return `ADD(${node.reg1}, ${node.reg2}, ${node.reg3})`;
    default:
      throw new TypeError("Unknown node type: " + node.type);
  }
}
