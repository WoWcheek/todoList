import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 3030;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_ATLAS_LINK);

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

let today = new Date();
let todayDay = dayNames[today.getDay()];
let todayDate = today.getDate() + " " + monthNames[today.getMonth()] + ", " + today.getFullYear();

let firstWeekDay = new Date (today);
firstWeekDay = subtractDays(firstWeekDay, (firstWeekDay.getDay() == 0 ? 6 : firstWeekDay.getDay() - 1));
let lastWeekDay = new Date (today);
lastWeekDay = subtractDays(lastWeekDay, (lastWeekDay.getDay() == 0 ? 0 : -1*(7 - lastWeekDay.getDay())));
let startToEndOfWeek = firstWeekDay.getDate() + " " + monthNames[firstWeekDay.getMonth()] 
                     + " - " + lastWeekDay.getDate() + " " + monthNames[lastWeekDay.getMonth()];

function subtractDays(date, numberOfDays) {
    date.setDate(date.getDate() - numberOfDays);
    return date;
}

function countChecked(tasksArray) {
    let checked = 0;
    tasksArray.forEach(task => {
        if(task.isChecked)
            checked++;
    });
    return checked;
}

const taskSchema = new mongoose.Schema({
    heading: {
        type: String,
        required: [true, 'Task must have heading']
    },
    content: String,
    isChecked: {
        type: Boolean,
        required: [true, 'Task must have isChecked property']
    },
    belongsToTaskList: {
        type: String,
        enum: ['today', 'week']
    }
});
const Task = new mongoose.model("Task", taskSchema);

app.get("/", (req, res) => {
    res.redirect("/today");
});

app.get("/today", async (req, res) => {
    let todayTasks = await Task.find({belongsToTaskList: 'today'});
    let weekTasks = await Task.find({belongsToTaskList: 'week'});
    res.render("index.ejs", 
    {day: todayDay, date: todayDate, tasks: todayTasks, 
     doneToday: countChecked(todayTasks), allToday: todayTasks.length,
     doneWeek: countChecked(weekTasks), allWeek: weekTasks.length});
});

app.get("/week", async (req, res) => {
    let todayTasks = await Task.find({belongsToTaskList: 'today'});
    let weekTasks = await Task.find({belongsToTaskList: 'week'});
    res.render("index.ejs", 
    {week: startToEndOfWeek, tasks: weekTasks, 
     doneToday: countChecked(todayTasks), allToday: todayTasks.length,
     doneWeek: countChecked(weekTasks), allWeek: weekTasks.length});
});

app.post("/today", async (req, res) => {
    const newTask = new Task({
        heading: req.body.newItemHeading, 
        content: req.body.newItemContent, 
        isChecked: false,
        belongsToTaskList: 'today'
    });
    await newTask.save();
    res.redirect("/today");
});

app.post("/week", async (req, res) => {
    const newTask = new Task({
        heading: req.body.newItemHeading, 
        content: req.body.newItemContent, 
        isChecked: false,
        belongsToTaskList: 'week'
    });
    await newTask.save();
    res.redirect("/week");
});

app.post("/check", async (req, res) => {
    const checkedTask = await Task.find({_id:req.body.id});
    await Task.updateOne({_id:req.body.id}, {$set:{isChecked: !checkedTask[0].isChecked}});
    if (checkedTask[0].belongsToTaskList === "week")
        res.redirect("/week");
    else
        res.redirect("/today");
});

app.post("/delete", async (req, res) => {
    const taskToDelete = await Task.find({_id:req.body.id});
    await Task.deleteOne({_id:req.body.id});
    if (taskToDelete[0].belongsToTaskList === "week")
        res.redirect("/week");
    else
        res.redirect("/today");
});

app.post("/todayClear", async (req, res) => {
    await Task.deleteMany({belongsToTaskList:"today"});
    res.redirect("/today");
});

app.post("/weekClear", async (req, res) => {
    await Task.deleteMany({belongsToTaskList:"week"});
    res.redirect("/week");
});

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});