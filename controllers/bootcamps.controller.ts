import { Request, Response, NextFunction } from "express";

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
) => {};

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
