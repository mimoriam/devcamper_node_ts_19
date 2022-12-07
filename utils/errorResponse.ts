class ErrorResponse extends Error {
  statusCode: any;
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

export { ErrorResponse };
