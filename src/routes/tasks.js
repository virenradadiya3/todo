const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// @route   POST /tasks
// @desc    Create a new task
// @access  Private
router.post('/createTodo', protect, async (req, res) => {
  try {
    const { todoTitle, todoDescription, todoStatus, todoDeadline } = req.body;

    const task = await Task.create({
      todoOwner: req.user.id,
      todoTitle,
      todoDescription,
      todoStatus,
      todoDeadline
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /tasks
// @desc    Get all tasks for logged-in user
// @access  Private
router.get('/getAllTodos', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ todoOwner: req.user.id }).sort({ todoCreatedAt: -1 });
    // Check if tasks array is empty and return appropriate message
    if (tasks.length === 0) {
      return res.status(200).json({
        message: "No tasks found",
        data: [],
        count: 0
      });
    }

    // Return tasks with count if tasks exist
    res.json({
      message: "Tasks retrieved successfully",
      data: tasks,
      count: tasks.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /tasks/:id
// @desc    Get a specific task
// @access  Private
router.get('/getTodo/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user owns the task
    if (task.todoOwner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /tasks/:id
// @desc    Update a task
// @access  Private
router.put('/updateTodo/:id', protect, async (req, res) => {
  try {
    // Get only the fields that were sent in the request
    console.log("req.body=====>",req.body)
    const updates = req.body;
    
    let task = await Task.findById(req.params.id);

    console.log("task=====>",task)
    
    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user owns the task
    if (task.todoOwner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }
    
    // Handle partial updates - only update fields that were provided
    // No need to check each field individually
    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    
    res.json({
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/deleteTodo/:id', protect, async (req, res) => {
  try {
    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task ID format' });
    }

    // First find the task
    const task = await Task.findById(req.params.id);
    
    // Debug logs
    console.log('Task to delete:', task);
    console.log('User ID:', req.user.id);
    
    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user owns the task
    if (task.todoOwner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    // Use findOneAndDelete for better error handling
    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      todoOwner: req.user.id
    });

    // Verify deletion
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task could not be deleted' });
    }

    res.json({ 
      message: 'Task removed successfully',
      data: deletedTask
    });
  } catch (error) {
    // Improved error logging
    console.error('Delete task error:', {
      error: error.message,
      stack: error.stack,
      taskId: req.params.id,
      userId: req.user?.id
    });

    // Handle specific error types
    if (error.name === 'CastError' || error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid task ID format' });
    }

    res.status(500).json({ 
      message: 'Server error while deleting task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;