const { io } = require("socket.io-client");
const {TWENTYFIVE_MINUTES} = require("./src/constants");
require('dotenv').config();

const socket = io(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getMe`);

socket.on("connect", () => {
  let timerId = setInterval(() => {
    console.log("send message");
     socket.emit("hello", "world", (response) => {
  console.log(response); // "got it"
});
    
  },TWENTYFIVE_MINUTES);
 
});
