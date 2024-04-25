import mongoose from 'mongoose';

const HighLightSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: [true, 'please provide a userID'],
    },
    cover: {
        public_id: { type: String, default: '' },
        secure_url: {
            type: String,
            required: [true, 'please provide a cover url'],
        },
    },
    photo: {
        public_id: { type: String, default: '' },
        secure_url: {
            type: String,
            required: [true, 'please provide a photo url'],
        },
    },
    description: { type: String, default: '' },
});

export default mongoose.model('highlights', HighLightSchema);
