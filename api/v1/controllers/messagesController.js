import Messages from '../models/Message.js';
import { StatusCodes } from 'http-status-codes';
import NotFoundError from '../../../errors/not-found.js';
import Users from '../models/User.js';
import BadRequestError from '../../../errors/bad-request.js';
import Rooms from '../models/Room.js';

export const getRoomMesseges = async (req, res, next) => {
  try {
    const {
      query: { mode },
      params: { roomID },
    } = req;
    console.log('fetching messeges', roomID, mode);
    if (mode === 'pending') {
      console.log('no room id');
      return res
        .status(StatusCodes.OK)
        .json({ success: true, nbHits: 0, messages: [] });
    }
    console.log('room is there');
    const messages = await Messages.find({ roomID });
    return res
      .status(StatusCodes.OK)
      .json({ success: true, nbHits: messages.length, messages });
  } catch (error) {
    next(error);
  }
};
export const sendMessage = async (req, res, next) => {
  try {
    const {
      user: { userID: senderID },
      body: { url, roomID, receiverID },
    } = req;
    if (url) {
      const tempUrl = {
        public_id: Date.now().toString(),
        source: url,
      };
      req.body.url = tempUrl;
    }
    if (!roomID) {
      let room = await Rooms.create({ members: [senderID, receiverID] });
      room = await Rooms.findById(room._id).populate({
        path: 'members',
        select: 'profilePic username name',
      });
      const message = await Messages.create({
        ...req.body,
        senderID,
        roomID: room._id,
      });
      return res.status(StatusCodes.OK).json({ success: true, message, room });
    }
    const message = await Messages.create({ ...req.body, senderID });
    return res.status(StatusCodes.OK).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

export const testMesseges = async (req, res, next) => {
  const {
    body: { roomID },
  } = req;
  try {
    // const message = await Messages.find({ roomID });
    const message = await Messages.aggregate([
      { $match: { roomID: '65326c4cc86248d59dab3e84' } },
    ]);
    // const message = await Messages.aggregate([
    //     {
    //         $project: {
    //             dayOfWeek: { $dayOfWeek: '$createdAt' },
    //             month: { $month: '$createdAt' },
    //             date: { $dayOfMonth: '$createdAt' },
    //             title: 1,
    //         },
    //     },
    //     {
    //         $group: {
    //             _id: '$date',
    //             // title: 1,
    //             // total: { $sum: 1 },
    //         },
    //     },
    // ]);
    return res
      .status(StatusCodes.OK)
      .json({ success: true, nbHits: message.length, message });
  } catch (error) {
    next(error);
  }
};
