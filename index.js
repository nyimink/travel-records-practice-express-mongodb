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
                link: req.originalUrl
            })

        } catch {
            return res.status(400)
        }

    } catch {
        res.sendStatus(500)
    }

})

app.get("/api/test", (req, res) => {
    return res.json(req.query)
})



app.listen(3000, () => {
    console.log("Server is running at port 3000")
})