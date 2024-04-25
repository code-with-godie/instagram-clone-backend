import express from 'express';
import authorize from '../../../middlewares/authentication.js';
import {
    createHighlight,
    getHighlights,
} from '../controllers/highLightsControllers.js';
const Router = express.Router();
Router.route('/:id')
    .post(authorize, createHighlight)
    .get(authorize, getHighlights);

export default Router;
