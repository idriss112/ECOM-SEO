import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import connectDB from "../config/mongodb.js";
import productModel from "../models/productModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productsDir = path.resolve(__dirname, "../../frontend/public/products");

const catalog = [
  {
    name: "Kids Floral Dress",
    imageFile: "kid-dress-1.jpg",
    price: 34,
    category: "Kids",
    subCategory: "Topwear",
    sizes: ["4Y", "6Y", "8Y"],
    bestseller: true,
    description: "A light everyday kids dress for casual outings and weekend wear.",
  },
  {
    name: "Kids Party Dress",
    imageFile: "kid-dress-2.jpg",
    price: 39,
    category: "Kids",
    subCategory: "Topwear",
    sizes: ["4Y", "6Y", "8Y", "10Y"],
    bestseller: false,
    description: "A dressy option for birthdays, photos, and family events.",
  },
  {
    name: "Kids Winter Jacket",
    imageFile: "kid-jacket.jpg",
    price: 55,
    category: "Kids",
    subCategory: "Winterwear",
    sizes: ["4Y", "6Y", "8Y", "10Y"],
    bestseller: true,
    description: "A warm kids jacket for cooler weather and everyday layering.",
  },
  {
    name: "Men's Street Hoodie",
    imageFile: "men-hoodie-1.jpg",
    price: 58,
    category: "Men",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: true,
    description: "A relaxed men's hoodie built for casual wear and cold days.",
  },
  {
    name: "Men's Everyday Hoodie",
    imageFile: "men-hoodie-2.jpg",
    price: 62,
    category: "Men",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false,
    description: "A clean everyday hoodie with a comfortable fit and soft feel.",
  },
  {
    name: "Men's Essential T-Shirt",
    imageFile: "mens-t-shirt-1.jpg",
    price: 24,
    category: "Men",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false,
    description: "A simple staple t-shirt designed for easy daily styling.",
  },
  {
    name: "Men's Relaxed T-Shirt",
    imageFile: "mens-t-shirt-2.jpg",
    price: 26,
    category: "Men",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false,
    description: "A relaxed-fit tee for effortless casual outfits.",
  },
  {
    name: "Men's Classic T-Shirt",
    imageFile: "mens-t-shirt-3.jpg",
    price: 28,
    category: "Men",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: true,
    description: "A classic everyday tee with a versatile shape and feel.",
  },
  {
    name: "Men's Oversized T-Shirt",
    imageFile: "mens-t-shirt-4.jpg",
    price: 29,
    category: "Men",
    subCategory: "Topwear",
    sizes: ["M", "L", "XL"],
    bestseller: false,
    description: "An oversized tee made for laid-back styling and comfort.",
  },
  {
    name: "Women's Cozy Hoodie",
    imageFile: "woem-hoodie-1.jpg",
    price: 64,
    category: "Women",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: true,
    description: "A cozy women's hoodie with a soft feel for cooler days.",
  },
  {
    name: "Women's Day Dress",
    imageFile: "women-dress-1.jpg",
    price: 48,
    category: "Women",
    subCategory: "Topwear",
    sizes: ["S", "M", "L"],
    bestseller: true,
    description: "A versatile dress for daytime wear, events, and weekends.",
  },
  {
    name: "Women's Evening Dress",
    imageFile: "women-dress-2.jpg",
    price: 54,
    category: "Women",
    subCategory: "Topwear",
    sizes: ["S", "M", "L"],
    bestseller: false,
    description: "A polished dress option with a clean silhouette and easy styling.",
  },
  {
    name: "Women's Soft Hoodie",
    imageFile: "women-hoodie-2.jpg",
    price: 60,
    category: "Women",
    subCategory: "Winterwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false,
    description: "A soft hoodie made for comfort, layering, and everyday wear.",
  },
  {
    name: "Women's Essential T-Shirt",
    imageFile: "women-t-shirt-1.jpg",
    price: 24,
    category: "Women",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false,
    description: "A reliable go-to tee that works with jeans, skirts, or layers.",
  },
  {
    name: "Women's Slim T-Shirt",
    imageFile: "women-t-shirt-2.jpg",
    price: 25,
    category: "Women",
    subCategory: "Topwear",
    sizes: ["S", "M", "L"],
    bestseller: false,
    description: "A slim-fit tee with a clean shape for everyday casual looks.",
  },
  {
    name: "Women's Boxy T-Shirt",
    imageFile: "women-t-shirt-3.jpg",
    price: 27,
    category: "Women",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: true,
    description: "A boxy t-shirt with a modern shape and easy relaxed feel.",
  },
  {
    name: "Women's Weekend T-Shirt",
    imageFile: "women-t-shirt-4.jpg",
    price: 29,
    category: "Women",
    subCategory: "Topwear",
    sizes: ["S", "M", "L", "XL"],
    bestseller: false,
    description: "A weekend-ready tee built for comfort and casual styling.",
  },
];

const ensureImagesExist = () => {
  const missing = catalog
    .map((product) => product.imageFile)
    .filter((imageFile) => !fs.existsSync(path.join(productsDir, imageFile)));

  if (missing.length > 0) {
    throw new Error(
      `Missing product images: ${missing.join(", ")}`
    );
  }
};

const seedProducts = async () => {
  ensureImagesExist();
  await connectDB();

  let insertedOrUpdated = 0;

  for (const item of catalog) {
    const product = {
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      subCategory: item.subCategory,
      sizes: item.sizes,
      bestseller: item.bestseller,
      images: [`/products/${item.imageFile}`],
      date: Date.now(),
    };

    await productModel.updateOne(
      { name: product.name },
      { $set: product },
      { upsert: true }
    );

    insertedOrUpdated += 1;
  }

  console.log(`Seeded ${insertedOrUpdated} demo products.`);
};

try {
  await seedProducts();
} catch (error) {
  console.error("Product seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
