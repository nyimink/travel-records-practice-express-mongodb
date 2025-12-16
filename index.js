import express from "express";
const app = express();

import { MongoClient } from "mongodb";
const mongo = new MongoClient("mongodb://localhost");
export const db = mongo.db("travel");

import bodyParser from "body-parser";
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("query parser", "extended")

import router from "./routes.js";
app.use("/api", router);


app.listen(3000, () => {
    console.log("Server is running at port 3000")
})