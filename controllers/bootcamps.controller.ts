import { Request, Response, NextFunction } from "express";

import { BootcampSchema } from "../models/Bootcamp.entity";
import { AppDataSource } from "../app";

import { asyncHandler } from "../middleware/asyncHandler";
import { validate, ValidationError } from "class-validator";
import { errorHandler } from "../middleware/errorHandler";
import { ErrorResponse } from "../utils/errorResponse";
import { Repository } from "typeorm";

import fs from "fs";
import path from "path";

// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
const getBootcamps = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const bootcampRepo: Repository<BootcampSchema> =
      AppDataSource.getRepository(BootcampSchema);

    // If both filtering + sorting:
    if (req.query.select && req.query.sort) {
      const bootcamps = await bootcampRepo
        .createQueryBuilder()
        .select([`${req.query.select}`])
        .orderBy(`${req.query.sort}`)
        .getRawMany();

      return res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps,
      });
    }

    // Filtering/Selection:
    if (req.query.select) {
      const bootcamps = await bootcampRepo
        .createQueryBuilder()
        .select([`${req.query.select}`])
        .getRawMany();

      return res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps,
      });
    }

    // Sorting:
    if (req.query.sort) {
      const bootcamps = await bootcampRepo
        .createQueryBuilder()
        .orderBy(`${req.query.sort}`)
        .getMany();

      return res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps,
      });
    }

    const bootcamps: BootcampSchema[] = await bootcampRepo.find({
      cache: {
        id: "bootcamp_cache",
        milliseconds: 2000, // 2 seconds
      },
    });

    res.status(200).json({
      success: true,
      count: bootcamps.length,
      data: bootcamps,
    });
  }
);

// @desc      Get single bootcamp
// @route     GET /api/v1/bootcamps/:id
// @access    Public
const getBootcamp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const bootcampRepo: Repository<BootcampSchema> =
      AppDataSource.getRepository(BootcampSchema);

    const bootcamp: BootcampSchema = await bootcampRepo.findOneBy({
      id: req.params.id,
    });

    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: bootcamp,
    });
  }
);

// @desc      Create new bootcamp
// @route     POST /api/v1/bootcamps
// @access    Private
const createBootcamp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const bootcamp = new BootcampSchema();
    const bootcampRepo: Repository<BootcampSchema> =
      AppDataSource.getRepository(BootcampSchema);

    const entity = Object.assign(bootcamp, req.body);

    const err: ValidationError[] = await validate(bootcamp, {
      validationError: { target: false },
    });

    if (err.length > 0) {
      errorHandler(err, req, res, next);
    } else {
      const savedBootcamp = await bootcampRepo.save(entity);

      // Remove cache for newly created bootcamp:
      await AppDataSource.queryResultCache.remove(["bootcamp_cache"]);

      res.status(201).json({
        success: true,
        data: savedBootcamp,
      });
    }
  }
);

// @desc      Update bootcamp
// @route     PUT /api/v1/bootcamps/:id
// @access    Private
const updateBootcamp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const bootcampRepo: Repository<BootcampSchema> =
      AppDataSource.getRepository(BootcampSchema);

    let bootcamp: BootcampSchema = await bootcampRepo.findOneBy({
      id: req.params.id,
    });

    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
      );
    }

    await bootcampRepo.update(req.params.id, {
      ...req.body,
    });

    bootcamp = await bootcampRepo.findOneBy({
      id: req.params.id,
    });

    res.status(200).json({
      success: true,
      data: bootcamp,
    });
  }
);

// @desc      Delete bootcamp
// @route     DELETE /api/v1/bootcamps/:id
// @access    Private
const deleteBootcamp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const bootcampRepo: Repository<BootcampSchema> =
      AppDataSource.getRepository(BootcampSchema);

    let bootcamp: BootcampSchema = await bootcampRepo.findOneBy({
      id: req.params.id,
    });

    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
      );
    }

    await bootcampRepo.delete(req.params.id);

    // Remove cache for newly deleted bootcamp:
    await AppDataSource.queryResultCache.remove(["bootcamp_cache"]);

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);

const seedUpBootcamp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let bootcamp = new BootcampSchema();
    const bootcampRepo: Repository<BootcampSchema> =
      AppDataSource.getRepository(BootcampSchema);

    const bootcamps = JSON.parse(
      fs.readFileSync(
        `${path.join(__dirname, "../")}/_data/bootcamps.json`,
        "utf-8"
      )
    );

    const bootcampEntities = bootcampRepo.create(bootcamps);

    await AppDataSource.createQueryBuilder()
      .insert()
      .into(BootcampSchema)
      .values(bootcampEntities)
      .execute();

    res.status(200).json({
      success: true,
    });
  }
);

const seedDownBootcamp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const bootcampRepo: Repository<BootcampSchema> =
      AppDataSource.getRepository(BootcampSchema);

    await bootcampRepo.clear();

    res.status(200).json({
      success: true,
    });
  }
);

export {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  seedUpBootcamp,
  seedDownBootcamp,
};
