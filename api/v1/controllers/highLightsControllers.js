import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../../../errors/bad-request.js';
import HighLights from '../models/HighLight.js';

export const getHighlights = async (req, res, next) => {
    try {
        const {
            params: { id: userID },
        } = req;
        const highLights = await HighLights.find({ userID });
        return res.status(StatusCodes.OK).json({
            success: true,
            nbHits: highLights.length,
            highLights,
        });
    } catch (error) {
        next(error);
    }
};
export const createHighlight = async (req, res, next) => {
    try {
        const {
            params: { id: userID },
            user: { userID: loggedInUser },
            body: { cover: tempCover, photo: tempPhoto, description },
        } = req;
        if (userID !== loggedInUser) {
            throw new BadRequestError(
                'you can only add highLight to  your own account!'
            );
        }
        const accountHighLights = await HighLights.count({ userID });
        console.log(accountHighLights);
        if (accountHighLights < 10) {
            const cover = {
                public_id: Date.now().toString(),
                secure_url: tempCover,
            };
            const photo = {
                public_id: Date.now().toString(),
                secure_url: tempPhoto,
            };
            let highLight = await HighLights.create({
                userID,
                cover,
                photo,
                description,
            });
            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'highlights created',
                highLight,
            });
        } else {
            throw new BadRequestError('HighLights maximum length reached!');
        }
    } catch (error) {
        next(error);
    }
};
