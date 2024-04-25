import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
});

let onlineUsers = [];
let notifications = [];
const notificationType ={
    'LIKE':1,
    'COMMENT':2,
    'FOLLOW':3,
    'MESSAGE':4
}
const findUser = userID => {
    return onlineUsers.find(user => user.id === userID);
};
const addUser = (userID, socketID) => {
    const user = findUser(userID);
    if (!user) {
        onlineUsers.push({ id: userID, socketID });
        console.log('a user added', onlineUsers);
    }
};
const removeUser = socketID => {
    onlineUsers = onlineUsers.filter(user => user.socketID !== socketID);
    console.log('a user removed', onlineUsers);
};
const findNotification =  userID => {
//  return notifications.some(item => item)
};
const addNotification = payload => {
    // const exists = notifications.find(notification => notification.)
    notifications.push(payload);
    console.log('notifications', notifications);
};
const getSpecificUserNotification = userID => {
    return notifications.filter(notification => notification.userID === userID);
};

io.on('connection', socket => {
    socket.emit('SEND_DETAILS');
    socket.on('ADD_USER', userID => {
        addUser(userID, socket.id);
        io.emit('GET_ONLINE_USERS', onlineUsers);
    });
    socket.on('GET_NOTIFICATIONS', userID => {
        const notification = getSpecificUserNotification(userID);
        socket.emit('NOTIFICATIONS', notification);
    });
    socket.on('SEND_NOTIFICATION', (message, postUserID) => {
        // if(type=== notificationType.LIKE){
        //     const alreadyLiked = notifications.some(item => item.user === onlineUserID);

        // }
        addNotification({ userID: postUserID, message});
        const user = findUser(postUserID);
        // get notification if the user is online
        if (user) {
            const notification = getSpecificUserNotification(postUserID);
            io.to(user.socketID).emit('NOTIFICATIONS', notification);
        }
    });
    socket.on('NEW_MESSEGE', (message, receiverID) => {
        const user = findUser(receiverID);
        // send messege if the user is online
        if (user) {
            io.to(user.socketID).emit('RECEIVE_MESSEGE', message);
        }
    });
    console.log('a user is connected');
    socket.on('disconnect', () => {
        console.log('a user is disconnected');
        removeUser(socket.id);
        io.emit('GET_ONLINE_USERS', onlineUsers);
    });
});

const port = 7000;
server.listen(port, () =>
    console.log(`socket server listening on port ${port}...`)
);
