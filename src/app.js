const express = require("express");
const dbConnect = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const http = require('http')
const intializeSocket = require('./utils/socket.js')

require('dotenv').config()

const app = express();

//All Routes
const authRouter = require('./routes/auth_router.js')
const profileRouter = require('./routes/profile_router.js')
const requestRouter = require('./routes/request_router.js')
const userRouter = require('./routes/user_router.js');
const chatRouter = require('./routes/chat_router.js')


//Middlewares
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(cookieParser()) // Parse the req.cookies -> readable format
app.use(express.json()) //JSON -> JS object

//Handle /signUp, /logIn, /logOut Routes
app.use('/',authRouter)

//Handle all /profile routes
app.use('/profile',profileRouter)

//Handle all /request routes
app.use('/request',requestRouter)

//Handle all /chat routes
app.use('/chat', chatRouter)

//Handle user feed,connections,request received
app.use('/',userRouter)

const server = http.createServer(app);

intializeSocket(server);

dbConnect()
    .then(() => {
        console.log("Database Connected Successfully!");
        server.listen(process.env.PORT, () => {
            console.log(`Server is listening on port ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log("Database Connection Failed",err)
    })
