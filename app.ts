// npm i -D typescript ts-node nodemon
// tsc --init
//     "emitDecoratorMetadata": true,
//     "experimentalDecorators": true

// npm i express
// npm i -D @types/express @types/node

// npm i dotenv
// npm i cookie-parser
// npm i -D @types/cookie-parser

import express, { Express } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";

import { DataSource } from "typeorm";

import "reflect-metadata";

// Load env vars:
dotenv.config({ path: "./config/config.env" });

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.HOST,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.PG_USER,
  password: process.env.PG_PASS,
  database: process.env.DATABASE,
  entities: [],
  logging: false,
  // Turn this to false in production:
  synchronize: true,
});

// Route files:
const bootcampRouter = require("./routes/bootcamps.routes");

// Initialize DB:
AppDataSource.initialize()
  .then(() => {
    console.log("Successfully connected to Database!");
  })
  .catch((err) => console.log(err));

// Initialize Express App:
const PORT = process.env.port;
const app: Express = express();

// Express Middlewares:
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Mount Routers:
app.use("/api/v1/bootcamps", bootcampRouter);

// Listening on a specific port:
app.listen(PORT || 3000, () => {
  console.log(`Listening on port: ${PORT}`);
});
