// npm i -D typescript ts-node nodemon
// tsc --init
//     "emitDecoratorMetadata": true,
//     "experimentalDecorators": true

// npm i express
// npm i -D @types/express @types/node

// npm i dotenv
// npm i cookie-parser
// npm i -D @types/cookie-parser

// npm i slugify

// npm i node-geocoder
// npm i -D @types/node-geocoder
// npm install geojson
// npm install -D @types/geojson

// npm i typeorm-relations

// npm i multer
// npm i -D @types/multer

/*** Auth stuff:
 *
 * npm i bcryptjs jsonwebtoken cookie-parser
 * npm i -D @types/bcryptjs @types/jsonwebtoken @types/cookie-parser
 *
 ***/
import * as dotenv from "dotenv";

dotenv.config({ path: __dirname + "/config/config.env" });

import express, { Express } from "express";
import cookieParser from "cookie-parser";
import path from "path";

import { DataSource } from "typeorm";
import { Bootcamp } from "./models/Bootcamp.entity";
import { Course, CourseSubscriber } from "./models/Course.entity";
import { User } from "./models/User.entity";

import { errorHandler } from "./middleware/errorHandler";

import "reflect-metadata";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.HOST,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.PG_USER,
  password: process.env.PG_PASS,
  database: process.env.DATABASE,
  entities: [Bootcamp, Course, User],
  subscribers: [CourseSubscriber],
  logging: false,
  // Turn this to false in production:
  synchronize: true,
  // This sets a cache of 1 second (have to set it up per query too):
  cache: {
    duration: 3000, // 3 seconds
  },
});

// Route files:
import { router as bootcampRouter } from "./routes/bootcamps.routes";
import { router as courseRouter } from "./routes/courses.routes";
import { router as authRouter } from "./routes/auth.routes";

// Initialize DB:
AppDataSource.initialize()
  .then(async (conn) => {
    // await conn.query("CREATE DATABASE IF NOT EXISTS");
    console.log("Successfully connected to Database!");
  })
  .catch((err) => console.log(err));

// Initialize Express App:
const PORT: string = process.env.port;
const app: Express = express();

// Express Middlewares:
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Mount Routers:
app.use("/api/v1/bootcamps", bootcampRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/auth", authRouter);

// Use Error Handler:
app.use(errorHandler);

// Listening on a specific port:
app.listen(PORT || 3000, () => {
  console.log(`Listening on port: ${PORT}`);
});

// Handle unhandled promise rejections:
process.on("unhandledRejection", (err: any, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

// The process manager you???re using will first send a SIGTERM signal
// to the application to notify it that it will be killed:
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  process.exit(1);
});
