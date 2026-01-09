export const DEFAULT_CODE = {
  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>Hello World</h1>
</body>
</html>`,
  css: `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
}`,
  javascript: `console.log("Hello World");`,
  python: `print("Hello World")`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}`,
  c: `#include <stdio.h>

int main() {
    printf("Hello World\\n");
    return 0;
}`,
  cpp: `#include <iostream>

int main() {
    std::cout << "Hello World" << std::endl;
    return 0;
}`,
};

// Map file extensions to languages
export const EXTENSION_TO_LANGUAGE = {
  js: "javascript",
  jsx: "javascript",
  ts: "javascript",
  tsx: "javascript",
  py: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  html: "html",
  htm: "html",
  css: "css",
};
