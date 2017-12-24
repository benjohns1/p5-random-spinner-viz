// Hyperparameters
let currentRotation = { x: 0.0, y: 0.0, z: 0.0 }; // current rotation value, start at 0
let acceleration = 0.00000005; // max velocity change per tick
let maxVelocity = 0.0000005; // max/min velocity
let torusCount = 60; // number of concentric toruses to draw
let radiusDiff = 35, torusThickness = 15; // radius difference and torus thickness
let detailX = 24, detailY = 16; // polygon detail
let velocity = { // current velocity
  x: (Math.random() * maxVelocity * 2) - maxVelocity,
  y: (Math.random() * maxVelocity * 2) - maxVelocity,
  z: (Math.random() * maxVelocity * 2) - maxVelocity
};
let velocityUp = { // whether current velocity is increasing
  x: (Math.random() > 0.5 ? true : false),
  y: (Math.random() > 0.5 ? true : false),
  z: (Math.random() > 0.5 ? true : false)
}
let colorUp = { // whether current directional color is increasing
  r: (Math.random() > 0.5 ? true : false),
  g: (Math.random() > 0.5 ? true : false),
  b: (Math.random() > 0.5 ? true : false)
}
let color = { // current directional color
  r: Math.random() * 255,
  g: Math.random() * 255,
  b: Math.random() * 255
}
let pointColorUp = { // whether current point color is increasing
  r: (Math.random() > 0.5 ? true : false),
  g: (Math.random() > 0.5 ? true : false),
  b: (Math.random() > 0.5 ? true : false)
}
let pointColor = { // current point color
  r: (Math.random() * 155) + 100,
  g: (Math.random() * 155) + 100,
  b: (Math.random() * 155) + 100
}

// Setup canvas and camera
function setup() {
  noStroke();
  createCanvas(windowWidth, windowHeight, WEBGL);
  windowResized();
}

// Toggle fullscreen on click
function mousePressed() {
  var fs = fullscreen();
  fullscreen(!fs);
}

let cameraZ = 1.4 * (radiusDiff + torusThickness) * torusCount;

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  camera(0, 0, cameraZ, 0, 0, 0, 0, 1, 0);
}

// Array of actions to take each velocity update, based on probability weights
// Randomly increases velocity in x, y, or z directions until max velocity is hit, then reverses
// Randomly updates directional light color
let runProbabilities = [
  {
    weight: 1.0,
    action: () => {
      // Randomly update rotation
      let choice = Math.floor(Math.random() * 3);
      let propName = null;
      switch (choice) {
        case 0:
          propName = "x";
          break;
        case 1:
          propName = "y";
          break;
        case 2:
          propName = "z";
          break;
      }
      if (propName === null) {
        return;
      }

      if (velocity[propName] > maxVelocity)
      {
        velocityUp[propName] = false;
      }
      else if (velocity[propName] < -maxVelocity) {
        velocityUp[propName] = true;
      }
      velocity[propName] += (velocityUp[propName] ? acceleration : -acceleration);
    }
  },
  {
    weight: 2.0,
    action: () => {
      // Randomly update directional light color
      let choice = Math.floor(Math.random() * 3);
      let propName = null;
      switch (choice) {
        case 0:
          propName = "r";
          break;
        case 1:
          propName = "g";
          break;
        case 2:
          propName = "b";
          break;
      }
      if (propName === null) {
        return;
      }

      if (color[propName] > 255)
      {
        colorUp[propName] = false;
      }
      else if (color[propName] < 0) {
        colorUp[propName] = true;
      }
      color[propName] += (colorUp[propName] ? 1 : -1);
    }
  },
  {
    weight: 10.0,
    action: () => {
      // Randomly update point light color
      let choice = Math.floor(Math.random() * 3);
      let propName = null;
      switch (choice) {
        case 0:
          propName = "r";
          break;
        case 1:
          propName = "g";
          break;
        case 2:
          propName = "b";
          break;
      }
      if (propName === null) {
        return;
      }

      if (pointColor[propName] > 255)
      {
        pointColorUp[propName] = false;
      }
      else if (pointColor[propName] < 100) {
        pointColorUp[propName] = true;
      }
      pointColor[propName] += (pointColorUp[propName] ? 1 : -1);
    }
  },
  {
    weight: 200.0,
    action: () => {}
  }
];
let totalProbabilitySum = 0;
runProbabilities.forEach(function(item) {
  totalProbabilitySum += item.weight;
});

// Randomly calls actions, based on weighted probability
function randomUpdate() {
  let totalProb = 0;
  runProbabilities.forEach(function(runProb) {
    let choiceWeight = Math.random() * totalProbabilitySum;
    runProbabilities.some(function(item) {
      choiceWeight -= item.weight;
      if (choiceWeight <= 0.0)
      {
        item.action();
        return true;
      }
    });
  });
}

// Updates the current rotation, then sets the rotation
function updateRotation() {
  currentRotation.x += velocity.x;
  currentRotation.y += velocity.y;
  currentRotation.z += velocity.z;

  rotateX(currentRotation.x);
  rotateY(currentRotation.y);
  rotateZ(currentRotation.z);
}

function draw() {
  noStroke();
  
  // Randomly update velocity
  randomUpdate();

  // Lighting
  ambientLight(50, 50, 50);
  directionalLight(color.r, color.g, color.b, 0.5, 0.5, 0.25);
  pointLight(pointColor.r, pointColor.g, pointColor.b, mouseX, mouseY, cameraZ / 4.0);
  specularMaterial(200, 200, 200);
  background(0);
  //console.log(color, pointColor, velocity);

  // Draw objects and update rotations
  updateRotation();
  sphere(radiusDiff);
  for (let i = 1; i <= torusCount; i++) {
    updateRotation();
    torus(radiusDiff + (i * radiusDiff), torusThickness, detailX, detailY);
  }
}
