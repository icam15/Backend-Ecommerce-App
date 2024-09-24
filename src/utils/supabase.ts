import { NextFunction } from "express";
import { supabase } from "../libs/supabase";
import { ResponseError } from "../helpers/response-error";

export const uploadImageToBucket = async (
  filePath: string,
  decodedFile: ArrayBuffer
): Promise<{ err: Error | null }> => {
  const fileExt = filePath.split(".")[1];
  const { data, error } = await supabase.storage
    .from("avatar")
    .upload(`public/${filePath}`, decodedFile, {
      contentType: fileExt === "png" ? "image/png" : "image/jpg",
    });

  if (error) {
    throw new ResponseError(400, `${error.name} : ${error.message}`);
  }
  return { err: error };
};

export const getUrlImageFromBucket = async (
  filePath: string
): Promise<{ imageUrl: string }> => {
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatar").getPublicUrl(`public/${filePath}`);

  return { imageUrl: publicUrl };
};
