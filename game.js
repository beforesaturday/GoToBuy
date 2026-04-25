// ===================== PRODUCTOS =====================
const PRODUCTOS = {
  Vino: 1.90,
  Refresco: 2.20,
  Cerveza: 2.45,
  Energetica: 1.80,
  Papas: 1.40
};

// ===================== ESTADO =====================
let pos = 2;
const tiendaPos = 30;
let saldo = +(Math.random() * 6 + 2).toFixed(2);
let startTime = Date.now();

// ===================== INIT =====================
window.onload = () => {
  draw();
  openHUD();
};

// ===================== DIBUJAR MAPA =====================
function draw() {
  let line = "";

  for (let i = 0; i <= tiendaPos; i++) {
    if (i === 0) line += "🏠";
    else if (i === tiendaPos) line += "🏪";
    else if (i === pos) line += "😀";
    else line += "·";
  }

  document.getElementById("screen").textContent = line;

  document.getElementById("saldo").innerText =
    `💰 Saldo: ${saldo.toFixed(2)}€`;
}

// ===================== HUD =====================
function openHUD() {
  document.getElementById("info").innerText =
    "Usa ← → para moverte hasta la tienda";
}

// ===================== MOVIMIENTO =====================
document.addEventListener("keydown", (e) => {
  if (document.getElementById("shop").classList.contains("hidden")) {
    if (e.key === "ArrowRight") pos++;
    if (e.key === "ArrowLeft" && pos > 0) pos--;

    draw();

    if (pos >= tiendaPos) openShop();
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

// ===================== COMPRA =====================
function confirmBuy() {
  let input = document.getElementById("input").value.split(" ");
  let keys = Object.keys(PRODUCTOS);

  let seleccion = input.map(i => keys[+i - 1]).filter(Boolean);

  let total = seleccion.reduce((a, p) => a + PRODUCTOS[p], 0);

  if (total > saldo) {
    alert("❌ Excede saldo");
    return;
  }

  let acierto = evaluar(total);

  document.getElementById("shop").classList.add("hidden");
  document.getElementById("end").classList.remove("hidden");

  document.getElementById("result").innerHTML =
    `Acierto: ${acierto}%<br>Tiempo: ${((Date.now()-startTime)/1000).toFixed(2)}s`;

  save(acierto);
}

// ===================== EVALUACIÓN (igual lógica Python simplificada) =====================
function evaluar(total) {
  let diff = saldo - total;

  if (diff === 0) return 100;

  return Math.max(5, Math.round((1 / (1 + diff)) * 100));
}

// ===================== GUARDAR =====================
function save(acierto) {
  let data = JSON.parse(localStorage.getItem("partidas") || "[]");

  data.push({
    acierto,
    fecha: new Date().toLocaleString()
  });

  localStorage.setItem("partidas", JSON.stringify(data));
}