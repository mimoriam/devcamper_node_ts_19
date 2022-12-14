import { Request, Response, NextFunction } from "express";

import { AppDataSource } from "../app";
import { Repository } from "typeorm";
import { Bootcamp } from "../models/Bootcamp.entity";

import { asyncHandler } from "../middleware/asyncHandler";
import { validate, ValidationError } from "class-validator";
import { errorHandler } from "../middleware/errorHandler";
import { ErrorResponse } from "../utils/errorResponse";

import fs from "fs";
import path from "path";

import multer from "multer";

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    // user-{user_ID}-{timestamp}.jpeg
    const ext = file.mimetype.split("/")[1];
    cb(null, `user-${req.params.id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new ErrorResponse(`Please upload an image file`, 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 1000000 }, // 1 MiB
  fileFilter: multerFilter,
});

// @desc      Upload photo for bootcamp using Multer
// @route     PUT /api/v1/bootcamps/:id/multer
// @access    Private
const uploadViaMulter = upload.single("photo");
const bootcampMulterUpload = asyncHandler(async (req, res, next) => {
  const bootcampRepo: Repository<Bootcamp> =
    AppDataSource.getRepository(Bootcamp);

  // let bootcampToUpdate: Bootcamp = await bootcampRepo.findOneBy({
  //   id: req.params.id,
  // });

  let bootcampToUpdate = await bootcampRepo
    .createQueryBuilder("bootcamp")
    .leftJoinAndSelect("bootcamp.user", "user")
    .where("bootcamp.id = :bId", { bId: req.params.id })
    .getOne();

  if (!bootcampToUpdate) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure is bootcamp owner:
  if (
    bootcampToUpdate.user.id.toString() !== req["user"].id &&
    req["user"].role !== "admin"
  ) {
    return next(
      new ErrorResponse(
        `User ${req["user"].id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  const file = req.file;

  await bootcampRepo.update(req.params.id, {
    photo: file.filename,
  });

  res.status(200).json({
    success: true,
    file: file.filename,
  });
});

// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
const getBootcamps = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // {{URL}}/api/v1/bootcamps?select=name,description,housing&sort=name&page=1&limit=5
    const bootcampRepo: Repository<Bootcamp> =
      AppDataSource.getRepository(Bootcamp);

    // This is the amount of results per page shown
    const limit = parseInt(<string>req.query.limit, 10) || 4;
    const page = parseInt((req.query.page as string) || "1");

    let data, total;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const pagination = {
      next: undefined,
      prev: undefined,
    };

    // If Filter + Select + Sorting:
    if (req.query.filter && req.query.select && req.query.sort) {
      // {{URL}}/api/v1/bootcamps?filter[name]=Devcentral&filter[city]=Kingston&select=name,course.title&sort=course.title

      let keys = Object.keys(req.query.filter);
      let values = Object.values(req.query.filter);
      let bootcamps, total;

      if (keys.length === 1) {
        bootcamps = await bootcampRepo
          .createQueryBuilder("bootcamp")
          .leftJoinAndSelect("bootcamp.courses", "course")
          .select([`${req.query.select}`])
          .orderBy(`${req.query.sort}`)
          .take(limit)
          .skip((page - 1) * limit)
          .where(`to_tsvector(${keys.toString()}) @@ to_tsquery(:value)`, {
            value: `${values.toString()}`,
          })
          .getRawMany();

        total = await bootcampRepo
          .createQueryBuilder("bootcamp")
          .leftJoinAndSelect("bootcamp.courses", "course")
          .select([`${req.query.select}`])
          .orderBy(`${req.query.sort}`)
          .take(limit)
          .skip((page - 1) * limit)
          .where(`to_tsvector(${keys[0].toString()}) @@ to_tsquery(:value)`, {
            value: `${values[0].toString()}`,
          })
          .andWhere(
            `to_tsvector(${keys[1].toString()}) @@ to_tsquery(:value_two)`,
            {
              value_two: `${values[1].toString()}`,
            }
          )
          .getCount();
      } else if (keys.length === 2) {
        bootcamps = await bootcampRepo
          .createQueryBuilder("bootcamp")
          .leftJoinAndSelect("bootcamp.courses", "course")
          .select([`${req.query.select}`])
          .orderBy(`${req.query.sort}`)
          .take(limit)
          .skip((page - 1) * limit)
          .where(`to_tsvector(${keys[0].toString()}) @@ to_tsquery(:value)`, {
            value: `${values[0].toString()}`,
          })
          .andWhere(
            `to_tsvector(${keys[1].toString()}) @@ to_tsquery(:value_two)`,
            {
              value_two: `${values[1].toString()}`,
            }
          )
          .getRawMany();

        total = await bootcampRepo
          .createQueryBuilder("bootcamp")
          .leftJoinAndSelect("bootcamp.courses", "course")
          .select([`${req.query.select}`])
          .orderBy(`${req.query.sort}`)
          .take(limit)
          .skip((page - 1) * limit)
          .where(`to_tsvector(${keys[0].toString()}) @@ to_tsquery(:value)`, {
            value: `${values[0].toString()}`,
          })
          .andWhere(
            `to_tsvector(${keys[1].toString()}) @@ to_tsquery(:value_two)`,
            {
              value_two: `${values[1].toString()}`,
            }
          )
          .getCount();
      }

      return res.status(200).json({
        success: true,
        count: total,
        pagination: pagination,
        data: bootcamps,
      });
    }

    // If both filtering + sorting:
    if (req.query.select && req.query.sort) {
      // {{URL}}/api/v1/bootcamps?select=name,course.title&sort=course.title
      const bootcamps = await bootcampRepo
        .createQueryBuilder("bootcamp")
        .leftJoinAndSelect("bootcamp.courses", "course")
        .select([`${req.query.select}`])
        .orderBy(`${req.query.sort}`)
        .take(limit)
        .skip((page - 1) * limit)
        .getRawMany();

      total = await bootcampRepo
        .createQueryBuilder("bootcamp")
        .leftJoinAndSelect("bootcamp.courses", "course")
        .select([`${req.query.select}`])
        .orderBy(`${req.query.sort}`)
        .take(limit)
        .skip((page - 1) * limit)
        .getCount();

      return res.status(200).json({
        success: true,
        count: total,
        pagination: pagination,
        data: bootcamps,
      });
    }

    // Filtering/Selection:
    if (req.query.select) {
      // {{URL}}/api/v1/bootcamps?select=name,course.title
      const bootcamps = await bootcampRepo
        .createQueryBuilder("bootcamp")
        .leftJoinAndSelect("bootcamp.courses", "course")
        .select([`${req.query.select}`])
        .take(limit)
        .skip((page - 1) * limit)
        .getRawMany();

      total = await bootcampRepo
        .createQueryBuilder("bootcamp")
        .leftJoinAndSelect("bootcamp.courses", "course")
        .select([`${req.query.select}`])
        .take(limit)
        .skip((page - 1) * limit)
        .getCount();

      return res.status(200).json({
        success: true,
        count: total,
        pagination: pagination,
        data: bootcamps,
      });
    }

    // Sorting:
    if (req.query.sort) {
      const bootcamps = await bootcampRepo
        .createQueryBuilder("bootcamp")
        .leftJoinAndSelect("bootcamp.courses", "course")
        .orderBy(`${req.query.sort}`)
        .take(limit)
        .skip((page - 1) * limit)
        .getMany();

      total = await bootcampRepo
        .createQueryBuilder("bootcamp")
        .leftJoinAndSelect("bootcamp.courses", "course")
        .orderBy(`${req.query.sort}`)
        .take(limit)
        .skip((page - 1) * limit)
        .getCount();

      return res.status(200).json({
        success: true,
        count: total,
        pagination: pagination,
        data: bootcamps,
      });
    }

    // if Filtering:
    // {{URL}}/api/v1/bootcamps?filter[name]=Devcentral&filter[city]=Kingston
    if (req.query.filter) {
      let keys = Object.keys(req.query.filter);
      let values = Object.values(req.query.filter);
      let bootcamps;

      if (keys.length === 1) {
        bootcamps = await bootcampRepo
          .createQueryBuilder("bootcamp")
          .leftJoinAndSelect("bootcamp.courses", "course")
          .select()
          .where(`to_tsvector(${keys.toString()}) @@ to_tsquery(:value)`, {
            value: `${values.toString()}`,
          })
          .getMany();
      } else if (keys.length === 2) {
        bootcamps = await bootcampRepo
          .createQueryBuilder("bootcamp")
          .leftJoinAndSelect("bootcamp.courses", "course")
          .select()
          .where(`to_tsvector(${keys[0].toString()}) @@ to_tsquery(:value)`, {
            value: `${values[0].toString()}`,
          })
          .andWhere(
            `to_tsvector(${keys[1].toString()}) @@ to_tsquery(:value_two)`,
            {
              value_two: `${values[1].toString()}`,
            }
          )
          .getMany();
      }

      return res.status(200).send({
        success: true,
        data: bootcamps,
      });
    }

    [data, total] = await bootcampRepo.findAndCount({
      relations: {
        courses: true,
      },
      take: limit,
      skip: (page - 1) * limit,
      // cache: {
      //   id: "bootcamp_cache",
      //   milliseconds: 2000,
      // },
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

// @desc      Get single bootcamp
// @route     GET /api/v1/bootcamps/:id
// @access    Public
const getBootcamp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const bootcampRepo: Repository<Bootcamp> =
      AppDataSource.getRepository(Bootcamp);

    const bootcamp: Bootcamp = await bootcampRepo.findOneBy({
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
    // Add User to body:
    console.log(req["user"].id);
    req.body.user = req["user"].id;

    const bootcamp = new Bootcamp();
    const bootcampRepo: Repository<Bootcamp> =
      AppDataSource.getRepository(Bootcamp);

    // Check for published bootcamp
    const publishedBootcamp = await bootcampRepo
      .createQueryBuilder("bootcamp")
      .leftJoinAndSelect("bootcamp.user", "user")
      .where("bootcamp.user = :userId", { userId: req["user"].id })
      .getOne();

    // If the user is not an admin, they can only add one bootcamp
    if (publishedBootcamp && req["user"].role !== "admin") {
      return next(
        new ErrorResponse(
          `The user with ID ${req["user"].id} has already published a bootcamp`,
          400
        )
      );
    }

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
    const bootcampRepo: Repository<Bootcamp> =
      AppDataSource.getRepository(Bootcamp);

    // let bootcampToUpdate: Bootcamp = await bootcampRepo.findOneBy({
    //   id: req.params.id,
    // });

    let bootcampToUpdate = await bootcampRepo
      .createQueryBuilder("bootcamp")
      .leftJoinAndSelect("bootcamp.user", "user")
      .where("bootcamp.id = :bId", { bId: req.params.id })
      .getOne();

    if (!bootcampToUpdate) {
      return next(
        new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure is bootcamp owner:
    if (
      bootcampToUpdate.user.id.toString() !== req["user"].id &&
      req["user"].role !== "admin"
    ) {
      return next(
        new ErrorResponse(
          `User ${req["user"].id} is not authorized to update this bootcamp`,
          401
        )
      );
    }

    console.log(bootcampToUpdate.user);
    console.log(bootcampToUpdate.user.id);
    console.log(req["user"].id);

    const bootcamp = new Bootcamp();
    const entity = Object.assign(bootcamp, req.body);

    const err: ValidationError[] = await validate(bootcampToUpdate, {
      validationError: { target: false },
      skipMissingProperties: true,
    });

    if (err.length > 0) {
      errorHandler(err, req, res, next);
    } else {
      await bootcampRepo.update(req.params.id, {
        ...req.body,
      });

      bootcampToUpdate = await bootcampRepo.findOneBy({
        id: req.params.id,
      });

      res.status(200).json({
        success: true,
        data: bootcampToUpdate,
      });
    }
  }
);

// @desc      Delete bootcamp
// @route     DELETE /api/v1/bootcamps/:id
// @access    Private
const deleteBootcamp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const bootcampRepo: Repository<Bootcamp> =
      AppDataSource.getRepository(Bootcamp);

    // let bootcamp: Bootcamp = await bootcampRepo.findOneBy({
    //   id: req.params.id,
    // });

    let bootcamp = await bootcampRepo
      .createQueryBuilder("bootcamp")
      .leftJoinAndSelect("bootcamp.user", "user")
      .where("bootcamp.id = :bId", { bId: req.params.id })
      .getOne();

    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure is bootcamp owner:
    if (
      bootcamp.user.id.toString() !== req["user"].id &&
      req["user"].role !== "admin"
    ) {
      return next(
        new ErrorResponse(
          `User ${req["user"].id} is not authorized to delete this bootcamp`,
          401
        )
      );
    }

    await bootcampRepo.delete(req.params.id);

    // Remove cache for newly deleted bootcamp:
    // await AppDataSource.queryResultCache.remove(["bootcamp_cache"]);

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);

const seedUpBootcamp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const bootcampRepo: Repository<Bootcamp> =
      AppDataSource.getRepository(Bootcamp);

    const bootcamps = JSON.parse(
      fs.readFileSync(
        `${path.join(__dirname, "../")}/_data/bootcamps.json`,
        "utf-8"
      )
    );

    const bootcampEntities = bootcampRepo.create(bootcamps);

    await AppDataSource.createQueryBuilder()
      .insert()
      .into(Bootcamp)
      .values(bootcampEntities)
      .execute();

    res.status(200).json({
      success: true,
    });
  }
);

const seedDownBootcamp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const bootcampRepo: Repository<Bootcamp> =
      AppDataSource.getRepository(Bootcamp);

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
  uploadViaMulter,
  bootcampMulterUpload,
};
