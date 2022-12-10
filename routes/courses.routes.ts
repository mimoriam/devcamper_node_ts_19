import { Router } from "express";
import {
  addCourse,
  deleteCourse,
  getCourse,
  getCourses,
  seedDownCourse,
  seedUpCourse,
  updateCourse,
} from "../controllers/courses.controller";

// Child router:
const router = Router({ mergeParams: true });

router.route("/up").get(seedUpCourse);
router.route("/down").get(seedDownCourse);

router.route("/").get(getCourses).post(addCourse);

router.route("/:id").get(getCourse).put(updateCourse).delete(deleteCourse);

export { router };
