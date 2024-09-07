const express=require("express")
const errorMiddleware=require("./middleware/error")
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app=express()

// Configure CORS
const corsOptions = {
  origin: 'http://localhost:5173', // Your frontend URL
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true, // Allow credentials
};

app.use(cors(corsOptions));
const user =require("./routes/userRoute")
app.use(express.json())

app.use(cookieParser());
app.use(errorMiddleware)
app.use("/api/v1",user)
module.exports=app;