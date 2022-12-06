import { Request, Response, NextFunction } from "express";
import { BootcampSchema } from "../models/Bootcamp.entity";
import { AppDataSource } from "../app";
import { validate } from "class-validator";

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
exports.createBootcamp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bootcamp = new BootcampSchema();
    const bootcampRepo = AppDataSource.getRepository(BootcampSchema);

    const entity = Object.assign(bootcamp, req.body);

    const error = await validate(bootcamp);

    if (error.length > 0) {
      return res.status(400).json({ error: "error" });
    } else {
      const savedBootcamp = await bootcampRepo.save(entity);

      return res.status(201).json({
        success: true,
        data: savedBootcamp,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

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
