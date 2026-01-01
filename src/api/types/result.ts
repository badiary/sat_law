// result型
export type Result<T> = Success<T> | Failure;

// Success型
export type Success<T> = {
  isSuccess: true;
  value: T;
};

// Failure型
export type Failure = {
  isSuccess: false;
  error: Error;
};
