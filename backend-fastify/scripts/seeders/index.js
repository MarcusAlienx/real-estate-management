import dotenv from "dotenv";
import mongoose from "mongoose";
// Import Models
import { User } from "../../src/models/user.js";
import { Property } from "../../src/models/property.js";
import { Enquiry } from "../../src/models/enquiry.js";
// Import JSON data
import fs from "fs";
import path from "path";

const users = JSON.parse(fs.readFileSync(path.join(process.cwd(), "scripts/seeders/data/users.json"), "utf8"));
const properties = JSON.parse(fs.readFileSync(path.join(process.cwd(), "scripts/seeders/data/properties.json"), "utf8"));
const enquiries = JSON.parse(fs.readFileSync(path.join(process.cwd(), "scripts/seeders/data/enquiries.json"), "utf8"));

dotenv.config();

const seedData = async (Model, data, modelName) => {
  try {
    await Model.deleteMany({});
    console.log(`${modelName} collection is now empty!`);
    await Model.insertMany(data);
    console.log(`${modelName} collection seeded successfully!`);
  } catch (error) {
    console.error(`Failed to seed ${modelName}:`, error);
    throw error; // Exit if any operation fails
  }
};

const seedDatabase = async () => {
  console.log("Starting the database seeding process...");
  await seedData(User, users, "User");
  await seedData(Property, properties, "Property");
  await seedData(Enquiry, enquiries, "Enquiry");
  console.log("All data seeded successfully!");
};

const runSeeder = async () => {
  if (process.env.NODE_ENV === "production") {
    console.error("Seeder cannot run in production. Exiting...");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.DB_CONNECT, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("MongoDB connection established for seeding!");

    await seedDatabase();
  } catch (error) {
    console.error("Database seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed. Process exiting...");
    process.exit(0);
  }
};

runSeeder();
