import Users from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import NotFoundError from '../../../errors/not-found.js';
import BadRequestError from '../../../errors/bad-request.js';
import UnauthenticatedError from '../../../errors/unauthenticated.js';
import { updateFile } from '../../../middlewares/uploadToCloudinary.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const {
      user: { userID },
      query: { followings },
    } = req;
    if (followings) {
      const user = await Users.findById(userID);
      const users = await Users.find(
        { _id: { $in: [...user.followings] } },
        { password: 0 }
      );
      return res
        .status(StatusCodes.OK)
        .json({ success: true, nbHits: users.length, users });
    }
    const users = await Users.find({ _id: { $ne: userID } }, { password: 0 });
    if (users.length === 0) {
      return res
        .status(StatusCodes.OK)
        .json({ success: true, message: 'you have no users yet!' });
    }
    return res
      .status(StatusCodes.OK)
      .json({ success: true, nbHits: users.length, users });
  } catch (error) {
    next(error);
  }
};
export const getSuggestedAccounts = async (req, res, next) => {
  //people from the same location as me
  //people followed by my friends
  //people following my friends
  //people who follow me but i dont follow them
  //people followed by my close friend
  //people following my close friend
  try {
    const {
      user: { loggedInUserID },
    } = req;
    const user = await Users.findById(loggedInUserID);
    if (user) {
      throw new BadRequestError('no user with the provided id!!!');
    }
    // const userAccounts = [...user.followings,...user.followers];
    // const uniqueUserAccount = userAccounts.reduce((uniqueAccounts, account) =>{
    //   if(!uniqueAccounts.includes(account)) uniqueAccounts.push(account);
    // },[])
    // .filter(item => !user.followings.includes(item));

    // const suggestedAccounts = await Users.find({_id:{$in:uniqueUserAccount}});
    // return res.status(StatusCodes.OK).json({success:true,suggestedAccounts});
  } catch (error) {
    next(error);
  }
};
export const search = async (req, res, next) => {
  try {
    const {
      query: { pattern },
    } = req;
    if (!pattern) {
      return res.status(StatusCodes.OK).json({ success: true, accounts: [] });
    }
    const regex = new RegExp(`^${pattern}`, 'i');
    const accounts = await Users.find(
      {
        $or: [{ name: regex }, { username: regex }],
      },
      { name: 1, username: 1, profilePic: 1 }
    );
    return res.status(StatusCodes.OK).json({ success: true, accounts });
  } catch (error) {
    next(error);
  }
};
export const getSingleUser = async (req, res, next) => {
  try {
    const {
      params: { id: userID },
    } = req;
    const user = await Users.findOne({ _id: { $eq: userID } }, { password: 0 });
    if (!user) {
      throw new NotFoundError('no user with the provided id');
    }
    return res.status(StatusCodes.OK).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
export const register = async (req, res, next) => {
  try {
    const user = new Users({ ...req.body });
    const hashedPassword = await user.hashPassword();
    user.password = hashedPassword;
    await user.save();
    const { password, ...newUser } = user._doc;
    return res
      .status(StatusCodes.CREATED)
      .json({ success: true, user: newUser });
  } catch (error) {
    next(error);
  }
};
export const login = async (req, res, next) => {
  try {
    const {
      body: { email, password },
    } = req;
    if (!email || !password) {
      throw new BadRequestError('please provide both email and password!');
    }
    const user = await Users.findOne({ email });
    if (!user) {
      throw new UnauthenticatedError('INVALID EMAIL!');
    }
    const passwordMatched = await user.checkPassword(password);
    if (!passwordMatched) {
      throw new UnauthenticatedError('INVALID PASSWORD!');
    }
    const token = await user.createToken();
    const { password: removePassword, ...newUser } = user._doc;
    return res
      .status(StatusCodes.OK)
      .json({ success: true, user: newUser, token });
  } catch (error) {
    next(error);
  }
};
export const updateUser = async (req, res, next) => {
  try {
    const {
      params: { id: userID },
      user: { userID: loggedInUser },
      body: { profilePic },
    } = req;

    let user = await Users.findById(loggedInUser);
    if (!user) {
      throw new NotFoundError('no use with the provided id!');
    }
    if (userID !== loggedInUser) {
      throw new BadRequestError('you can only update your own account!');
    }
    if (profilePic) {
      // console.log('updating....');
      // const res = await updateFile(profilePic, 'instagram-clone/users');
      // const { secure_url, public_id } = res;
      // req.body.profilePic = { url: secure_url, public_id };
      req.body.profilePic = {
        url: profilePic,
        public_id: Date.now().toString(),
      };
    }
    await Users.findByIdAndUpdate(userID, { ...req.body });
    user = await Users.findById(loggedInUser, { password: 0 });
    return res.status(StatusCodes.OK).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
export const deleteUser = async (req, res, next) => {
  try {
    const {
      params: { id: userID },
      user: { userID: loggedInUser },
    } = req;
    if (userID !== loggedInUser) {
      throw new BadRequestError('you can only delete your own account!');
    }
    const user = await Users.findByIdAndDelete(userID);
    if (!user) {
      throw new NotFoundError('no use with the provided id!');
    }
    return res
      .status(StatusCodes.OK)
      .json({ success: true, message: 'account successfully deleted!' });
  } catch (error) {
    next(error);
  }
};

export const follow = async (req, res, next) => {
  try {
    const {
      params: { id: followID },
      user: { userID: userID },
    } = req;
    let user = await Users.findById(userID);
    let follow = await Users.findById(followID);
    if (!user || !follow) {
      throw new NotFoundError('no use with the provided id!');
    }
    if (followID === userID) {
      throw new BadRequestError(`you cannot follow  yourself`);
    }
    if (follow.blockUser.includes(userID)) {
      throw new BadRequestError(
        `you cannot follow  @${follow.username} because the user blocked you`
      );
    }
    if (!user.followings.includes(followID)) {
      user = await Users.findByIdAndUpdate(
        userID,
        { $push: { followings: followID } },
        { new: true, runValidators: true }
      );
      follow = await Users.findByIdAndUpdate(
        followID,
        { $push: { followers: userID } },
        { new: true, runValidators: true }
      );
      user = await Users.findById({ _id: userID }, { password: 0 });
      return res.status(StatusCodes.OK).json({
        success: true,
        message: `you started following ${follow.username}`,
        user,
      });
    }
    user = await Users.findByIdAndUpdate(
      userID,
      { $pull: { followings: followID } },
      { new: true, runValidators: true }
    );
    follow = await Users.findByIdAndUpdate(
      followID,
      { $pull: { followers: userID } },
      { new: true, runValidators: true }
    );
    user = await Users.findById({ _id: userID }, { password: 0 });
    return res.status(StatusCodes.OK).json({
      success: true,
      message: `you unfollowed ${follow.username}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};
export const blockUser = async (req, res, next) => {
  try {
    const {
      params: { id: blockID },
      user: { userID },
    } = req;
    let user = await Users.findById(userID);
    let friend = await Users.findById(blockID);
    if (!user || !friend) {
      throw new NotFoundError('no use with the provided id!');
    }
    if (blockID === userID) {
      throw new BadRequestError('you cannot block youself!');
    }

    if (user.blockUser.includes(blockID)) {
      await Users.findByIdAndUpdate(userID, {
        $pull: { blockUser: blockID },
      });
      user = await Users.findById(userID, { password: 0 });
      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'user successfully unblocked',
        user,
      });
    }

    if (user.followings.includes(blockID)) {
      await Users.findByIdAndUpdate(userID, {
        $pull: { followings: blockID },
      });
    }
    await Users.findByIdAndUpdate(userID, {
      $push: { blockUser: blockID },
    });
    user = await Users.findById(userID, { password: 0 });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'user successfully blocked',
      user,
    });
  } catch (error) {
    next(error);
  }
};
