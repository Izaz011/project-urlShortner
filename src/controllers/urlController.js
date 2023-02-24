const { findOne, create }=require ("../models/urlModel")
const { generate }=require("short-id")
const redis=require("redis")
const { promisify }=require("util");

//Connect to redis
const redisClient = redis.createClient(
    18795,
    "redis-18795.c264.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("oL8A5aKoEKhu44YCAUzXdInOcRs0m4o6", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Redis is running on Port 18795");
});


//Connection setup for redis------------------

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

const createShortUrl=async function(req,res){
    const longUrl=req.body.longUrl

    const baseUrl="http://localhost:3000"

    if (!(/^https?:\/\/\w/).test(baseUrl)){
        return res.status(400).send({status:false,msg:"please provide valid base url"})   
    }

    const urlCode=generate()

    if(!longUrl){
        return res.status(400).send({status:false,msg:"please provide long url"})
    }

    
    if (!(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(longUrl.toLowerCase().trim()))){
        return res.status(400).send({status:false,msg:"please provide valid long url"})
    }

    const duplicateLongUrl=await GET_ASYNC(`${longUrl}`)
    const duplicateLongUrlCache=JSON.parse(duplicateLongUrl)
    if(duplicateLongUrlCache){
        return res.status(400).send({status:false,msg:"please provide unique long url"})
    }

    const duplicateUrlDB=await findOne({longUrl:longUrl})
    
    if(duplicateUrlDB){
        await SET_ASYNC(`${longUrl}`,JSON.stringify(duplicateUrlDB),"EX",20)
        return res.status().s302end({status:false,msg:"already short Url exist for this longUrl",urlDetails:duplicateUrlDB})
    }
     
    if(urlCode==duplicateUrlDB.urlCode){
        return res.status(400).send({status:false,msg:"this url code is already created"})
    }

    const shortUrl=baseUrl+"/"+urlCode

    const data={
        urlCode:urlCode,
        longUrl:longUrl,
        shortUrl:shortUrl
    }

    const urlDetails = await create(data)

    let result = {
        urlCode: urlDetails.urlCode,
        longUrl: urlDetails.longUrl,
        shortUrl: urlDetails.shortUrl
    }
    await SET_ASYNC(`${longUrl}`,JSON.stringify(result),"EX",20)
    return res.status(201).send({status:true,msg:"short url is successfiully created",data:result})
}


const getUrl = async function (req, res) {
    try {
        let urlCode = req.params.urlCode
        let urlFromCache = await GET_ASYNC(`${urlCode}`)

        if (urlFromCache) {
            return res.status(200).redirect(JSON.parse(urlFromCache))
        }
        else {
            let urlFromMongoDB = await urlModel.findOne({ urlCode: urlCode });
            if (urlFromMongoDB) {
                await SET_ASYNC(`${urlCode}`, JSON.stringify(urlFromMongoDB.longUrl),"EX",20)
                return res.status(200).redirect(urlFromMongoDB.longUrl);
            }
            else {
                return res.status(404).send({ status: false, msg: "No url found with this urlCode" })
            }
        }
    }
    catch (err) {
        console.log(error)
        return res.status(500).send({ status: true, message: err.message })
    }
}


module.exports={createShortUrl,getUrl}