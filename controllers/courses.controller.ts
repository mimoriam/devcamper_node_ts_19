import { asyncHandler } from "../middleware/asyncHandler";
import { NextFunction, Request, Response } from "express";

import { AppDataSource } from "../app";
import { Repository } from "typeorm";
import { Course } from "../models/Course.entity";

import fs from "fs";
import path from "path";

const seedUpCourse = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let course = new Course();
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

export { seedUpCourse, seedDownCourse };
