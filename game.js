// ===================== PRODUCTOS =====================
const PRODUCTOS = {
  Vino: 1.90,
  Refresco: 2.20,
  Cerveza: 2.45,
  Energetica: 1.80,
  Papas: 1.40
};

// ===================== ESTADO =====================
let modo = "manual";

const CASA = 5;
const TIENDA = 50;

let pos = CASA;
let saldo = 0;
let inicio = 0;
let juegoActivo = false;

let fase = "walk";
let aciertoTemp = 0;

// ===================== TITULO ASCII =====================
function titulo() {
  console.log(`
██████   ██████   ██████   ██████  ██████  ██    ██ ██    ██
 ██       ██    ██     ██   ██    ██ ██   ██ ██    ██ ██    ██
 ██   ███ ██    ██     ██   ██    ██ ██████  ██    ██ ██    ██
 ██    ██ ██    ██     ██   ██    ██ ██   ██  ██  ██   ██  ██
  ██████   ██████      ██    ██████  ██████    ████     ████

                 GoToBuy
  `);
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

  for (let i = 0; i <= TIENDA; i++) {
    if (i === CASA) line += "🏠";
    else if (i === TIENDA) line += "🏪";
    else if (i === pos) line += "😀";
    else line += "·";
  }

  document.getElementById("screen").innerText = line;

  document.getElementById("hud").innerHTML =
    `💰 Saldo: ${saldo.toFixed(2)}€ | Fase: ${fase}`;
}

// ===================== INPUT =====================
document.addEventListener("keydown", (e) => {
  if (!juegoActivo) return;
  if (document.activeElement.tagName === "INPUT") return;

  // ===================== VUELTA A CASA MANUAL =====================
  if (fase === "return") {
    if (e.key === "ArrowLeft" && pos > CASA) pos--;
    if (e.key === "ArrowRight" && pos < TIENDA) pos++;

    draw();

    if (pos === CASA) {
      finalizar();
      fase = "end";
    }

    return;
  }

  // ===================== CAMINAR =====================
  if (fase === "walk") {
    if (e.key === "ArrowRight" && pos < TIENDA) pos++;
    if (e.key === "ArrowLeft" && pos > CASA) pos--;

    draw();

    if (pos === TIENDA) abrirTienda();
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
    let [combo] = mejorCompra(saldo);
    let nombres = combo.map(c => c[0]);

    html += `<br><span style="color:#2bff6a">
      💡 Mejor opción: ${nombres.join(", ")}
    </span>`;
  }

  document.getElementById("productos").innerHTML = html;
}

// ===================== COMPRA =====================
function comprar() {
  let keys = Object.keys(PRODUCTOS);
  let input = document.getElementById("input").value.trim();

  if (!input) return;

  let seleccion = [];

  try {
    seleccion = input.split(" ").map(i => {
      let idx = parseInt(i) - 1;
      if (idx < 0 || idx >= keys.length) throw "error";
      return keys[idx];
    });
  } catch {
    return;
  }

  let total = seleccion.reduce((a, p) => a + PRODUCTOS[p], 0);

  if (total > saldo) {
    document.getElementById("hud").innerHTML =
      `<span style="color:#ff4fd8">❌ Excede saldo</span>`;
    return;
  }

  aciertoTemp = evaluarCompra(saldo, seleccion);

  document.getElementById("shop").classList.add("hidden");

  fase = "return";
  pos = TIENDA;
}

// ===================== ALGORITMO =====================
function mejorCompra(saldo) {
  const productos = Object.entries(PRODUCTOS);

  let mejorDiff = Infinity;
  let mejorCombo = [];

  function buscar(start, combo) {
    let total = combo.reduce((a, p) => a + p[1], 0);

    if (total <= saldo) {
      let diff = saldo - total;

      if (diff < mejorDiff) {
        mejorDiff = diff;
        mejorCombo = [...combo];
      }
    } else return;

    if (combo.length >= 5) return;

    for (let i = start; i < productos.length; i++) {
      buscar(i, [...combo, productos[i]]);
    }
  }

  buscar(0, []);

  return [mejorCombo, mejorDiff];
}

// ===================== EVALUAR =====================
function evaluarCompra(saldo, seleccion) {
  let total = seleccion.reduce((a, p) => a + PRODUCTOS[p], 0);

  if (total > saldo) return 0;

  let [, mejorDiff] = mejorCompra(saldo);
  let diffUser = saldo - total;

  if (diffUser === 0) return 100;

  return Math.round((mejorDiff / diffUser) * 10000) / 100;
}

// ===================== FINAL =====================
function finalizar() {
  juegoActivo = false;

  let tiempo = ((Date.now() - inicio) / 1000).toFixed(2);

  document.getElementById("end").classList.remove("hidden");
  document.getElementById("resultado").innerHTML =
    `🏁 FIN<br>
     Acierto: ${aciertoTemp}%<br>
     Tiempo: ${tiempo}s`;

  guardar(aciertoTemp, tiempo);
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
