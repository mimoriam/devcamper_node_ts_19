import { Request, Response, NextFunction } from "express";
import { BootcampSchema } from "../models/Bootcamp.entity";
import { AppDataSource } from "../app";

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
  const b_body = {
    _id: "5d713a66ec8f2b88b8f830b8",
    user: "5d7a514b5d2c12c7449be046",
    name: "ModernTech Bootcamp",
    description:
      "ModernTech has one goal, and that is to make you a rockstar developer and/or designer with a six figure salary. We teach both development and UI/UX",
    website: "https://moderntech.com",
    phone: "(222) 222-2222",
    email: "enroll@moderntech.com",
    address: "220 Pawtucket St, Lowell, MA 01854",
    careers: ["Web Development", "UI/UX", "Mobile Development"],
    housing: false,
    jobAssistance: true,
    jobGuarantee: false,
    acceptGi: true,
  };

  const bootcamp = new BootcampSchema();
  const bootcampRepository = AppDataSource.getRepository(BootcampSchema);

  bootcamp.name = b_body.name;
  bootcamp.description = b_body.description;
  bootcamp.website = b_body.website;
  bootcamp.phone = b_body.phone;
  bootcamp.email = b_body.email;
  bootcamp.address = b_body.address;
  bootcamp.careers = b_body.careers;
  bootcamp.housing = b_body.housing;
  bootcamp.jobAssistance = b_body.jobAssistance;
  bootcamp.jobGuarantee = b_body.jobGuarantee;
  bootcamp.acceptGi = b_body.acceptGi;

  await bootcampRepository.save(bootcamp);

  return res.status(201).json({
    bootcamp,
  });
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
