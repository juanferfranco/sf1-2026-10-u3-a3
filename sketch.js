const MIN_COUNT = 15;
const MAX_COUNT = 25;
const DEFAULT_COUNT = 20;

class Temporizador extends FSMTask {
  constructor() {
    super();
    this.counter = DEFAULT_COUNT;
    this.maxCounter = MAX_COUNT;
    this.myTimer = this.addTimer("Timeout", 1000);
    this.stateName = "";
    this.transitionTo(this.estado_config);

  }

  estado_config = (ev) => {
    if (ev === ENTRY) {
      this.counter = DEFAULT_COUNT;
      this.stateName = "config";
    } else if (ev === "A") {
      if (this.counter > MIN_COUNT) this.counter--;
    } else if (ev === "B") {
      if (this.counter < MAX_COUNT) this.counter++;
    } else if (ev === "S") {
      this.maxCounter = this.counter;
      this.transitionTo(this.estado_armed);
    }
  }


  estado_armed = (ev) => {
    if (ev === ENTRY) {
      this.myTimer.start();
      this.stateName = "armed";
    } else if (ev === EXIT) {
      this.myTimer.stop();
    }
    else if (ev === "Timeout") {
      if (this.counter > 0) {
        this.counter--;
        if (this.counter === 0) {
          this.transitionTo(this.estado_timeout);
        } else {
          this.myTimer.start();
        }
      }
    }
  }

  estado_timeout = (ev) => {
    if (ev === ENTRY) {
      this.stateName = "timeout";
    } else if (ev === "A") {
      this.transitionTo(this.estado_config);
    }
  }
}

let temporizador;

function setup() {
  createCanvas(windowWidth, windowHeight);
  temporizador = new Temporizador();
  textAlign(CENTER, CENTER);
}

function draw() {
  temporizador.update();

  //if (temporizador.stateName === "config") { ... }

  let stateName = temporizador.state.name;

  if (stateName.includes("estado_config")) {
    drawConfig(temporizador.counter);
  } else if (stateName.includes("estado_armed")) {
    drawArmed(temporizador.counter, temporizador.maxCounter);
  } else if (stateName.includes("estado_timeout")) {
    drawTimeout();
  }
}

function drawConfig(val) {
  background(20, 40, 80);
  fill(255);
  textSize(32);
  textSize(120);
  text(val, width / 2, height / 2);
  textSize(20);
}

function drawArmed(val, total) {
  background(20, 20, 20);
  let pulse = sin(frameCount * 0.1) * 10;

  noFill();
  strokeWeight(20);
  stroke(255, 100, 0, 50);
  ellipse(width / 2, height / 2, 250);

  stroke(255, 150, 0);
  let angle = map(val, 0, total, 0, TWO_PI);
  arc(width / 2, height / 2, 250, 250, -HALF_PI, angle - HALF_PI);

  fill(255);
  noStroke();
  textSize(100 + pulse);
  text(val, width / 2, height / 2);
}

function drawTimeout() {
  let bg = frameCount % 20 < 10 ? color(150, 0, 0) : color(255, 0, 0);
  background(bg);
  fill(255);
  textSize(100);
  text("¡TIEMPO!", width / 2, height / 2);
}

function keyPressed() {
  if (key === "a" || key === "A") temporizador.postEvent("A");
  if (key === "b" || key === "B") temporizador.postEvent("B");
  if (key === "s" || key === "S") temporizador.postEvent("S");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
