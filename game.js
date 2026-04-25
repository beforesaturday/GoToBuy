// ===================== CONFIG =====================
const PRODUCTOS = {
  Vino: 1.90,
  Refresco: 2.20,
  Cerveza: 2.45,
  Energetica: 1.80,
  Papas: 1.40
};

// ===================== ESTADO =====================
let modo = "manual";
let pos = 0;
let tiendaPos = 50;
let saldo = 0;
let inicio = 0;
let juegoActivo = false;

// ===================== TITULO =====================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("title").innerText =
`
  ██████   ██████   ██████   ██████  ██████  ██    ██ ██    ██
 ██       ██    ██     ██   ██    ██ ██   ██ ██    ██ ██    ██
 ██   ███ ██    ██     ██   ██    ██ ██████  ██    ██ ██    ██
 ██    ██ ██    ██     ██   ██    ██ ██   ██  ██  ██   ██  ██
  ██████   ██████      ██    ██████  ██████    ████     ████

            GoToBuy
`;
});

// ===================== INICIO =====================
function startGame(m) {
  modo = m;

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  saldo = generarSaldo();
  pos = 0; // empieza en casa
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

  if (e.key === "ArrowRight" && pos < tiendaPos) pos++;
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

// ===================== ALGORITMO EXACTO =====================
function mejorCompra(saldo) {
  const productos = Object.entries(PRODUCTOS);

  let mejorDiff = Infinity;
  let mejorCombo = [];

  function generarCombos(start, comboActual) {
    let total = comboActual.reduce((acc, p) => acc + p[1], 0);

    if (total <= saldo) {
      let diff = saldo - total;

      if (diff < mejorDiff) {
        mejorDiff = diff;
        mejorCombo = [...comboActual];
      }
    } else return;

    if (comboActual.length >= 5) return;

    for (let i = start; i < productos.length; i++) {
      generarCombos(i, [...comboActual, productos[i]]);
    }
  }

  generarCombos(0, []);

  return [mejorCombo, mejorDiff];
}

// ===================== EVALUAR =====================
function evaluarCompra(saldo, seleccion) {
  let total = seleccion.reduce((acc, p) => acc + PRODUCTOS[p], 0);

  if (total > saldo) return 0;

  let [, mejorDiff] = mejorCompra(saldo);

  let diffUsuario = saldo - total;

  if (diffUsuario === 0) return 100;

  return Number(((mejorDiff / diffUsuario) * 100).toFixed(2));
}

// ===================== AUTO =====================
function autoCompra() {
  let [combo] = mejorCompra(saldo);
  let nombres = combo.map(c => c[0]);

  finalizarCompra(nombres);
}

// ===================== MANUAL =====================
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

  let acierto = evaluarCompra(saldo, seleccion);

  document.getElementById("shop").classList.add("hidden");

  volverCasa(acierto);
}

// ===================== VUELTA CASA =====================
function volverCasa(acierto) {
  pos = tiendaPos; // empieza en tienda

  let interval = setInterval(() => {
    if (pos > 0) {
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

// ===================== HISTORIAL =====================
function showPartidas() {
  let data = JSON.parse(localStorage.getItem("partidas") || "[]");

  let html = "<h3>Partidas</h3>";

  data.forEach(p => {
    html += `<p>${p.fecha} | ${p.modo} | ${p.acierto}% | ${p.tiempo}s</p>`;
  });

  document.getElementById("historial").innerHTML = html;
  document.getElementById("historial").classList.remove("hidden");
}
