const express=require("express")
const route=require("./routes/route")
const { connect }=require("mongoose")
const app=express()

app.use(express.json())

connect("mongodb+srv://izazsarkar11:pQ1xcwJzAI5R7SC6@izazlithium.7ghyokt.mongodb.net/customer-card",{
    useNewUrlParser:true
})

.then(()=>console.log("mongodb is connected"))
.catch((error)=>console.log(error.message))

app.use("/",route)

app.listen(process.env.PORT||3000,function(){
    console.log("exppress is running on port "+(3000||process.env.PORT))
})
