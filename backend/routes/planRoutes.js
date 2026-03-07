import express from "express";
import {
  createPlan,
  modifyPlan,
  getPlan,
  getMCQs,
  markBlockComplete,
  generateNextPeriod,
} from "../controllers/planController.js";

const router = express.Router();

router.post("/create", createPlan);
router.post("/modify", modifyPlan);
router.post("/mcqs", getMCQs);
router.post("/complete", markBlockComplete);
router.post("/generate-next", generateNextPeriod);
router.get("/:id", getPlan);

export default router;
