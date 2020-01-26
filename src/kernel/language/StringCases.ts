export default class StringCases {
  static init() {
    String.prototype.toCamelCase = StringCases.toCamelCase;
    String.prototype.toSnakeCase = StringCases.toSnakeCase;
    String.prototype.toPascalCase = StringCases.toPascalCase;
    String.prototype.toDotCase = StringCases.toDotCase;
    String.prototype.toPathCase = StringCases.toPathCase;
    String.prototype.toTextCase = StringCases.toTextCase;
    String.prototype.toSentenceCase = StringCases.toSentenceCase;
    String.prototype.toHeaderCase = StringCases.toHeaderCase;
    String.prototype.toParamCase = StringCases.toParamCase;
  }
  static toCamelCase(value: any) {
    if (!value) {
      value = this;
    }
    return require("js-convert-case").toCamelCase(value);
  }
  static toSnakeCase(value: any) {
    if (!value) {
      value = this;
    }
    return require("js-convert-case").toSnakeCase(value);
  }
  static toPascalCase(value: any) {
    if (!value) {
      value = this;
    }
    return require("js-convert-case").toPascalCase(value);
  }
  static toDotCase(value: any) {
    if (!value) {
      value = this;
    }
    return require("js-convert-case").toDotCase(value);
  }
  static toPathCase(value: any) {
    if (!value) {
      value = this;
    }
    return require("js-convert-case").toPathCase(value);
  }
  static toTextCase(value: any) {
    if (!value) {
      value = this;
    }
    return require("js-convert-case").toTextCase(value);
  }
  static toSentenceCase(value: any) {
    if (!value) {
      value = this;
    }
    return require("js-convert-case").toSentenceCase(value);
  }
  static toHeaderCase(value: any) {
    if (!value) {
      value = this;
    }
    return require("js-convert-case").toHeaderCase(value);
  }
  static toParamCase(value: any) {
    if (!value) {
      value = this;
    }
    return require("js-convert-case")
      .toSnakeCase(value)
      .replace(/_/g, "-");
  }
}

declare global {
  interface String {
    toSnakeCase: (value?: string) => string;
    toPascalCase: (value?: string) => string;
    toDotCase: (value?: string) => string;
    toPathCase: (value?: string) => string;
    toTextCase: (value?: string) => string;
    toSentenceCase: (value?: string) => string;
    toHeaderCase: (value?: string) => string;
    toParamCase: (value?: string) => string;
    toCamelCase: (value?: string) => string;
  }
}
