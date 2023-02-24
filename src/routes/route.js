const { Router }=require("express")
const router=Router()
const { createShortUrl }= require("../controllers/urlController");

router.post("/url/shorten",createShortUrl)
router.get('/:urlCode',urlController.getUrl)


module.exports=router