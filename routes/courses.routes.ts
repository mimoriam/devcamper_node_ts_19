import { Router } from "express";
import {
  seedDownCourse,
  seedUpCourse,
} from "../controllers/courses.controller";

const router = Router();

router.route("/up").get(seedUpCourse);
router.route("/down").get(seedDownCourse);

export { router };
