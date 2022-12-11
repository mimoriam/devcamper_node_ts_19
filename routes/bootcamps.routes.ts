import { Router } from "express";
import {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  seedUpBootcamp,
  seedDownBootcamp,
  uploadViaMulter,
  bootcampMulterUpload,
} from "../controllers/bootcamps.controller";

const router = Router();
import { router as courseRouter } from "./courses.routes";

import { protect, authorize } from "../middleware/authHandler";

router.route("/up").get(seedUpBootcamp);
router.route("/down").get(seedDownBootcamp);

// Parent router accessing child router:
router.use("/:bootcampId/courses", courseRouter);

router
  .route("/")
  .get(getBootcamps)
  .post(protect, authorize("publisher", "admin"), createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize("publisher", "admin"), updateBootcamp)
  .delete(protect, authorize("publisher", "admin"), deleteBootcamp);

router
  .route("/:id/multer")
  .put(
    protect,
    authorize("publisher", "admin"),
    uploadViaMulter,
    bootcampMulterUpload
  );

export { router };
