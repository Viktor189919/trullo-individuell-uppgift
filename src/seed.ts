import { faker } from '@faker-js/faker';
import connectDB from "./db.js";
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import { Project, Task, User } from "./models/models.js"

dotenv.config()

const rand = (arr : any) => arr[Math.floor(Math.random() * arr.length)];

const taskStatus = ["to-do", "in progress", "blocked", "done"];

async function main() {
	
    await connectDB()
	
    await Promise.all([
		Project.deleteMany({}),
		Task.deleteMany({}),
		User.deleteMany({}),
	]);

    const randUsers = await Promise.all(Array.from({length: 20}).map(async (arr) => {

        if (!process.env.SALT_ROUNDS) {
        throw new Error("SALT_ROUNDS is not defined in env variables")
    }
        return {
            name: faker.internet.username(),
            email: faker.internet.email(),
            password: await bcrypt.hash(faker.internet.password(), parseInt(process.env.SALT_ROUNDS))
        }
    }))

    if (!process.env.SALT_ROUNDS) {
        throw new Error("SALT_ROUNDS is not defined in env variables")
    }

    const hashedPassword = await bcrypt.hash("Passw0rd!", parseInt(process.env.SALT_ROUNDS))
    
    const authUser = {name: "Joel Janson Johansen", email: "admin@example.com", password: hashedPassword}
    
    randUsers.push(authUser)
    const users = await User.insertMany(randUsers)

    const randProjects = [
        {
            title: "Build a website", 
            description: "A website to showcase my portfolio",
            members: Array.from({length: 5}).map(arr => rand(users).id)
        },
        {
            title: "Design operating system", 
            description: "An operating system for my computer",
            members: Array.from({length: 5}).map(arr => rand(users).id)
        }
    ]

    const projects = await Project.insertMany(randProjects);

    const randTasks = Array.from({length: 30}).map(arr => {
        return {
            title: faker.git.branch(),
            description: faker.lorem.sentence({min: 5, max: 15}),
            status: rand(taskStatus),
            assignedTo: rand(users).id,
            projectId: rand(projects).id
        }
    })

    const tasks = await Task.insertMany(randTasks);

    const projectOneTasks = tasks.filter(task => task.projectId.toString() === projects[0]!.id.toString()).map(task => task.id)
    const projectTwoTasks = tasks.filter(task => task.projectId.toString() === projects[1]!.id.toString()).map(task => task.id)

    await Project.findByIdAndUpdate(projects[0]!.id, {$push: {tasks: {$each: projectOneTasks}}})
    await Project.findByIdAndUpdate(projects[1]!.id, {$push: {tasks: {$each: projectTwoTasks}}})
}

main()
    .then(() => {
        console.log("Seed completed"); process.exit(0)
    })
    .catch(error => {
        console.log(`Error when seeding: ${error}`); process.exit(1)
    })