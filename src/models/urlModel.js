const { Schema, model }=require("mongoose");

const urlSchema = new Schema({
    urlCode: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    longUrl: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    shortUrl: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }
})

module.exports=model("URL",urlSchema)