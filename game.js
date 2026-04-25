// ===================== PRODUCTOS =====================
const PRODUCTOS = {
  Vino: 1.90,
  Refresco: 2.20,
  Cerveza: 2.45,
  Energetica: 1.80,
  Papas: 1.40
};

// ===================== ESTADO =====================
let pos = 0;
let tiendaPos = 20;
let saldo = generarSaldo();
let seleccion = [];

// ===================== SALDO =====================
function generarSaldo() {
  return (Math.random() * (8 - 1.5) + 1.5).toFixed(2);
}

// ===================== MAPA =====================
function dibujar() {
  let mapa = "";

  for (let i = 0; i <= tiendaPos; i++) {
    if (i === pos) mapa += "😀";
    else if (i === tiendaPos) mapa += "🏪";
    else mapa += "·";
  }

  document.getElementById("mapa").textContent = mapa;
  document.getElementById("saldo").textContent = "💰 Saldo: " + saldo + "€";
}

dibujar();

// ===================== MOVIMIENTO =====================
document.addEventListener("keydown", (e) => {
  if (document.getElementById("tienda").classList.contains("hidden")) {
    if (e.key === "ArrowRight") pos++;
    if (e.key === "ArrowLeft") pos = Math.max(0, pos - 1);

    if (pos >= tiendaPos) {
      abrirTienda();
    }

    dibujar();
  }
});

// ===================== TIENDA =====================
function abrirTienda() {
  document.getElementById("tienda").classList.remove("hidden");

  let html = "";
  Object.keys(PRODUCTOS).forEach((p, i) => {
    html += `
      <label>
        <input type="checkbox" value="${p}">
        ${p} - ${PRODUCTOS[p]}€
      </label><br>
    `;
  });

  document.getElementById("productos").innerHTML = html;
}

// ===================== COMPRA =====================
function comprar() {
  let checks = document.querySelectorAll("input[type=checkbox]:checked");
  seleccion = [];

  checks.forEach(c => seleccion.push(c.value));

  let total = 0;
  seleccion.forEach(p => total += PRODUCTOS[p]);

  if (total > saldo) {
    alert("❌ No tienes suficiente dinero");
    return;
  }

  let acierto = evaluar(saldo, total);

  document.getElementById("tienda").classList.add("hidden");
  document.getElementById("final").classList.remove("hidden");

  document.getElementById("resultado").innerHTML =
    `Acierto: ${acierto}%<br>Total compra: ${total.toFixed(2)}€`;

  guardar(acierto);
}

// ===================== EVALUACIÓN =====================
function evaluar(saldo, total) {
  let diff = saldo - total;
  if (diff === 0) return 100;
  return Math.max(10, Math.round((1 / (1 + diff)) * 100));
}

// ===================== LOCAL STORAGE =====================
function guardar(acierto) {
  let partidas = JSON.parse(localStorage.getItem("partidas") || "[]");

  partidas.push({
    acierto,
    fecha: new Date().toLocaleString()
  });

  localStorage.setItem("partidas", JSON.stringify(partidas));
}

// ===================== REINICIO =====================
function reiniciar() {
  location.reload();
}