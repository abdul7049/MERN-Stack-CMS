const mongoose=require("mongoose")


const connectDatabase=()=>{


    mongoose.connect(process.env.DB_URL).then((data)=>{
        console.log(`Mongodb connected succefully ${data.connection.host}`)
    })
}

module.exports=connectDatabase