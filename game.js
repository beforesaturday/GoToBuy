// ===================== PRODUCTOS =====================
const PRODUCTOS = {
  Vino: 1.90,
  Refresco: 2.20,
  Cerveza: 2.45,
  Energetica: 1.80,
  Papas: 1.40
};

// ===================== ASCII =====================
const CASA = ["██████","██  ██","██████"];
const TIENDA = ["██████","TIENDA","██████"];

// ===================== ESTADO =====================
let modo = "manual";
let pos = 5;
let tiendaPos = 40;
let saldo = 0;
let inicio = 0;
let enJuego = false;

// ===================== TITULO (tipo pyfiglet) =====================
document.getElementById("title").innerText =
`
  ██████   ██████   ██████  ████████
 ██       ██    ██ ██    ██    ██
 ██   ███ ██    ██ ██    ██    ██
 ██    ██ ██    ██ ██    ██    ██
  ██████   ██████   ██████     ██

        GoToBuy
`;

// ===================== MENU =====================
function start(m) {
  modo = m;
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  saldo = generarSaldo();
  pos = 5;
  inicio = Date.now();
  enJuego = true;

  draw();
}

// ===================== SALDO =====================
function generarSaldo() {
  return +(Math.random() * (8 - 1.5) + 1.5).toFixed(2);
}

// ===================== DIBUJAR =====================
function draw() {
  let line = "";

  for (let i = 0; i <= tiendaPos; i++) {
    if (i === 0) line += "🏠";
    else if (i === tiendaPos) line += "🏪";
    else if (i === pos) line += "😀";
    else line += "·";
  }

  document.getElementById("screen").textContent = line;
  document.getElementById("hud").innerText = `💰 Saldo: ${saldo}€`;

  if (pos >= tiendaPos) openShop();
}

// ===================== MOVIMIENTO =====================
document.addEventListener("keydown", (e) => {
  if (!enJuego) return;

  if (!document.getElementById("shop").classList.contains("hidden")) return;

  if (e.key === "ArrowRight") pos++;
  if (e.key === "ArrowLeft" && pos > 0) pos--;

  draw();
});

// ===================== TIENDA =====================
function openShop() {
  document.getElementById("shop").classList.remove("hidden");

  let html = "";
  Object.keys(PRODUCTOS).forEach((k, i) => {
    html += `${i + 1}. ${k} - ${PRODUCTOS[k]}€<br>`;
  });

  document.getElementById("products").innerHTML = html;

  if (modo === "auto") autoBuy();
}

// ===================== IA (mejor_compra simplificada) =====================
function autoBuy() {
  let keys = Object.keys(PRODUCTOS);

  let seleccion = [];
  let total = 0;

  for (let k of keys) {
    if (total + PRODUCTOS[k] <= saldo) {
      seleccion.push(k);
      total += PRODUCTOS[k];
    }
  }

  finishBuy(seleccion);
}

// ===================== COMPRA MANUAL =====================
function buy() {
  let keys = Object.keys(PRODUCTOS);
  let input = document.getElementById("input").value.split(" ");

  let seleccion = input.map(i => keys[+i - 1]).filter(Boolean);

  finishBuy(seleccion);
}

// ===================== FINAL COMPRA =====================
function finishBuy(seleccion) {
  let total = seleccion.reduce((a, p) => a + PRODUCTOS[p], 0);

  if (total > saldo) {
    alert("❌ Excede saldo");
    return;
  }

  let acierto = evaluar(total);

  document.getElementById("shop").classList.add("hidden");

  volverCasa(acierto);
}

// ===================== EVALUACIÓN (igual lógica Python) =====================
function evaluar(total) {
  let diff = saldo - total;
  if (diff === 0) return 100;
  return Math.round((1 / (1 + diff)) * 100);
}

// ===================== VUELTA A CASA =====================
function volverCasa(acierto) {
  let vuelta = setInterval(() => {
    if (pos > 5) {
      pos--;
      draw();
    } else {
      clearInterval(vuelta);
      endGame(acierto);
    }
  }, 50);
}

// ===================== FINAL =====================
function endGame(acierto) {
  enJuego = false;

  let tiempo = ((Date.now() - inicio) / 1000).toFixed(2);

  document.getElementById("result").classList.remove("hidden");
  document.getElementById("result").innerHTML = `
    🏁 FIN DE PARTIDA<br>
    Acierto: ${acierto}%<br>
    Tiempo: ${tiempo}s
  `;

  save(acierto, tiempo);
}

// ===================== GUARDAR PARTIDA =====================
function save(acierto, tiempo) {
  let data = JSON.parse(localStorage.getItem("partidas") || "[]");

  data.push({
    modo,
    acierto,
    tiempo,
    fecha: new Date().toLocaleString()
  });

  localStorage.setItem("partidas", JSON.stringify(data));
}

// ===================== HISTORIAL =====================
function showHistory() {
  let data = JSON.parse(localStorage.getItem("partidas") || "[]");

  let html = "<h2>Partidas</h2>";

  data.forEach(p => {
    html += `<p>${p.fecha} | ${p.modo} | ${p.acierto}% | ${p.tiempo}s</p>`;
  });

  document.getElementById("history").innerHTML = html;
  document.getElementById("history").classList.remove("hidden");
}
