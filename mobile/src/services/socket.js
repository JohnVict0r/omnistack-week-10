import socketio from "socket.io-client";

const socket = socketio(
  "https://3333-db4fa8e8-57bd-41bb-93de-f817e26bf5a8.ws-us02.gitpod.io/",
  {
    autoConnect: false
  }
);

const subscribeToNewDevs = subscribeFunction => {
  socket.on("new-dev", subscribeFunction);
};

const connect = (latitude, longitude, techs) => {
  socket.io.opts.query = {
    latitude,
    longitude,
    techs
  };

  socket.connect();

  //   socket.on("message", text => {
  //     console.log(text);
  //   });
};

const disconnect = () => socket.connected && socket.disconnect();

export { connect, disconnect, subscribeToNewDevs };
