// tslint:disable: no-parameter-reassignment

export default class StringCases {
  public static init(): void {
    String.prototype.toCamelCase = StringCases.toCamelCase;
    String.prototype.toSnakeCase = StringCases.toSnakeCase;
    String.prototype.toPascalCase = StringCases.toPascalCase;
    String.prototype.toDotCase = StringCases.toDotCase;
    String.prototype.toPathCase = StringCases.toPathCase;
    String.prototype.toTextCase = StringCases.toTextCase;
    String.prototype.toSentenceCase = StringCases.toSentenceCase;
    String.prototype.toHeaderCase = StringCases.toHeaderCase;
    String.prototype.toParamCase = StringCases.toParamCase;
    String.prototype.toTag = StringCases.toTag;
    String.prototype.toHash = StringCases.toHash;
  }
  public static toCamelCase(value: any): string {
    if (!value) {
      value = this;
    }
    return require('js-convert-case').toCamelCase(value);
  }
  public static toSnakeCase(value: any): string {
    if (!value) {
      value = this;
    }
    return require('js-convert-case').toSnakeCase(value);
  }
  public static toPascalCase(value: any): string {
    if (!value) {
      value = this;
    }
    return require('js-convert-case').toPascalCase(value);
  }
  public static toDotCase(value: any): string {
    if (!value) {
      value = this;
    }
    return require('js-convert-case').toDotCase(value);
  }
  public static toPathCase(value: any): string {
    if (!value) {
      value = this;
    }
    return require('js-convert-case').toPathCase(value);
  }
  public static toTextCase(value: any): string {
    if (!value) {
      value = this;
    }
    return require('js-convert-case').toTextCase(value);
  }
  public static toSentenceCase(value: any): string {
    if (!value) {
      value = this;
    }
    return require('js-convert-case').toSentenceCase(value);
  }
  public static toHeaderCase(value: any): string {
    if (!value) {
      value = this;
    }
    return require('js-convert-case').toHeaderCase(value);
  }
  public static toParamCase(value: any): string {
    if (!value) {
      value = this;
    }
    return require('js-convert-case')
      .toSnakeCase(value)
      .replace(/_/g, '-');
  }
  public static toTag(value: any): string {
    if (!value) {
      value = this;
    }
    return value
      .replace(/([A-Z])/g, (_m: string, a: string, _b: string) => '-' + a)
      .replace(/([A-Z])/g, (_m: string, a: string, _b: string) => '-' + a)
      .toParamCase();
  }
  public static toHash(value: any): string {
    if (!value) {
      value = this;
    }
    return value.toPascalCase();
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
    toTag: (value?: string) => string;
    toHash: (value?: string) => string;
  }
}
