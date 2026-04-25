// ===================== PRODUCTOS =====================
const PRODUCTOS = {
  Vino: 1.90,
  Refresco: 2.20,
  Cerveza: 2.45,
  Energetica: 1.80,
  Papas: 1.40
};

const CASA = ["██████", "██  ██", "██████"];
const TIENDA = ["██████", "TIENDA", "██████"];
const PERSONA = "😀";

// ===================== ESTADO =====================
let pos = 0;
const tiendaPos = 40;
let saldo = generarSaldo();
let modo = "manual";
let startTime = Date.now();

// ===================== SALDO (igual lógica Python) =====================
function generarSaldo() {
  let s;
  while (true) {
    s = +(Math.random() * (8 - 1.5) + 1.5).toFixed(2);
    return s;
  }
}

// ===================== TITULO =====================
document.getElementById("title").innerHTML =
  "<h1 style='color:#ff4fd8'>GoToBuy</h1>";

// ===================== DIBUJO =====================
function draw() {
  let line = "";

  for (let i = 0; i <= tiendaPos; i++) {
    if (i === 0) line += "🏠";
    else if (i === tiendaPos) line += "🏪";
    else if (i === pos) line += PERSONA;
    else line += "·";
  }

  document.getElementById("screen").textContent = line;
  document.getElementById("saldo").innerText = `💰 Saldo: ${saldo}€`;
}

draw();

// ===================== MOVIMIENTO =====================
document.addEventListener("keydown", (e) => {
  if (document.getElementById("shop").classList.contains("hidden")) {
    if (e.key === "ArrowRight") pos++;
    if (e.key === "ArrowLeft" && pos > 0) pos--;

    if (pos >= tiendaPos) openShop();

    draw();
  }
});

// ===================== TIENDA =====================
function openShop() {
  document.getElementById("shop").classList.remove("hidden");

  let html = "";
  Object.entries(PRODUCTOS).forEach(([k, v], i) => {
    html += `${i + 1}. ${k} - ${v}€<br>`;
  });

  document.getElementById("products").innerHTML = html;
}

// ===================== MEJOR COMPRA (igual Python) =====================
function evaluarCompra(total) {
  if (total > saldo) return 0;

  let diffUsuario = saldo - total;

  if (diffUsuario === 0) return 100;

  return Math.round((1 / (1 + diffUsuario)) * 100);
}

// ===================== COMPRA =====================
function confirmBuy() {
  let input = document.getElementById("input").value.split(" ");
  let keys = Object.keys(PRODUCTOS);

  let seleccion = input.map(i => keys[+i - 1]);
  let total = seleccion.reduce((acc, p) => acc + PRODUCTOS[p], 0);

  if (total > saldo) {
    alert("❌ Excede saldo");
    return;
  }

  let acierto = evaluarCompra(total);

  document.getElementById("shop").classList.add("hidden");
  document.getElementById("end").classList.remove("hidden");

  document.getElementById("result").innerHTML =
    `Acierto: ${acierto}%<br>Tiempo: ${(Date.now() - startTime)/1000}s`;

  saveGame(acierto);
}

// ===================== SAVE =====================
function saveGame(acierto) {
  let data = JSON.parse(localStorage.getItem("partidas") || "[]");

  data.push({
    acierto,
    fecha: new Date().toISOString()
  });

  localStorage.setItem("partidas", JSON.stringify(data));
}

// ===================== RESTART =====================
function restart() {
  location.reload();
}