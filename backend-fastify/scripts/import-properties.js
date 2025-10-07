import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Property } from "../src/models/property.js";
import { User } from "../src/models/user.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Property mapping templates for different CMS
const CMS_MAPPINGS = {
  wordpress: {
    title: 'post_title',
    content: 'post_content',
    excerpt: 'post_excerpt',
    address: 'meta._property_address',
    price: 'meta._property_price',
    bedrooms: 'meta._property_bedrooms',
    bathrooms: 'meta._property_bathrooms',
    area: 'meta._property_area',
    type: 'meta._property_type',
    status: 'post_status',
    images: 'meta._property_images',
    latitude: 'meta._property_latitude',
    longitude: 'meta._property_longitude'
  },
  drupal: {
    title: 'title',
    content: 'body.value',
    address: 'field_address.value',
    price: 'field_price.value',
    type: 'field_property_type.value',
    images: 'field_images',
    latitude: 'field_latitude.value',
    longitude: 'field_longitude.value'
  },
  csv: {
    title: 'Title',
    address: 'Address',
    price: 'Price',
    type: 'Type',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    area: 'Area',
    description: 'Description',
    latitude: 'Latitude',
    longitude: 'Longitude',
    images: 'Images'
  }
};

class PropertyImporter {
  constructor() {
    this.userId = null;
  }

  async connect() {
    try {
      await mongoose.connect(process.env.DB_CONNECT);
      console.log("✅ Connected to MongoDB");

      // Get or create admin user
      await this.setupAdminUser();
    } catch (error) {
      console.error("❌ MongoDB connection failed:", error);
      process.exit(1);
    }
  }

  async setupAdminUser() {
    try {
      // Try to find existing admin user
      let adminUser = await User.findOne({ email: 'admin@metroland.com' });

      if (!adminUser) {
        // Create admin user if doesn't exist
        adminUser = new User({
          user_id: 'admin-' + Date.now(),
          fullName: 'Administrator',
          email: 'admin@metroland.com',
          password: '$2a$12$aTl.102LhEH2A81kotESTuPN47ItWYuDQ6uU6OlUvXBodZqn0Ra8a', // password: "admin123"
          verified: true
        });
        await adminUser.save();
        console.log("✅ Admin user created: admin@metroland.com / admin123");
      }

      this.userId = adminUser.user_id;
    } catch (error) {
      console.error("❌ Error setting up admin user:", error);
      process.exit(1);
    }
  }

  async importFromWordPress(jsonFilePath) {
    console.log("📄 Importing from WordPress JSON...");

    try {
      const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
      const posts = data.filter(item => item.post_type === 'property');

      console.log(`Found ${posts.length} properties to import`);

      for (const post of posts) {
        const property = this.mapWordPressProperty(post);
        if (property) {
          await this.saveProperty(property);
        }
      }

      console.log("✅ WordPress import completed");
    } catch (error) {
      console.error("❌ WordPress import failed:", error);
    }
  }

  async importFromCSV(csvFilePath) {
    console.log("📄 Importing from CSV...");

    try {
      const csv = require('csv-parser');
      const results = [];

      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          console.log(`Found ${results.length} properties to import`);

          for (const row of results) {
            const property = this.mapCSVProperty(row);
            if (property) {
              await this.saveProperty(property);
            }
          }

          console.log("✅ CSV import completed");
        });
    } catch (error) {
      console.error("❌ CSV import failed:", error);
    }
  }

  async importFromJSON(jsonFilePath) {
    console.log("📄 Importing from JSON...");

    try {
      const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
      const properties = Array.isArray(data) ? data : [data];

      console.log(`Found ${properties.length} properties to import`);

      for (const prop of properties) {
        const property = this.mapGenericProperty(prop);
        if (property) {
          await this.saveProperty(property);
        }
      }

      console.log("✅ JSON import completed");
    } catch (error) {
      console.error("❌ JSON import failed:", error);
    }
  }

  mapWordPressProperty(wpPost) {
    const meta = wpPost.meta || {};

    return {
      property_id: `wp-${wpPost.ID}-${Date.now()}`,
      name: wpPost.post_title || 'Untitled Property',
      address: meta._property_address || '',
      description: wpPost.post_content || wpPost.post_excerpt || '',
      type: this.mapPropertyType(meta._property_type),
      transactionType: 'sale', // Default, can be modified
      position: {
        lat: parseFloat(meta._property_latitude) || 0,
        lng: parseFloat(meta._property_longitude) || 0
      },
      price: parseFloat(meta._property_price) || 0,
      currency: 'MXN',
      features: this.extractFeatures(meta),
      profileImage: meta._property_images ? meta._property_images[0] : '',
      images: meta._property_images || [],
      contactNumber: meta._property_phone || '',
      contactEmail: meta._property_email || '',
      user_id: this.userId
    };
  }

  mapCSVProperty(csvRow) {
    return {
      property_id: `csv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: csvRow.Title || csvRow.title || 'Untitled Property',
      address: csvRow.Address || csvRow.address || '',
      description: csvRow.Description || csvRow.description || '',
      type: this.mapPropertyType(csvRow.Type || csvRow.type),
      transactionType: 'sale',
      position: {
        lat: parseFloat(csvRow.Latitude || csvRow.latitude) || 0,
        lng: parseFloat(csvRow.Longitude || csvRow.longitude) || 0
      },
      price: parseFloat(csvRow.Price || csvRow.price) || 0,
      currency: 'USD',
      features: this.extractCSVFeatures(csvRow),
      images: this.parseImages(csvRow.Images || csvRow.images),
      contactNumber: csvRow.Phone || csvRow.phone || '',
      contactEmail: csvRow.Email || csvRow.email || '',
      user_id: this.userId
    };
  }

  mapGenericProperty(prop) {
    return {
      property_id: prop.property_id || `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: prop.name || prop.title || 'Untitled Property',
      address: prop.address || '',
      description: prop.description || prop.content || '',
      type: this.mapPropertyType(prop.type),
      transactionType: prop.transactionType || 'sale',
      position: {
        lat: parseFloat(prop.latitude || prop.lat) || 0,
        lng: parseFloat(prop.longitude || prop.lng) || 0
      },
      price: parseFloat(prop.price) || 0,
      currency: prop.currency || 'MXN',
      features: prop.features || [],
      profileImage: prop.profileImage || prop.mainImage || '',
      images: prop.images || [],
      contactNumber: prop.contactNumber || prop.phone || '',
      contactEmail: prop.contactEmail || prop.email || '',
      user_id: this.userId
    };
  }

  mapPropertyType(type) {
    if (!type) return 'house';

    const typeMap = {
      'house': 'house',
      'apartment': 'apartment',
      'condo': 'condo',
      'townhouse': 'townhouse',
      'land': 'land',
      'commercial': 'commercial',
      'villa': 'villa'
    };

    return typeMap[type.toLowerCase()] || 'house';
  }

  extractFeatures(meta) {
    const features = [];

    if (meta._property_bedrooms) features.push(`${meta._property_bedrooms} bedrooms`);
    if (meta._property_bathrooms) features.push(`${meta._property_bathrooms} bathrooms`);
    if (meta._property_area) features.push(`${meta._property_area} sq ft`);

    return features;
  }

  extractCSVFeatures(row) {
    const features = [];

    if (row.Bedrooms) features.push(`${row.Bedrooms} bedrooms`);
    if (row.Bathrooms) features.push(`${row.Bathrooms} bathrooms`);
    if (row.Area) features.push(`${row.Area} sq ft`);

    return features;
  }

  parseImages(imagesString) {
    if (!imagesString) return [];

    if (typeof imagesString === 'string') {
      return imagesString.split(',').map(url => url.trim());
    }

    return Array.isArray(imagesString) ? imagesString : [];
  }

  async saveProperty(propertyData) {
    try {
      // Validate required fields
      if (!propertyData.name || !propertyData.address) {
        console.log(`⚠️  Skipping property: missing required fields`);
        return;
      }

      const property = new Property(propertyData);
      await property.save();
      console.log(`✅ Imported property: ${propertyData.name}`);
    } catch (error) {
      console.error(`❌ Error saving property ${propertyData.name}:`, error.message);
    }
  }

  async disconnect() {
    await mongoose.disconnect();
    console.log("✅ Database connection closed");
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
🚀 Property Import Tool

Usage:
  node scripts/import-properties.js <cms-type> <file-path>

CMS Types:
  wordpress  - WordPress property export (JSON)
  csv        - CSV file with property data
  json       - Generic JSON format

Examples:
  node scripts/import-properties.js wordpress ./data/wp-properties.json
  node scripts/import-properties.js csv ./data/properties.csv
  node scripts/import-properties.js json ./data/properties.json

CSV Format Expected:
  Title,Address,Price,Type,Bedrooms,Bathrooms,Area,Description,Latitude,Longitude,Images

JSON Format Expected:
  [
    {
      "name": "Property Name",
      "address": "123 Main St",
      "price": 250000,
      "type": "house",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "images": ["url1", "url2"]
    }
  ]
    `);
    process.exit(1);
  }

  const [cmsType, filePath] = args;

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const importer = new PropertyImporter();

  try {
    await importer.connect();

    switch (cmsType.toLowerCase()) {
      case 'wordpress':
        await importer.importFromWordPress(filePath);
        break;
      case 'csv':
        await importer.importFromCSV(filePath);
        break;
      case 'json':
        await importer.importFromJSON(filePath);
        break;
      default:
        console.error(`❌ Unsupported CMS type: ${cmsType}`);
        console.log('Supported types: wordpress, csv, json');
        process.exit(1);
    }

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await importer.disconnect();
    process.exit(0);
  }
}

main();