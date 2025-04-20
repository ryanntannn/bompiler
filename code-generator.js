const BASIC_OPERATION = [
  "ADD",
  "SUB",
  "MUL",
  "DIV",
  "AND",
  "OR",
  "XOR",
  "CMPEQ",
  "CMPLT",
  "CMPLE",
];
const BASIC_OPERATION_WITH_CONSTANTS = ["ADDC"];
const MEMORY_ACCESS = ["LD", "ST", "BEQ", "BNE"];

export function codeGenerator(node) {
  if (BASIC_OPERATION.includes(node.type)) {
    return `${node.type}(${node.reg1}, ${node.reg2}, ${node.reg3})`;
  }
  if (BASIC_OPERATION_WITH_CONSTANTS.includes(node.type)) {
    return `${node.type}(${node.reg1}, ${node.constant}, ${node.reg2})`;
  }
  if (MEMORY_ACCESS.includes(node.type)) {
    return `${node.type}(${node.reg1}, ${node.address}, ${node.reg2})`;
  }
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
    case "BR":
      return `BR(${node.address})`;
    case "HALT":
      return "HALT()";
    default:
      throw new TypeError("Unknown node type: " + node.type);
  }
}
