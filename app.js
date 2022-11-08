//imports
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from 'dotenv';
import notFound from './middlewares/notFound.js';
import usersRoutes from './routes/userRoutes.js';
import connectDB from "./db/connect.js";
import errorHandlerMiddleware from './middlewares/error-handler.js';

//app config
const app = express();
dotenv.config();

//extra security packages
app.use(cors());
app.use(helmet());

//middlewares
app.use(express.json());
app.use(express.static("uploads"));

//api  routes 
app.get("/api/v1/app",(req,res)=>{
    res.status(200).json({success:true,message:"my app!!!"});
});
app.use('/api/v1/app/users',usersRoutes);

//not found route
app.use(notFound);

//error handlermindleware
app.use(errorHandlerMiddleware);
const port = process.env.PORT || 5000;
const start = async ()=>{
    await connectDB(process.env.MONGO_URL);
    app.listen(port,()=> console.log(`server listening at port ${port}...`));
}
start();

