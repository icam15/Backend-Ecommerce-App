import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import { ResponseError } from "../helpers/response-error";
import { logger } from "../libs/logger";

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const extensionFilter = ["png", "jpg", "jpeg"];
  const validateExt = extensionFilter.includes(
    file.mimetype.split("/")[1].toLowerCase()
  );
  if (!validateExt) {
    return cb(new ResponseError(400, "Invalid file extension"));
  } else {
    cb(null, true);
  }
};

export const uploadFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 },
});
