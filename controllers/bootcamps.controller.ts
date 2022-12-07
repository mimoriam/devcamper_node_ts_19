import { Request, Response, NextFunction } from "express";
import { BootcampSchema } from "../models/Bootcamp.entity";
import { AppDataSource } from "../app";
import { validate } from "class-validator";
import { asyncHandler } from "../middleware/asyncHandler";
import {errorHandler} from "../middleware/errorHandler";

// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  return res.status(200).json({ success: true });
};

// @desc      Get single bootcamp
// @route     GET /api/v1/bootcamps/:id
// @access    Public
exports.getBootcamp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

// @desc      Create new bootcamp
// @route     POST /api/v1/bootcamps
// @access    Private
exports.createBootcamp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const bootcamp = new BootcampSchema();
    const bootcampRepo = AppDataSource.getRepository(BootcampSchema);

    const entity = Object.assign(bootcamp, req.body);

    const err = await validate(bootcamp, {
      validationError: { target: false },
    });

    if (err.length > 0) {
        errorHandler(err, req, res, next);
    } else {
      const savedBootcamp = await bootcampRepo.save(entity);

      return res.status(201).json({
        success: true,
        data: savedBootcamp,
      });
    }
  }
);

// @desc      Update bootcamp
// @route     PUT /api/v1/bootcamps/:id
// @access    Private
exports.updateBootcamp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

// @desc      Delete bootcamp
// @route     DELETE /api/v1/bootcamps/:id
// @access    Private
exports.deleteBootcamp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
