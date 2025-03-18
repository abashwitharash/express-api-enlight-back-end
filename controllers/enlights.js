
const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Enlight = require("../models/enlight.js");
const router = express.Router();


router.post("/", verifyToken, async (req, res) => {
    try {
      req.body.author = req.user._id;
      const enlight = await Enlight.create(req.body);
      enlight._doc.author = req.user;
      res.status(201).json(enlight);
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  });

  router.get("/", verifyToken, async (req, res) => {
    try {
      const enlights = await Enlight.find({})
        .populate("author")
        .sort({ createdAt: "desc" });
      res.status(200).json(enlights);
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  });


module.exports = router;
