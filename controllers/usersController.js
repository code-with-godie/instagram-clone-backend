import Users from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import NotFoundError from '../errors/not-found.js'
import BadRequestError from '../errors/bad-request.js'
import UnauthenticatedError from '../errors/unauthenticated.js'

export const getAllUsers = async (req,res,next)=>{
  try {
    const {user:{userID}} = req;
    const users = await Users.find({_id:{$ne:userID}},{password:0});
    if(users.length === 0){
      return res.status(StatusCodes.OK).json({success:true,message:"you have no users yet!"});
    }
    return res.status(StatusCodes.OK).json({success:true,nbHits:users.length,users});
  } catch (error) {
   next(error);
  }
}
export const getSingleUser = async (req,res,next)=>{
  try {
    const {params:{id:userID}} = req;
    const user = await Users.findOne({_id:{$ne:userID}},{password:0});
    if(!user){
      throw new NotFoundError("no user with the provided id")
    }
    return res.status(StatusCodes.OK).json({success:true,user});
  } catch (error) {
   next(error);
  }
}
export const register = async (req,res,next)=>{
  try {
    const user = new Users({...req.body});
    const hashedPassword = await user.hashPassword();
    user.password = hashedPassword;
    user.profilePic = req.file?.path || "";
    await user.save();
    const {password,...newUser} = user._doc;
    return res.status(StatusCodes.CREATED).json({success:true,user:newUser});
  } catch (error) {
    next(error);
  }
}
export const login = async (req,res,next)=>{
  try {
    const {body:{email,password}} =  req;
    if(!email || !password){
      throw new BadRequestError("please provide both email and password!");
    }
    const user = await Users.findOne({email});
    if(!user){
      throw new UnauthenticatedError("INVALID EMAIL!");      
    }
    const passwordMatched = await user.checkPassword(password);
    if(!passwordMatched){
      throw new UnauthenticatedError("INVALID PASSWORD!");      
    }
    const token = await user.createToken();
    const {password:removePassword,...newUser} = user._doc;
    return res.status(StatusCodes.CREATED).json({success:true,user:newUser,token});
  } catch (error) {
    next(error);
  }
}
export const updateUser = async (req,res,next)=>{
  try {
    const {params:{id:userID},user:{userID:loggedInUser}} = req;
    if(userID !== loggedInUser){
      throw new BadRequestError("you can only update your own account!");      
    }
  const user = await Users.findByIdAndUpdate(userID,{...req.body},{new:true,runValidators:true});
  if(!user){
    throw new NotFoundError("no use with the provided id!");      
  }
  return res.status(StatusCodes.OK).json({success:true,user})
} catch (error) {
  next(error);
  
}
}
export const deleteUser = async (req,res,next)=>{
  try {
    const {params:{id:userID},user:{userID:loggedInUser}} = req;
    if(userID !== loggedInUser){
      throw new BadRequestError("you can only delete your own account!"); 
    }
    const user = await Users.findByIdAndDelete(userID);
    if(!user){
      throw new NotFoundError("no use with the provided id!"); 
    }
    return res.status(StatusCodes.OK).json({success:true,message:"account successfully deleted!"})
  } catch (error) {
    next(error);
    
  }
}