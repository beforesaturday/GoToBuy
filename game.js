// ===================== PRODUCTOS =====================
const PRODUCTOS = {
  Vino: 1.90,
  Refresco: 2.20,
  Cerveza: 2.45,
  Energetica: 1.80,
  Papas: 1.40
};

// ===================== ASCII =====================
const CASA = ["██████", "██  ██", "██████"];
const TIENDA = ["██████", "TIENDA", "██████"];

// ===================== ESTADO =====================
let modo = "manual";
let pos = 5;
let tiendaPos = 40;
let saldo = 0;
let inicio = 0;
let juegoActivo = false;

// ===================== TITULO (GoToBuy como pyfiglet) =====================
document.getElementById("title").innerText =
`
 ██████   ██████   ██████   ██████  ██████
██       ██    ██ ██    ██ ██       ██
██   ███ ██    ██ ██    ██ ██   ███ ██████
██    ██ ██    ██ ██    ██ ██    ██ ██
 ██████   ██████   ██████   ██████  ██████

            GoToBuy
`;

// ===================== INICIO =====================
function startGame(m) {
  modo = m;

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  saldo = generarSaldo();
  pos = 5;
  inicio = Date.now();
  juegoActivo = true;

  draw();
}

// ===================== SALDO =====================
function generarSaldo() {
  return +(Math.random() * (8 - 1.5) + 1.5).toFixed(2);
}

// ===================== DIBUJO =====================
function draw() {
  let line = "";

  for (let i = 0; i <= tiendaPos; i++) {
    if (i === 0) line += "🏠";
    else if (i === tiendaPos) line += "🏪";
    else if (i === pos) line += "😀";
    else line += "·";
  }

  document.getElementById("screen").innerText = line;

  document.getElementById("hud").innerHTML =
    `<span class="turquoise">💰 Saldo: ${saldo}€</span>`;

  if (pos >= tiendaPos) abrirTienda();
}

// ===================== MOVIMIENTO =====================
document.addEventListener("keydown", (e) => {
  if (!juegoActivo) return;
  if (!document.getElementById("shop").classList.contains("hidden")) return;

  if (e.key === "ArrowRight") pos++;
  if (e.key === "ArrowLeft" && pos > 0) pos--;

  draw();
});

// ===================== TIENDA =====================
function abrirTienda() {
  document.getElementById("shop").classList.remove("hidden");

  let html = "";
  Object.keys(PRODUCTOS).forEach((k, i) => {
    html += `${i + 1}. ${k} - ${PRODUCTOS[k]}€<br>`;
  });

  document.getElementById("productos").innerHTML = html;

  if (modo === "auto") autoCompra();
}

// ===================== IA (igual idea Python) =====================
function autoCompra() {
  let keys = Object.keys(PRODUCTOS);

  let total = 0;
  let seleccion = [];

  for (let k of keys) {
    if (total + PRODUCTOS[k] <= saldo) {
      seleccion.push(k);
      total += PRODUCTOS[k];
    }
  }

  finalizarCompra(seleccion);
}

// ===================== COMPRA MANUAL =====================
function comprar() {
  let keys = Object.keys(PRODUCTOS);
  let input = document.getElementById("input").value.split(" ");

  let seleccion = input.map(i => keys[+i - 1]).filter(Boolean);

  finalizarCompra(seleccion);
}

// ===================== FINAL COMPRA =====================
function finalizarCompra(seleccion) {
  let total = seleccion.reduce((a, p) => a + PRODUCTOS[p], 0);

  if (total > saldo) {
    alert("❌ Excede saldo");
    return;
  }

  let acierto = evaluar(total);

  document.getElementById("shop").classList.add("hidden");

  volverCasa(acierto);
}

// ===================== EVALUACIÓN (igual Python) =====================
function evaluar(total) {
  let diff = saldo - total;
  if (diff === 0) return 100;
  return Math.round((1 / (1 + diff)) * 100);
}

// ===================== VUELTA CASA =====================
function volverCasa(acierto) {
  let interval = setInterval(() => {
    if (pos > 5) {
      pos--;
      draw();
    } else {
      clearInterval(interval);
      fin(acierto);
    }
  }, 40);
}

// ===================== FINAL =====================
function fin(acierto) {
  juegoActivo = false;

  let tiempo = ((Date.now() - inicio) / 1000).toFixed(2);

  document.getElementById("end").classList.remove("hidden");
  document.getElementById("resultado").innerHTML =
    `<span class="emerald">Acierto: ${acierto}%</span><br>
     <span class="sky">Tiempo: ${tiempo}s</span>`;

  guardar(acierto, tiempo);
}

// ===================== GUARDAR =====================
function guardar(acierto, tiempo) {
  let data = JSON.parse(localStorage.getItem("partidas") || "[]");

  data.push({
    modo,
    acierto,
    tiempo,
    fecha: new Date().toLocaleString()
  });

  localStorage.setItem("partidas", JSON.stringify(data));
}

// ===================== PARTIDAS =====================
function showPartidas() {
  let data = JSON.parse(localStorage.getItem("partidas") || "[]");

  let html = "<h3>Partidas</h3>";

  data.forEach(p => {
    html += `<p>${p.fecha} | ${p.modo} | ${p.acierto}% | ${p.tiempo}s</p>`;
  });

  document.getElementById("historial").innerHTML = html;
  document.getElementById("historial").classList.remove("hidden");
}
