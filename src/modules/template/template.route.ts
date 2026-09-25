import { Router } from "express";
import { authMiddleware, roleMiddleware } from "../../middleware/auth-middlewares";
import { templateControllers } from "./template.controller";


import {
  createTemplateSchema,
  updateTemplateSchema,
  templateIdSchema,
} from "./template.validation";
import { validateRequest } from "../../middleware/validateRequest";

const templateRouter: Router = Router();

// 👉 Create (ADMIN only)
templateRouter.post(
  "/create",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  validateRequest(createTemplateSchema ),
  templateControllers.createTemplateController
);

// 👉 Get all (public)
templateRouter.get(
  "/",
  templateControllers.getAllTemplates
);

// 👉 Get most popular (public)
templateRouter.get(
  "/popular",
  templateControllers.getPopularTemplates
);

// 👉 Get single (public)
templateRouter.get(
  "/templateDetails/:id",
  validateRequest( templateIdSchema ),
  templateControllers.getTemplateDetails
);

// 👉 Update (ADMIN only)
templateRouter.patch(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  validateRequest( updateTemplateSchema,
  ),
  templateControllers.updateTemplateController
);

// 👉 Delete (ADMIN only)
templateRouter.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  templateControllers.deleteTemplateController
);

export default templateRouter;