// Mostly gonna skip validation to do it quick and dirty:

import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { AppDataSource } from "../app";
import { User } from "../models/User.entity";
import { ErrorResponse } from "../utils/errorResponse";

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = new User();
    const userRepo = AppDataSource.getRepository(User);

    const entity = Object.assign(user, req.body);
    const savedUser = await userRepo.save(entity);

    sendTokenResponse(savedUser, 200, res);
  }
);

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userRepo = AppDataSource.getRepository(User);
    const { email, password } = req.body;

    // Validate emil & password
    if (!email || !password) {
      return next(
        new ErrorResponse("Please provide an email and password", 400)
      );
    }

    const user = await userRepo.findOne({
      where: {
        email: req.body.email,
      },
    });

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    const token = user.getSignedJwtToken();

    sendTokenResponse(user, 200, res);
  }
);

// @desc      Get current logged-in user
// @route     GET /api/v1/auth/me
// @access    Private
const getMe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // user is already available in req due to the protect middleware
    const user = req["user"];

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: null,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

export { register, login, getMe };
