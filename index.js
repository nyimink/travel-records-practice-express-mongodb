import express from "express";
const app = express();

import { MongoClient, ObjectId } from "mongodb";
const mongo = new MongoClient("mongodb://localhost");
const db = mongo.db("travel");

import bodyParser from "body-parser";
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("query parser", "extended")

app.get("/api/records", async (req, res) => {
    try {
        try {
            const options = req.query;
    
            const sort = options.sort || {};
            const filter = options.filter || {};
            const limit = 10;
            const page = parseInt(options.page) || 1;
            const skip = (page - 1) * limit;
    
            for(let i in sort) {
                sort[i] = parseInt(sort[i])
            }
        

            const result = await db
                            .collection("records")
                            .find(filter)
                            .sort(sort)
                            .skip(skip)
                            .limit(limit)
                            .toArray()

            res.status(200)
            res.json({
                meta: {
                    skip,
                    limit,
                    sort,
                    filter,
                    page,
                    total: result.length
                },
                data: result,
                link: {
                    self: req.originalUrl,
                }
            })

        } catch {
            return res.status(400)
        }

    } catch {
        res.sendStatus(500)
    }

})

// app.get("/api/test", (req, res) => {
//     return res.json(req.query)
// })


import { body, param, validationResult } from "express-validator";

app.post("/api/records", 
    [
        body("to").trim().notEmpty(),
        body("from").trim().notEmpty(),
        body("name").trim().notEmpty(),
    ],

    async (req, res) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors})
        }

        try {

            const newRecord = {
                name: req.body.name,
                from: req.body.from,
                to: req.body.to,
                with: req.body.with
            }

            const result = await db
                            .collection("records")
                            .insertOne(newRecord)

            const _id = result.insertedId;

            res.append("Location", "/api/records/" + _id)

            res.status(201).json({
                meta: {
                    _id
                },
                data: {
                    result
                }
            })

        } catch {
            return res.sendStatus(500)
        }

    }
)

app.listen(3000, () => {
    console.log("Server is running at port 3000")
})