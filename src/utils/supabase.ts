import { NextFunction } from "express";
import { supabase } from "../libs/supabase";
import { ResponseError } from "../helpers/response-error";

export const uploadFileToBucket = async (fileName: string, file: any) => {
  const { data, error } = await supabase.storage
    .from("avatar")
    .upload(fileName, file);

  if (error) {
    throw new ResponseError(400, `${error.name} : ${error.message}`);
  }
};

const getUrlFileFromBucket = () => {};
