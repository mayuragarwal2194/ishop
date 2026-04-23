import cloudinary from "../config/cloudinary.js";

export const uploadImage = async (filePath, folder = "ishop/misc") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
    });
    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    throw new Error("Image Upload failed");
    
  }
}

export const deleteImage = async (public_id) => {
  if (!public_id) return;
  await cloudinary.uploader.destroy(public_id);
};