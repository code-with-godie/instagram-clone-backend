import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const handleUpload = async (req, res, next) => {
    try {
        const {
            body: { posts, folder },
        } = req;
        if (posts.length === 1) {
            const response = await uploadFile(posts[0], folder);
            const { secure_url, public_id } = response;
            req.file = { resource_type, secure_url, public_id };
            next();
        } else {
            return res.send(posts);
        }
    } catch (error) {
        next(error);
    }
};

export const uploadFile = async (file, folder) => {
    const response = await cloudinary.uploader.upload(file?.url, {
        resource_type: 'auto',
        folder,
    });
    return response;
};
export const updateFile = async (file, folder) => {
    // cloudinary.config({
    //     cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    //     api_key:process.env.CLOUDINARY_API_KEY,
    //     api_secret:process.env.CLOUDINARY_API_SECRET
    // })
    const response = await cloudinary.uploader.upload(file, {
        resource_type: 'auto',
        folder,
    });
    return response;
};
export const deleteFile = async public_id => {
    // cloudinary.config({
    //     cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    //     api_key:process.env.CLOUDINARY_API_KEY,
    //     api_secret:process.env.CLOUDINARY_API_SECRET
    // })
    const response = await cloudinary.uploader.destroy(public_id);
    return response;
};

export default handleUpload;
