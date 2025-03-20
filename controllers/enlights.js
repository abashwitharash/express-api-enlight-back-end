
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

  router.get('/:enlightId', verifyToken, async (req, res) => {
    try {
      const enlight = await Enlight.findById(req.params.enlightId).populate([
        'author',
        'comments.author',
      ]);
      res.status(200).json(enlight);
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  });

  router.put("/:enlightId", verifyToken, async (req, res) => {
    try {
      const enlight = await Enlight.findById(req.params.enlightId);
  
      // Check permissions:
      if (!enlight.author.equals(req.user._id)) {
        return res.status(403).send("You're not allowed to do that!");
      }
  
      const updatedEnlight = await Enlight.findByIdAndUpdate(
        req.params.enlightId,
        req.body,
        { new: true }
      );
  
      // Append req.user to the author property:
      updatedEnlight._doc.author = req.user;
  
      // Issue JSON response:
      res.status(200).json(updatedEnlight);
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  });


  router.delete("/:enlightId", verifyToken, async (req, res) => {
    try {
      const enlight = await Enlight.findById(req.params.enlightId);
  
      if (!enlight.author.equals(req.user._id)) {
        return res.status(403).send("You're not allowed to do that!");
      }
  
      const deletedEnlight = await Enlight.findByIdAndDelete(req.params.enlightId);
      res.status(200).json(deletedEnlight);
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  });

  router.post("/:enlightId/comments", verifyToken, async (req, res) => {
    try {
      req.body.author = req.user._id;
      const enlight = await Enlight.findById(req.params.enlightId);
      enlight.comments.push(req.body);
      await enlight.save();
  
      // Find the newly created comment:
      const newComment = enlight.comments[enlight.comments.length - 1];
  
      newComment._doc.author = req.user;
  
      // Respond with the newComment:
      res.status(201).json(newComment);
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  });


  router.put("/:enlightId/comments/:commentId", verifyToken, async (req, res) => {
    try {
      const enlight = await Enlight.findById(req.params.enlightId);
      const comment = enlight.comments.id(req.params.commentId);
  
      // ensures the current user is the author of the comment
      if (comment.author.toString() !== req.user._id) {
        return res
          .status(403)
          .json({ message: "You are not authorized to edit this comment" });
      }
  
      comment.text = req.body.text;
      await enlight.save();
      res.status(200).json({ message: "Comment updated successfully" });
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  });

  router.delete("/:enlightId/comments/:commentId", verifyToken, async (req, res) => {
    try {
      const enlight = await Enlight.findById(req.params.enlightId);
      const comment = enlight.comments.id(req.params.commentId);
  
      // ensures the current user is the author of the comment
      if (comment.author.toString() !== req.user._id) {
        return res
          .status(403)
          .json({ message: "You are not authorized to edit this comment" });
      }
  
      enlight.comments.remove({ _id: req.params.commentId });
      await enlight.save();
      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  });

module.exports = router;
