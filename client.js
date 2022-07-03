const { io } = require("socket.io-client");
const {TWENTYFIVE_MINUTES} = require("./src/constants");

const socket = io("https://telegram-infobot.herokuapp.com");

socket.on("connect", () => {
  let timerId = setInterval(() => {
    console.log("send message");
     socket.emit("hello", "world", (response) => {
  console.log(response); // "got it"
});
    
  },TWENTYFIVE_MINUTES);
 
});
