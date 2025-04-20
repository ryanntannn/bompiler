# βompiler

This is a simple compiler that compiles c-like code into MIT's Beta CPU assembly language (USAM). It is designed to be a learning tool for understanding the basics of compiler construction and code generation.

This compiler is heavily inspired by [the super tiny compiler](https://github.com/jamiebuilds/the-super-tiny-compiler/)

## Example

c like code snippet:

```c
int x = 10;
int y = 20;
int a = sum(x, y);
int b = sum(10, 30);
int c = sum(a, b);
```

compiled to beta assembly code:

```usam
.include beta.uasm

ADDC(R31, 10, R9)
ST(R9, x, R31)
ADDC(R31, 20, R9)
ST(R9, y, R31)
LD(R31, x, R1)
LD(R31, y, R2)
ADD(R1, R2, R3)
ST(R3, a, R31)
ADDC(R31, 10, R1)
ADDC(R31, 30, R2)
ADD(R1, R2, R3)
ST(R3, b, R31)
LD(R31, a, R1)
LD(R31, b, R2)
ADD(R1, R2, R3)
ST(R3, c, R31)

x : LONG(0)
y : LONG(0)
a : LONG(0)
b : LONG(0)
c : LONG(0)
```

## Usage

To use the compiler, you need to have node.js installed. You can then run the compiler with the following command:

```bash
npm run compile
```

To run the beta assembly code, you can execute the output.usam file in the given bsim.jar file.
