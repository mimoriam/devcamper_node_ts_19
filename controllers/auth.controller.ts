// Mostly gonna skip validation to do it quick and dirty:

import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { AppDataSource } from "../app";
import { User } from "../models/User.entity";
import { sign } from "jsonwebtoken";

export const getSignedJwtToken = function (id) {
  return sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = new User();
    const userRepo = AppDataSource.getRepository(User);

    const entity = Object.assign(user, req.body);
    const savedUser = await userRepo.save(entity);

    const token = getSignedJwtToken(user.id);

    res.status(201).json({
      success: true,
      data: savedUser,
    });
  }
);

export { register };
