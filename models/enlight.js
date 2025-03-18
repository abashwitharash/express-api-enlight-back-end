const mongoose = require('mongoose');


const commentSchema = new mongoose.Schema(
    {
      text: {
        type: String,
        required: true
      },
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
  );

const enlightSchema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        required: true,
        enum: ['Fitness', 'Sports', 'Travel', 'Relationship', 'Hobbies'],
      },
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      comments: [commentSchema], 
  },
    { timestamps: true }
  );

  const Enlight = mongoose.model('Enlight', enlightSchema);

  module.exports = Enlight;