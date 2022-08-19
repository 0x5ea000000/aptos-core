// Copyright (c) Aptos
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line max-classes-per-file
class ExtendableError extends Error {
  constructor(message: string) {
    super();
    this.message = message;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

export class DappError extends ExtendableError {
  code: number;

  constructor(code: number, name: string, message: string) {
    super(message);
    this.name = name;
    this.code = code;
  }
}

export const DappErrorType = Object.freeze({
  INTERNAL_ERROR: new DappError(-30001, 'Internal Error', 'Internal Error'),
  NO_ACCOUNTS: new DappError(4000, 'No Accounts', 'No accounts found'),
  UNAUTHORIZED: new DappError(4100, 'Unauthorized', 'The requested method and/or account has not been authorized by the user.'),
  UNSUPPORRTED: new DappError(4200, 'Unsupoorted', 'The provider does not support the requested method.'),
  USER_REJECTION: new DappError(4001, 'Rejected', 'The user rejected the request'),
});

export function TransactionError(error: Error): DappError {
  let message = 'Transaction failed';
  const anyError = error as any;
  if (anyError.body && anyError.body.message) {
    message = anyError.body.message;
  }
  return new DappError(-30000, 'Transaction Failed', message);
}
