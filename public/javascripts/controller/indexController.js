app.controller("indexController", [
  "$scope",
  "indexFactory",
  ($scope, indexFactory) => {
    $scope.messages = [];
    $scope.players = {};

    $scope.init = () => {
      const username = prompt("Please enter a username");

      if (username) initSocket(username);
      else return false;
    };

    function showBubble(id, message) {
      $("#" + id)
        .find(".message")
        .show()
        .html(message);
      setTimeout(() => {
        $("#" + id)
          .find(".message")
          .hide();
      }, 2000);
    }

    async function initSocket(username) {
      const connectionOptions = {
        reconnectionAttempts: 3,
        reconnectionDelay: 600,
      };

      try {
        const socket = await indexFactory.connectSocket(
          "http://localhost:3000",
          connectionOptions
        );

        socket.emit("newUser", { username });

        socket.on("initPlayers", (players) => {
          $scope.players = players;
          $scope.$apply();
        });

        socket.on("newUser", (data) => {
          const messageData = {
            type: {
              code: 0, // 0:server message, 1:user message
              message: 1, // 0:disconnect message, 1:login message
            },
            username: data.username,
          };
          $scope.messages.push(messageData);
          $scope.players[data.id] = data;
          setTimeout(() => {
            const element = document.getElementById("chat-area");
            element.scrollTop = element.scrollHeight;
          });
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
          delete $scope.players[data.id];
          setTimeout(() => {
            const element = document.getElementById("chat-area");
            element.scrollTop = element.scrollHeight;
          });
          $scope.$apply();
        });
        socket.on("animate", (data) => {
          $("#" + data.socketId).animate({ left: data.x, top: data.y }, () => {
            animate = false;
          });
        });

        socket.on("newMessage", (data) => {
          $scope.messages.push(data);
          $scope.$apply();
          showBubble(data.socketId, data.text);

          setTimeout(() => {
            const element = document.getElementById("chat-area");
            element.scrollTop = element.scrollHeight;
          });
        });

        let animate = false;
        $scope.onClickPlayer = ($event) => {
          console.log($event.offsetX, $event.offsetY);
          if (!animate) {
            let x = $event.offsetX;
            let y = $event.offsetY;

            socket.emit("animate", { x, y });
            animate = true;
            $("#" + socket.id).animate({ left: x, top: y }, () => {
              animate = false;
            });
          }
        };

        $scope.newMessage = () => {
          let message = $scope.message;

          const messageData = {
            type: {
              code: 1, // 0:server message, 1:user message
            },
            username: username,
            text: message,
          };
          $scope.messages.push(messageData);
          $scope.message = " ";

          socket.emit("newMessage", messageData);
          showBubble(socket.id, message);

          setTimeout(() => {
            const element = document.getElementById("chat-area");
            element.scrollTop = element.scrollHeight;
          });
        };
      } catch (e) {
        console.log(e);
      }
    }
  },
]);
