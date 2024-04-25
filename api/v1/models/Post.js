import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
    {
        caption: {
            type: String,
            default: '',
        },
        url: {
            public_id: {
                type: String,
                required: [true, 'please provide a post public id'],
            },
            postUrl: {
                type: String,
                required: [true, 'please provide a post url'],
            },
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: [true, 'please provide userID for the post '],
        },
        postType: {
            type: String,
            enum: ['image', 'video', 'collection'],
            default: 'image',
        },
        related: {
            type: [{ type: String }],
        },
        likes: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
        },
        shares: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
        },
        bookmarks: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
        },
        tags: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
        },
        usersAllowedToComment: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
        },
        hideLikeCount: { type: Boolean, default: false },
        commentDisabled: { type: Boolean, default: false },
        limitCommentUsers: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model('posts', postSchema);
