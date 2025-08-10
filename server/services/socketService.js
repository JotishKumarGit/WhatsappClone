import server from 'socket.io';
import UserModel from '../models/UserModel';
import messageModal from '../models/MessageModel';

// Map to store online users -> userId , socketId
const onlineUsers = new Map();

// map to track typing status -> userId , conversation : boolean
const typingUsers = new Map();

// 
const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

        },
        pingTimeout: 60000, // if user offline then the socket is disconnected after 60 seconds         pingInterval: 25000
    });

    // when a new socket connections established 
    io.on("connection", (socket) => {
        console.log("User connected", ` ${socket.id}`);
        let userId = null;

        // handle user connection and mark then online in db
        socket.on("user_connection", async (connectingUserId) => {
            try {
                userId = connectingUserId,
                    onlineUsers.set(userId, socket.id);
                socket.join(userId); // join the personal room for direct emits 
            } catch (error) {
                console.error("Error connecting user:", error);
            }
        })

    })


}


// 4 hours 5 min 
