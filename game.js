
// ===================== PRODUCTOS =====================
const PRODUCTOS = {
  Vino: 1.90,
  Refresco: 2.20,
  Cerveza: 2.45,
  Energetica: 1.80,
  Papas: 1.40
};

// ===================== ESTADO =====================
const CASA = 5;
const TIENDA = 50;

let pos = CASA;
let saldo = 0;
let modo = "manual";
let fase = "walk";
let inicio = 0;
let aciertoTemp = 0;
let juegoActivo = false;

// ===================== TITULO =====================
function titulo() {
  document.getElementById("titulo").innerHTML = `
<pre>
██████  ██████  ████████  ██████  ██████
██       ██   ██    ██    ██    ██ ██   ██
██   ███ ██████     ██    ██    ██ ██████
██    ██ ██   ██    ██    ██    ██ ██   ██
 ██████  ██   ██    ██     ██████  ██████

            GoToBuy
</pre>`;
}

// ===================== INICIO =====================
function startGame(m) {
  modo = m;

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  saldo = generarSaldo();
  pos = CASA;
  inicio = Date.now();
  juegoActivo = true;
  fase = "walk";

  titulo();
  draw();
}

// ===================== SALDO =====================
function generarSaldo() {
  return +(Math.random() * (8 - 1.5) + 1.5).toFixed(2);
}

// ===================== DIBUJO =====================
function draw() {
  let line = "";

  for (let i = CASA; i <= TIENDA; i++) {
    if (i === CASA) line += "🏠";
    else if (i === TIENDA) line += "🏪";
    else if (i === pos) line += "😀";
    else line += "·";
  }

  document.getElementById("screen").innerText = line;

  document.getElementById("hud").innerText =
    `💰 ${saldo.toFixed(2)}€ | Fase: ${fase}`;
}

// ===================== MOVIMIENTO =====================
document.addEventListener("keydown", (e) => {
  if (!juegoActivo) return;

  if (fase === "walk") {
    if (e.key === "ArrowRight" && pos < TIENDA) pos++;
    if (e.key === "ArrowLeft" && pos > CASA) pos--;

    draw();

    if (pos === TIENDA) abrirTienda();
  }

  if (fase === "return") {
    if (e.key === "ArrowLeft" && pos > CASA) pos--;
    if (e.key === "ArrowRight" && pos < TIENDA) pos++;

    draw();

    if (pos === CASA) finalizar();
  }
});

// ===================== TIENDA =====================
function abrirTienda() {
  fase = "shop";

  document.getElementById("shop").classList.remove("hidden");

  let html = "";

  Object.entries(PRODUCTOS).forEach(([k, v], i) => {
    html += `${i + 1}. ${k} - ${v.toFixed(2)}€<br>`;
  });

  if (modo === "auto") {
    let combo = mejorCompra();
    html += `<br>💡 Mejor opción: ${combo.join(", ")}`;
  }

  document.getElementById("productos").innerHTML = html;
}

// ===================== COMPRA =====================
function comprar() {
  let input = document.getElementById("input").value.split(" ");
  let keys = Object.keys(PRODUCTOS);

  let seleccion = input.map(i => keys[parseInt(i) - 1]);

  let total = seleccion.reduce((a, p) => a + PRODUCTOS[p], 0);

  if (total > saldo) return alert("❌ No tienes saldo");

  aciertoTemp = evaluarCompra(seleccion);

  document.getElementById("shop").classList.add("hidden");

  fase = "return";
  pos = TIENDA;
}

// ===================== ALGORITMO =====================
function mejorCompra() {
  let keys = Object.entries(PRODUCTOS);
  let best = [];

  for (let i = 0; i < keys.length; i++) {
    if (keys[i][1] <= saldo) {
      best.push(keys[i][0]);
    }
  }

  return best;
}

// ===================== EVALUAR =====================
function evaluarCompra(sel) {
  let total = sel.reduce((a, p) => a + PRODUCTOS[p], 0);
  return Math.max(0, Math.round((saldo - total) * 10));
}

// ===================== FINAL =====================
function finalizar() {
  juegoActivo = false;

  let tiempo = ((Date.now() - inicio) / 1000).toFixed(2);

  document.getElementById("end").classList.remove("hidden");
  document.getElementById("resultado").innerHTML =
    `🏁 Acierto: ${aciertoTemp}%<br>Tiempo: ${tiempo}s`;
}
