const mongoose = require('mongoose');

const TodoItemSchema = new mongoose.Schema({
  todoOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TodoUser',
    required: true
  },
  todoTitle: {
    type: String,
    required: true,
    trim: true
  },
  todoDescription: {
    type: String,
    trim: true
  },
  todoStatus: {
    type: String,
    enum: ['notStarted', 'ongoing', 'finished'],
    default: 'notStarted'
  },
  todoDeadline: {
    type: Date
  },
  todoCreatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Task', TodoItemSchema);