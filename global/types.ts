export type FlatRecordOf<T> = { [K in string]: T };
export type UnknownObject = { [K in string]: unknown };
export type UnknownObjectWith<T, K extends string> = UnknownObject & {
  [X in K]: T;
};
