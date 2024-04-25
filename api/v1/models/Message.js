import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            default: '',
        },
        roomID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'rooms',
            required: [true, 'please provide the room id'],
        },
        receiverID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: [true, 'please provide the message receiver'],
        },
        senderID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: [true, 'please provide the message sender'],
        },
        type: {
            type: String,
            enum: ['text', 'image', 'video'],
            default: 'text',
        },
        url: {
            public_id: {
                type: String,
                default: '',
            },
            source: {
                type: String,
                default: '',
            },
        },
    },
    { timestamps: true }
);
export default mongoose.model('messages', messageSchema);
