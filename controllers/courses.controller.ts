import { asyncHandler } from "../middleware/asyncHandler";
import { NextFunction, Request, Response } from "express";

import { AppDataSource } from "../app";
import { Repository } from "typeorm";
import { Course } from "../models/Course.entity";

import fs from "fs";
import path from "path";

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

    [data, total] = await courseRepo.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
    });

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

export { getCourses, seedUpCourse, seedDownCourse };
