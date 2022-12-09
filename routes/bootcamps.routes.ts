import { Router } from "express";
import {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  seedUpBootcamp,
  seedDownBootcamp,
} from "../controllers/bootcamps.controller";

const router = Router();
import { router as courseRouter } from "./courses.routes";

router.route("/up").get(seedUpBootcamp);
router.route("/down").get(seedDownBootcamp);

router.use("/:bootcampId/courses", courseRouter);

router.route("/").get(getBootcamps).post(createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

export { router };
