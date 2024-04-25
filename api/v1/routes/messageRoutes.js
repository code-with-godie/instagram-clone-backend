import express from 'express';
import authorize from '../../../middlewares/authentication.js';
import {
  getRoomMesseges,
  sendMessage,
  testMesseges,
} from '../controllers/messagesController.js';
const Router = express.Router();
Router.route('/test/sms').post(testMesseges);
Router.route('/').post(authorize, sendMessage);
Router.route('/:roomID').get(authorize, getRoomMesseges);

export default Router;
