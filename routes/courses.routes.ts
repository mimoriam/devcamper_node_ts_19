import { Router } from "express";
import {
  getCourses,
  seedDownCourse,
  seedUpCourse,
} from "../controllers/courses.controller";

const router = Router();

router.route("/up").get(seedUpCourse);
router.route("/down").get(seedDownCourse);

router.route("/").get(getCourses);

export { router };
