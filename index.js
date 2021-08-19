const io = require("socket.io")(8900, {
	cors: {
		origin: "http://localhost:3000",
	},
});

let users = [];

const addUser = (userId, socketId) => {
	!users.some((user) => user.userId === userId) &&
		users.push({ userId, socketId });
};
const removeUser = (socketId) => {
	users = users.filter((user) => user.socketId !== socketId);
};
const getUser = (userId) => {
	return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
	// take userId and socketId from user
	socket.on("addUser", (userId) => {
		addUser(userId, socket.id);
		io.emit("getUsers", users);
	});
	// send and get message
	socket.on("sendMessage", ({ senderId, recieverId, text }) => {
		const user = getUser(recieverId);
		user
			? io.to(user.socketId).emit("getMessage", { senderId, text })
			: io.to(senderId.socketId).emit("getMessage", { senderId, text });
	});
	// join a room
	socket.on("Joined group", room => {
		socket.join(room)
	})
	// send and get group message
	socket.on("sendGroupMessage", ({ sender, text, room }) => {
		io.to(room).emit("getGroupMessage", { sender, text });
	});
	// when disconnect
	socket.on("disconnect", () => {
		removeUser(socket.id);
		io.emit("getUsers", users);
	});
});
