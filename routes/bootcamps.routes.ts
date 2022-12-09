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

router.route("/up").get(seedUpBootcamp);
router.route("/down").get(seedDownBootcamp);

router.route("/").get(getBootcamps).post(createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

export { router };
