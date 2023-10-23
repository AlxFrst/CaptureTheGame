const app = require("next")({ dev: process.env.NODE_ENV !== "production" });
const http = require("http");
const { emit } = require("process");
const io = require("socket.io");
const { parse } = require("url");

const nextHandlerWrapper = (app) => {
    const handler = app.getRequestHandler();

    return async (req, res) => {
        const parsedUrl = parse(req.url, true);
        handler(req, res, parsedUrl);
    };
};

const PORT = process.env.PORT || 3000;

app.prepare().then(async () => {
    const server = http.createServer(nextHandlerWrapper(app));
    const socketIo = io(server);

    socketIo.on("connection", (socket) => {
        console.log("Client connected");

        socket.on("needUpdate", async () => {
            socketIo.emit("update");
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected");
        });

    });
    

    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
});

