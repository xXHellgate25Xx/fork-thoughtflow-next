// Object manipulation utilities

export type DeepClone<T> = T extends object ? { 
  [K in keyof T]: DeepClone<T[K]> 
} : T;

export function deepClone<T>(obj: T): DeepClone<T> {
  return JSON.parse(JSON.stringify(obj));
}

export function deepCloneAs<R, T>(obj: T): R {
  return JSON.parse(JSON.stringify(obj)) as R;
}