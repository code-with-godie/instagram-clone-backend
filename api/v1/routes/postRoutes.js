import express from 'express';
import {
    createPost,
    getAllPosts,
    getReels,
    getSingleUserAllPosts,
    toggleLikes,
    togglebookmarks,
    getUserPostCount,
    deletePost,
    toggleLikeCount,
    toggleCommenting,
    getSinglePost,
} from '../controllers/postsController.js';
import authorize from '../../../middlewares/authentication.js';
import uploadFile from '../../../middlewares/uploadToCloudinary.js';

const Router = express.Router();

Router.route('/').post(authorize, createPost);
Router.route('/').get(authorize, getAllPosts);
Router.route('/reels').get(authorize, getReels);
Router.route('/count/:id').get(authorize, getUserPostCount);
Router.route('/single/:id').get(authorize, getSinglePost);
Router.route('/like/:id').patch(authorize, toggleLikes);
Router.route('/toggleCommenting/:id').patch(authorize, toggleCommenting);
Router.route('/toggleLikeCount/:id').patch(authorize, toggleLikeCount);
Router.route('/bookmark/:id').patch(authorize, togglebookmarks);
Router.route('/specific/:id/:slug').get(authorize, getSingleUserAllPosts);
Router.route('/:id').delete(authorize, deletePost);

export default Router;
