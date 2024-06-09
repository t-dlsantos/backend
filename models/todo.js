const mongoose = require('mongoose')

const TaskModel = mongoose.model('tasks', {
    taskTitle: String,
    taskDescription: String,
    taskAction: Boolean,
    userName: String
})

module.exports = {
    TaskModel
}