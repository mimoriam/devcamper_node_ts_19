import { asyncHandler } from "../middleware/asyncHandler";
import { NextFunction, Request, Response } from "express";

import { AppDataSource } from "../app";
import { Repository } from "typeorm";
import { Course } from "../models/Course.entity";

import fs from "fs";
import path from "path";
import { Bootcamp } from "../models/Bootcamp.entity";
import { ErrorResponse } from "../utils/errorResponse";
import { validate, ValidationError } from "class-validator";
import { errorHandler } from "../middleware/errorHandler";

// @desc      Get all courses
// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @access    Public
const getCourses = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseRepo: Repository<Course> = AppDataSource.getRepository(Course);

    // This is the amount of results per page shown
    const limit = parseInt(<string>req.query.limit, 10) || 2;
    const page = parseInt((req.query.page as string) || "1");

    let data, total;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const pagination = {
      next: undefined,
      prev: undefined,
    };

    [data, total] = await courseRepo
      .createQueryBuilder("course")
      .leftJoinAndSelect("course.bootcamp", "bootcamp")
      .select()
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit: limit,
      };
    }

    res.status(200).json({
      success: true,
      count: total,
      pagination: pagination,
      data: data,
    });
  }
);

// @desc      Get single course
// @route     GET /api/v1/courses/:id
// @access    Public
const getCourse = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseRepo: Repository<Course> = AppDataSource.getRepository(Course);

    const course = await courseRepo.findOneBy({
      id: req.params.id,
    });

    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  }
);

// @desc      Add new course
// @route     POST /api/v1/bootcamps/:bootcampId/courses
// @access    Private
const addCourse = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    req.body.bootcamp = req.params.bootcampId;

    const course = new Course();

    const courseRepo: Repository<Course> = AppDataSource.getRepository(Course);
    const bootcampRepo: Repository<Bootcamp> =
      AppDataSource.getRepository(Bootcamp);

    const bootcamp: Bootcamp = await bootcampRepo.findOneBy({
      id: req.params.bootcampId,
    });

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with id of ${req.params.bootcampId}`,
          404
        )
      );
    }

    const entity = Object.assign(course, req.body);

    const err: ValidationError[] = await validate(course, {
      validationError: { target: false },
    });

    if (err.length > 0) {
      errorHandler(err, req, res, next);
    } else {
      const savedCourse = await courseRepo.save(entity);

      res.status(201).json({
        success: true,
        data: savedCourse,
      });
    }
  }
);

const seedUpCourse = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseRepo: Repository<Course> = AppDataSource.getRepository(Course);

    const courses = JSON.parse(
      fs.readFileSync(
        `${path.join(__dirname, "../")}/_data/courses.json`,
        "utf-8"
      )
    );

    const courseEntities = courseRepo.create(courses);

    await AppDataSource.createQueryBuilder()
      .insert()
      .into(Course)
      .values(courseEntities)
      .execute();

    res.status(200).json({
      success: true,
    });
  }
);

const seedDownCourse = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const courseRepo: Repository<Course> = AppDataSource.getRepository(Course);

    await courseRepo.clear();

    res.status(200).json({
      success: true,
    });
  }
);

export { getCourses, seedUpCourse, seedDownCourse, addCourse, getCourse };
