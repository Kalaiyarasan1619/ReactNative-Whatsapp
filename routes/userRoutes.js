import express from 'express';
import exp from 'constants';

import User from "../modules/user.js";
import multer from 'multer';
import fs from "fs";
import path from "path";

const router = express.Router();

//setup multer image upload

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb)=>{
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const upload=multer({storage});

//phone by user
router.get("/:phone", async(req,res)=>{
    try {
        const user =await User.findOne({phone : req.params.phone})

        const profileImagePath = user.profileImage ? `${req.protocol}://${req.get('host')}${user.profileImage}` : null;

        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        // res.json(user);

        res.json({
            _id: user._id,  
            phone: user.phone,
            name: user.name,
            profileImage: profileImagePath
        })

    } catch (error) {
        
        res.status(500).json({message: "Server error"});
    }
})

//create user with image upload
router.post("/",upload.single("profileImage"), async(req, res)=>{
    const {phone, name}= req.body;

    try{

        let user =await User.findOne({phone});

        if(user){
            return res.status(400).json({message: "User Already Existence.....!"});
        }

        const profileImage = req.file? `/uploads/${req.file.filename}`:null;
        user=new User({phone, name, profileImage});

        await user.save();

        res.status(201).json(user)

    }catch(err){

        res.status(500).json({message: err.message});

    }
})

//put /api/users/:id

router.put("/:id", upload.single("profileImage"), async (req,res)=>{
    const {name} =req.body;

    try{
        let user= await User.findById(req.params.id);
        if(!user){
           return res.status(404).json({message:"User Not Found"});
        }

        if(req.file){
           if(user.profileImage){

            const oldImagepath=path.join(process.cwd(),user.profileImage);

             if(fs.existsSync(oldImagepath) ){
                 fs.unlinkSync(oldImagepath)
            }
           }

                   user.profileImage =`/uploads/${req.file.filename}`

        }


        if(name){
            user.name =name;
        }
        await user.save();
        res.json(user);

    }catch(error){

    }
})

export default router;