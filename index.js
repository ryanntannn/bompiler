import { codeGenerator } from "./code-generator.js";
import { parser } from "./parser.js";
import { tokenizer } from "./tokenizer.js";
import { transform } from "./transformer.js";
import fs from "fs";

function compile(input) {
  console.log("Input: ", input);

  console.log("==========================");
  console.log("Tokenizing...");
  const tokens = tokenizer(input);
  console.log("Tokens: ", tokens);
  console.log("==========================");
  console.log("Parsing...");
  const ast = parser(tokens);
  console.log("AST: ", JSON.stringify(ast, null, 2));
  console.log("==========================");
  const newAst = transform(ast);
  console.log("Transformed AST: ", newAst);
  console.log("==========================");
  return codeGenerator(newAst);
}

function main() {
  const inputFile = "input.c";
  const input = fs.readFileSync(inputFile, "utf8");
  const result = compile(input);
  const outputFile = "output.uasm";
  fs.writeFileSync(outputFile, result);
  console.log(`File written to ${outputFile}`);
}

main();
