app.controller("indexController", [
  "$scope",
  "indexFactory",
  ($scope, indexFactory) => {
    $scope.messages = [];

    $scope.init = () => {
      const username = prompt("Please enter a username");

      if (username) initSocket(username);
      else return false;
    };

    function initSocket(username) {
      indexFactory
        .connectSocket("http://localhost:3000", {
          reconnectionAttempts: 3,
          reconnectionDelay: 600,
        })
        .then((socket) => {
          socket.emit("newUser", { username });

          socket.on("newUser", (data) => {
            const messageData = {
              type: {
                code: 0, // 0:server message, 1:user message
                message: 1, // 0:disconnect message, 1:login message
              },
              username: data.username,
            };
            $scope.messages.push(messageData);
            $scope.$apply();
          });
          socket.on("disUser", (data) => {
            const messageData = {
              type: {
                code: 0, // 0:server message, 1:user message
                message: 0, // 0:disconnect message, 1:login message
              },
              username: data.username,
            };
            $scope.messages.push(messageData);
            $scope.$apply();
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  },
]);
