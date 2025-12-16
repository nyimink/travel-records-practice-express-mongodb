import express from "express";
const router = express.Router();

import { db } from "./index.js";


router.get("/records", async (req, res) => {
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

// router.get("test", (req, res) => {
//     return res.json(req.query)
// })

router.get("/records/:id", async (req, res) => {
    const requestID = req.params.id;
    
    if(!ObjectId.isValid(requestID)) {
        return res.status(400).json({ error: "Invalid Record ID" })
    }
    
    const _id = new ObjectId(req.params.id)
    

    try {
        const result = await db
                        .collection("records")
                        .findOne({ _id })

        return res.status(200).json({
            meta: {
                _id
            },
            data: result
        })

    } catch {
        res.sendStatus(500)
    }
})


import { body, param, validationResult } from "express-validator";
import { ObjectId } from "mongodb";

router.post("/records", 
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

            res.append("Location", "records/" + _id)

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

router.put("/records/:id", async (req, res) => {
    const requestID = req.params.id

    if(!ObjectId.isValid(requestID)) {
        return res.status(400).json({ errors: "Invalid Record ID"})
    }

    const _id = new ObjectId(requestID)

    try {
        const result = await db
                    .collection("records")
                    .findOneAndReplace({ _id }, req.body, { ReturnDocument: "after"})

        
        return res.status(200).json({
            meta: {
                _id
            },
            data: result.value
        })
    }   catch {
        return res.sendStatus(400)
    }
})

router.patch("/records/:id", async (req, res) => {
    const requestID = req.params.id;

    if(!ObjectId.isValid(requestID)) {
        return res.status(400).json({ errors: "Invalid Record ID"})
    }

    const _id = new ObjectId(requestID);

    try {
        const result = await db
                        .collection("records")
                        .findOneAndUpdate(
                            { _id },
                            { $set: req.body },
                            { returnDocument: "after" }
                        )
                    
        return res.status(200).json({
            meta: {
                _id
            },
            data: result.value
        })

    } catch {
        return res.sendStatus(500)
    }

})

router.delete("/records/:id", async (req, res) => {
    const requestID = req.params.id;

    if(!ObjectId.isValid(requestID)) {
        return res.status(400).json({ errors: "Invalid Record ID"})
    }

    const _id = new ObjectId(requestID);

    try {

        const result = await db
                        .collection("records")
                        .deleteOne({ _id })

        return res.status(200).json({ updated: "Deleted one record"})


    } catch {
        return res.sendStatus(500)
    }
})

export default router