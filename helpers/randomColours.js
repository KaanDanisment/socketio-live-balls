const colours = ["red", "blue", "green"];

function randomColour() {
  return colours[Math.floor(Math.random() * colours.length)];
}

module.exports = randomColour;
