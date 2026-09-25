import status from "http-status";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { templateServices } from "./template.service";

// 👉 Create
const createTemplateController = asyncHandler(async (req, res) => {
  const result = await templateServices.createTemplate(req.body);

  return sendSuccess(res, {
    data: result,
    message: "New Template Created Successfully",
    statusCode: status.CREATED,
  });
});

// 👉 Get all
const getAllTemplates = asyncHandler(async (req, res) => {
  const result = await templateServices.allTemplatesList();

  return sendSuccess(res, {
    data: result,
    message: "All templates fetched",
  });
});

// 👉 Get most popular (by real usage)
const getPopularTemplates = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 6;
  const result = await templateServices.getPopularTemplates(limit);

  return sendSuccess(res, {
    data: result,
    message: "Popular templates fetched",
  });
});

// 👉 Get single
const getTemplateDetails = asyncHandler(async (req, res) => {
  const result = await templateServices.getTemplateById(req.params.id as string);

  return sendSuccess(res, {
    data: result,
    message: "Template details fetched",
  });
});

// 👉 Update
const updateTemplateController = asyncHandler(async (req, res) => {
  const result = await templateServices.updateTemplate(
    req.params.id as string,
    req.body
  );

  return sendSuccess(res, {
    data: result,
    message: "Template updated successfully",
  });
});

// 👉 Delete
const deleteTemplateController = asyncHandler(async (req, res) => {
  const result = await templateServices.deleteTemplate(req.params.id as string);

  return sendSuccess(res, {
    data: result,
    message: "Template deleted successfully",
  });
});

export const templateControllers = {
  createTemplateController,
  getAllTemplates,
  getPopularTemplates,
  getTemplateDetails,
  updateTemplateController,
  deleteTemplateController,
};