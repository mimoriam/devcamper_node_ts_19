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
import { authorize, protect } from "../middleware/authHandler";

// Child router:
const router = Router({ mergeParams: true });

router.route("/up").get(seedUpCourse);
router.route("/down").get(seedDownCourse);

router
  .route("/")
  .get(getCourses)
  .post(protect, authorize("publisher", "admin"), addCourse);

router
  .route("/:id")
  .get(getCourse)
  .put(protect, authorize("publisher", "admin"), updateCourse)
  .delete(protect, authorize("publisher", "admin"), deleteCourse);

export { router };
