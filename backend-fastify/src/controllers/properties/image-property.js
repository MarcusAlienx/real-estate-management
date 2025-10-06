import fs from "fs";
import util from "util";
import path from "path";
import { pipeline } from "stream";
import { Property } from "../../models/property.js";

const pump = util.promisify(pipeline);

const isPropertyOwner = function (property, req, res) {
  const user_id = req.user.id;
  if (property.user_id !== user_id) {
    res.status(403).send({ message: "Error: you do not own the property." });
    return false;
  }
  return true;
}

export const addImagesProperty = async function (req, res) {
  const property_id = req.params.id;
  try {
    // We check if property exists
    const property = await Property.findOne({ property_id });
    if (!property) {
      return res.status(404).send({ message: "Error: Can't find property." });
    }

    if (!isPropertyOwner(property, req, res)) return;

    // If property do exist save uploaded files
    const parts = await req.files();
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for await (const data of parts) {
      // Validate file type
      if (!allowedTypes.includes(data.mimetype)) {
        return res.status(400).send({ message: "Invalid file type. Only images are allowed." });
      }

      // Validate file size
      if (data.fileSize > maxSize) {
        return res.status(400).send({ message: "File too large. Maximum size is 5MB." });
      }

      // Sanitize filename
      const sanitizedFilename = data.filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const imgName = new Date().getTime() + "-" + sanitizedFilename;

      // Ensure uploads directory exists
      const uploadsDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      await pump(
        data.file,
        fs.createWriteStream(path.join(uploadsDir, imgName))
      );
      const image =
        req.protocol + "://" + req.headers.host + "/uploads/" + imgName;
      // We update Property images
      property.images.push(image);
      await property.save(); // Wait for the save operation to complete
    }
    return res.status(201).send({ data: property.images });
  } catch (error) {
    return res.status(500).send({ message: "Error: Something went wrong." });
  }
};

export const deleteImagesProperty = async function (req, res) {
  const property_id = req.params.id;
  const { images } = req.body;
  try {
    // We check if property exists
    const property = await Property.findOne({ property_id });
    if (!property) {
      return res.status(404).send({ message: "Error: Can't find property." });
    }

    if (!isPropertyOwner(property, req, res)) return;

    property.images = property.images.filter(
      (img) => !images.includes(img)
    );
    property.save();
    unlinkImages(images);
    return res.send({ data: images });
  } catch (error) {
    return res.status(500).send({ message: "Error: Something went wrong." });
  }
};

export const unlinkImages = function (propertyImages = []) {
  const uploadsDir = path.join(process.cwd(), "uploads");
  const images = propertyImages.map((img) => {
    const imgSplt = img.split("/");
    return imgSplt[imgSplt.length - 1];
  });
  images.forEach((img) => {
    // Prevent directory traversal
    const safePath = path.join(uploadsDir, path.basename(img));
    if (safePath.startsWith(uploadsDir)) {
      fs.unlink(safePath, (err) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log("Successfully deleted " + img);
      });
    }
  });
};