import Posts from '../models/Post.js';
import Users from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import NotFoundError from '../../../errors/not-found.js';
import BadRequestError from '../../../errors/bad-request.js';

export const createPost = async (req, res, next) => {
    try {
        const {
            user: { userID },
            body: { caption, posts },
            // file: { resource_type, secure_url, public_id },
        } = req;
        const resource_type = posts[0]?.postType;
        const secure_url = posts[0]?.url;
        const public_id = Date.now().toString();
        let post = await Posts.create({
            caption,
            postType: resource_type,
            url: { postUrl: secure_url, public_id },
            user: userID,
        });
        post = await Posts.findById(post._id).populate({
            path: 'user',
            select: 'username profilePic name ',
        });
        return res.status(StatusCodes.OK).json({ success: true, post });
    } catch (error) {
        next(error);
    }
};
export const getUserPostCount = async (req, res, next) => {
    try {
        const {
            params: { id: userID },
        } = req;
        const count = await Posts.count({ user: userID });
        return res.status(StatusCodes.OK).json({ success: true, count });
    } catch (error) {
        next(error);
    }
};
export const getAllPosts = async (req, res, next) => {
    try {
        const {
            user: { userID },
        } = req;
        const user = await Users.findById(userID);
        //users who have blocked me
        const users = await Users.find(
            { blockUser: { $in: userID } },
            { _id: 1 }
        );
        const usersIDs = users.map(item => item._id);
        if (!user) {
            throw new BadRequestError('no user with the provided id');
        }
        let posts = [];
        let otherPosts = [];
        posts = await Posts.find({ user: { $in: [...user.followings] } })
            .populate({ path: 'user', select: 'username profilePic name ' })
            .limit(30)
            .sort({ createdAt: -1 });
        if (posts.length < 30) {
            otherPosts = await Posts.find({
                user: {
                    $nin: [
                        ...user.followings,
                        userID,
                        ...user.blockUser,
                        ...usersIDs,
                    ],
                },
            })
                .populate({ path: 'user', select: 'username profilePic name ' })
                .limit(30)
                .sort({ createdAt: -1 });
            posts = [...posts, ...otherPosts];
        }
        if (posts.length < 30) {
            otherPosts = await Posts.find({
                user: { $nin: [...user.followings, ...usersIDs] },
            })
                .populate({ path: 'user', select: 'username profilePic name ' })
                .limit(30)
                .sort({ createdAt: -1 });
            posts = [...posts, ...otherPosts];
        }
        return res
            .status(StatusCodes.OK)
            .json({ success: true, nbHits: posts.length, posts });
    } catch (error) {
        next(error);
    }
};
export const getSingleUserAllPosts = async (req, res, next) => {
    try {
        const {
            params: { id: userID, slug },
        } = req;
        const user = await Users.findById(userID);
        if (!user) {
            throw new BadRequestError('no user with the provided id');
        }
        let posts = [];
        if (slug === 'posts') {
            posts = await Posts.find({ user: userID })
                .populate({
                    path: 'user',
                    select: 'username profilePic name ',
                })
                .sort({ createdAt: -1 });
        }
        if (slug === 'reels') {
            posts = await Posts.find({ user: userID, postType: 'video' })
                .populate({
                    path: 'user',
                    select: 'username profilePic name ',
                })
                .sort({ createdAt: -1 });
        }
        if (slug === 'saved') {
            posts = await Posts.find({ bookmarks: { $in: userID } })
                .populate({
                    path: 'user',
                    select: 'username profilePic name ',
                })
                .sort({ createdAt: -1 });
        }
        if (slug === 'tagged') {
            posts = await Posts.find({ tags: { $in: userID } })
                .populate({
                    path: 'user',
                    select: 'username profilePic name ',
                })
                .sort({ createdAt: -1 });
        }
        return res
            .status(StatusCodes.OK)
            .json({ success: true, nbHits: posts.length, posts });
    } catch (error) {
        next(error);
    }
};
export const getSinglePost = async (req, res, next) => {
    try {
        const {
            params: { id: postID },
        } = req;
        const post = await Posts.findById(postID).populate({
            path: 'user',
            select: 'username profilePic',
        });
        if (!post) {
            throw new NotFoundError('no post with the provided id');
        }
        return res.status(StatusCodes.OK).json({ success: true, post });
    } catch (error) {
        next(error);
    }
};
export const getSpecificPosts = async (req, res, next) => {
    try {
        const {
            params: { id: userID },
        } = req;
        const posts = await Posts.find({ userID });
        if (posts.length === 0) {
            throw new NotFoundError('you have no posts yet!!!');
        }
        return res.status(StatusCodes.OK).json({ success: true, posts });
    } catch (error) {
        next(error);
    }
};
export const getReels = async (req, res, next) => {
    try {
        const posts = await Posts.find({ postType: 'video' })
            .populate({ path: 'user', select: 'username profilePic name ' })
            .sort({ createdAt: -1 });
        if (posts.length === 0) {
            throw new NotFoundError('you have no posts yet!!!');
        }
        return res.status(StatusCodes.OK).json({ success: true, posts });
    } catch (error) {
        next(error);
    }
};

export const updatePost = async (req, res, next) => {
    try {
        const {
            params: { id: postID },
            user: { userID },
        } = req;
        let post = await Posts.findById(postID);
        if (!post) {
            throw new BadRequestError('no post with the provided id!');
        }
        if (post.userID !== userID) {
            throw new BadRequestError('you can only update your own posts!');
        }
        post = await Posts.findByIdAndUpdate(
            postID,
            { ...req.body },
            { new: true, runValidators: true }
        );
        return res.status(StatusCodes.OK).json({ success: true, post });
    } catch (error) {
        next(error);
    }
};
export const deletePost = async (req, res, next) => {
    try {
        const {
            params: { id: postID },
            user: { userID },
        } = req;
        const post = await Posts.findById(postID);

        if (!post) {
            throw new BadRequestError('no post with the provided id!');
        }
        if (post.user !== userID) {
            throw new NotFoundError('you can only delete your own posts!');
        }
        await Posts.findByIdAndDelete(postID);
        return res
            .status(StatusCodes.OK)
            .json({ success: true, message: 'post  successfully deleted!' });
    } catch (error) {
        next(error);
    }
};
//like and unlike a post
export const toggleLikes = async (req, res, next) => {
    try {
        const {
            params: { id: postID },
            user: { userID },
        } = req;
        let post = await Posts.findById(postID);
        if (!post) {
            throw new NotFoundError('no post with the provided id!');
        }
        if (!post.likes.includes(userID)) {
            post = await Posts.findByIdAndUpdate(
                postID,
                { $push: { likes: userID } },
                { new: true, runValidators: true }
            );
            return res.status(StatusCodes.OK).json({
                success: true,
                like: true,
                message: `you successfully liked`,
            });
        }
        post = await Posts.findByIdAndUpdate(
            postID,
            { $pull: { likes: userID } },
            { new: true, runValidators: true }
        );
        return res.status(StatusCodes.OK).json({
            success: true,
            like: false,
            message: `you successfully unliked`,
        });
    } catch (error) {
        next(error);
    }
};
//like and unlike a post
export const togglebookmarks = async (req, res, next) => {
    try {
        const {
            params: { id: postID },
            user: { userID: userID },
        } = req;
        let post = await Posts.findById(postID);
        if (!post) {
            throw new NotFoundError('no post with the provided id!');
        }
        if (!post.bookmarks.includes(userID)) {
            post = await Posts.findByIdAndUpdate(
                postID,
                { $push: { bookmarks: userID } },
                { new: true, runValidators: true }
            );
            return res.status(StatusCodes.OK).json({
                success: true,
                bookmarked: true,
                message: `you successfully bookmarked a post`,
            });
        }
        post = await Posts.findByIdAndUpdate(
            postID,
            { $pull: { bookmarks: userID } },
            { new: true, runValidators: true }
        );
        return res.status(StatusCodes.OK).json({
            success: true,
            bookmarked: false,
            message: `you successfully unbookmarked a post`,
        });
    } catch (error) {
        next(error);
    }
};
export const toggleLikeCount = async (req, res, next) => {
    try {
        const {
            params: { id: postID },
            user: { userID: userID },
        } = req;
        let post = await Posts.findById(postID);
        if (!post) {
            throw new BadRequestError('no post with the provided id!');
        }
        if (post.user !== userID) {
            throw new NotFoundError('you can only update your own posts!');
        }
        if (post.hideLikeCount) {
            post = await Posts.findByIdAndUpdate(
                postID,
                { hideLikeCount: false },
                { new: true, runValidators: true }
            );
            return res.status(StatusCodes.OK).json({
                success: true,
                post,
            });
        }
        post = await Posts.findByIdAndUpdate(
            postID,
            { hideLikeCount: true },
            { new: true, runValidators: true }
        );
        return res.status(StatusCodes.OK).json({
            success: true,
            post,
        });
    } catch (error) {
        next(error);
    }
};
export const toggleCommenting = async (req, res, next) => {
    try {
        const {
            params: { id: postID },
            user: { userID: userID },
        } = req;
        let post = await Posts.findById(postID);
        if (!post) {
            throw new BadRequestError('no post with the provided id!');
        }
        if (post.user !== userID) {
            throw new NotFoundError('you can only update your own posts!');
        }
        if (post.commentDisabled) {
            post = await Posts.findByIdAndUpdate(
                postID,
                { commentDisabled: false },
                { new: true, runValidators: true }
            );
            return res.status(StatusCodes.OK).json({
                success: true,
                post,
            });
        }
        post = await Posts.findByIdAndUpdate(
            postID,
            { commentDisabled: false },
            { new: true, runValidators: true }
        );
        return res.status(StatusCodes.OK).json({
            success: true,
            post,
        });
    } catch (error) {
        next(error);
    }
};
