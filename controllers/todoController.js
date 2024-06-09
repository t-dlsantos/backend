require('dotenv').config()
const express = require('express')
const router = express.Router()
const auth = require("../middlewares/auth")
const { TaskModel } = require("../models/todo")

router.get("/list", auth, async (req, res) => {
    try {
        const tasks = await TaskModel.find({})
        return res.status(200).json(tasks)
    } catch (error) {
        return res.status(500).json({mensagem: "Erro ao buscar tarefas", error: error.message})
    }
})

router.put("/edit", auth, async (req, res) => {
    const { taskTitle, username, newTasktitle, newTaskdescription, newTaskaction } = req.body;

    if (!taskTitle || !username) {
        return res.status(400).json({ mensagem: "Os campos 'taskTitle' e 'username' são obrigatórios" });
    }

    try {
        const task = await TaskModel.findOne({ taskTitle: taskTitle, username: username });
        if (!task) {
            return res.status(404).json({ mensagem: "Tarefa não encontrada para este usuário" });
        }

        if (newTasktitle !== undefined) {
            task.taskTitle = newTasktitle;
        }
        if (newTaskdescription !== undefined) {
            task.taskDescription = newTaskdescription;
        }
        if (newTaskaction !== undefined) {
            task.taskAction = newTaskaction;
        }

        await task.save();

        return res.status(200).json({ mensagem: "Tarefa atualizada com sucesso", task: task });
    } catch (error) {
        console.error("Erro ao atualizar a tarefa:", error);
        return res.status(500).json({ error: error.message });
    }
});

router.put("/edit-state", auth, async (req, res) => {
    const { taskAction } = req.body;

    try {
        if (taskAction === undefined) {
            return res.status(400).json({ mensagem: "O campo 'taskAction' é obrigatório" });
        }

        await TaskModel.updateMany({ taskAction: { $ne: taskAction } }, { taskAction: taskAction });

        return res.status(200).json({ mensagem: "Tarefas atualizadas com sucesso" });
    } catch (error) {
        console.error("Erro ao atualizar as tarefas:", error);
        return res.status(500).json({ error: error.message });
    }
});

router.delete("/delete", auth, async (req, res) => {
    const { username, taskTitle} = req.body

    if (!username || !taskTitle) {
        return res.status(400).json({mensagem: "Os campos 'username' e 'taskTitle' são obrigatórios"})
    }

    try {
        const task = await TaskModel.findOne({ taskTitle: taskTitle, username: username })
        if (!task) {
            return res.status(404).json({ mensagem: "Tarefa não encontrada para este usuário" })
        }

        await TaskModel.deleteOne({ taskTitle: taskTitle, username: username })

        return res.status(200).json({ mensagem: "Tarefa excluída com sucesso "})
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
})

router.post("/create", auth, async (req, res) => {
    const {taskTitle, taskDescription, taskAction, username} = req.body 
    const task = {
        taskTitle: taskTitle,
        taskDescription: taskDescription,
        taskAction: taskAction
    }

    if(username) {
        task.username = username
    }

    if (!taskTitle || !taskDescription) {
        return res.status(400).json({ mensagem: "Os campos 'taskTitle', 'taskdescription'são obrigatórios" });
    }

    try {
        await TaskModel.create(task)
        return res.status(201).json({
            mensagem: "Tarefa criada com sucesso"
        })
    } catch(error) {
        return res.status(500).json({
            error: error.message
        })
    }
})

router.get("/tasks-without-owner", async (req, res) => {
    try {
        const tasks = await TaskModel.find({ username: { $exists: false } });

        return res.status(200).json({ tasks: tasks });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.put("/add-owner", auth, async (req, res) => {
    const { taskTitle, username } = req.body;

    try {
        const task = await TaskModel.findOne({ taskTitle: taskTitle, username: { $exists: false } });
        if (!task) {
            return res.status(404).json({ mensagem: "Tarefa não encontrada ou já possui um proprietário" });
        }

        task.username = username;
        await task.save(); 

        return res.status(200).json({ mensagem: "Proprietário adicionado à tarefa com sucesso", task: task });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router