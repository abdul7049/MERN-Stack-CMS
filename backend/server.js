const app=require("./app")
const connectDatabase=require("./config/database")


const dotenv=require("dotenv")

dotenv.config({path:"backend/config/config.env"});

connectDatabase()


const server=app.listen(process.env.PORT,()=>{

    console.log(`Server is running on localhost ${process.env.PORT}`)
})