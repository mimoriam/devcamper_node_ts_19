import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../utils/errorResponse";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error: any = { ...err };
  error.message = err.message;

  // console.log(err);

  // TypeORM duplicate key:
  if (err.constructor.name === "QueryFailedError") {
    if (err.code === "23505") {
      const message = "Duplicate field value entered";
      error = new ErrorResponse(message, 400);
    }
  } else if (err.constructor.name === "Array") {
    if (err[0].constructor.name === "ValidationError") {
      const [message] = Object.values(err[0].constraints);
      error = new ErrorResponse(message, 400);
    }
  }

  // // Mongoose bad ObjectId
  // if (err.name === "CastError") {
  //   const message = `Resource not found`;
  //   error = new ErrorResponse(message, 404);
  // }
  //
  //

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

export { errorHandler };
