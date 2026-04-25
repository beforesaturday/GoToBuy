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
let pos = 5;
let tiendaPos = 50;
let saldo = 0;
let inicio = 0;
let juegoActivo = false;

// ===================== TITULO =====================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("title").innerText =
`
██████  ██████  ████████  ██████  ██████  ██    ██ ██    ██
██       ██   ██    ██    ██    ██ ██   ██ ██    ██ ██    ██
██   ███ ██████     ██    ██    ██ ██████  ██    ██ ██    ██
██    ██ ██   ██    ██    ██    ██ ██   ██ ██    ██  ██  ██
 ██████  ██   ██    ██     ██████  ██████   ██████    ████

            GoToBuy
`;
});

// ===================== INICIO =====================
function startGame(m) {
  modo = m;

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  saldo = generarSaldo();
  pos = 5; // empieza en casa (como Python)
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
    if (i === 5) line += "🏠";
    else if (i === tiendaPos) line += "🏪";
    else if (i === pos) line += "😀";
    else line += "·";
  }

  document.getElementById("screen").innerText = line;

  document.getElementById("hud").innerHTML =
    `💰 Saldo: ${saldo.toFixed(2)}€`;

  if (pos >= tiendaPos) abrirTienda();
}

// ===================== MOVIMIENTO =====================
document.addEventListener("keydown", (e) => {
  if (!juegoActivo) return;
  if (!document.getElementById("shop").classList.contains("hidden")) return;

  if (e.key === "ArrowRight") pos++;
  if (e.key === "ArrowLeft" && pos > 5) pos--;

  draw();
});

// ===================== TIENDA =====================
function abrirTienda() {
  document.getElementById("shop").classList.remove("hidden");

  let html = "";

  Object.entries(PRODUCTOS).forEach(([k, v], i) => {
    html += `${i + 1}. ${k} - ${v.toFixed(2)}€<br>`;
  });

  // ===================== MODO AUTO (IGUAL PYTHON) =====================
  if (modo === "auto") {
    let [combo] = mejorCompra(saldo);
    let nombres = combo.map(c => c[0]);

    html += `<br><span style="color:#2bff6a">
    💡 Mejor opción: ${nombres.join(", ")}
    </span>`;
  }

  document.getElementById("productos").innerHTML = html;
}

// ===================== MEJOR COMPRA (PYTHON PORT) =====================
function mejorCompra(saldo) {
  const productos = Object.entries(PRODUCTOS);

  let mejorDiff = Infinity;
  let mejorCombo = [];

  function buscar(start, combo) {
    let total = combo.reduce((acc, p) => acc + p[1], 0);

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

// ===================== EVALUAR COMPRA =====================
function evaluarCompra(saldo, seleccion) {
  let total = seleccion.reduce((acc, p) => acc + PRODUCTOS[p], 0);

  if (total > saldo) return 0;

  let [, mejorDiff] = mejorCompra(saldo);

  let diffUser = saldo - total;

  if (diffUser === 0) return 100;

  return Math.round((mejorDiff / diffUser) * 10000) / 100;
}

// ===================== COMPRA (IGUAL PYTHON WHILE TRUE) =====================
function comprar() {
  let keys = Object.keys(PRODUCTOS);
  let input = document.getElementById("input").value.trim();

  if (!input) return;

  let indices = input.split(" ");

  let seleccion = [];

  try {
    seleccion = indices.map(i => {
      let idx = parseInt(i) - 1;
      if (idx < 0 || idx >= keys.length) throw "error";
      return keys[idx];
    });
  } catch {
    return;
  }

  let total = seleccion.reduce((a, p) => a + PRODUCTOS[p], 0);

  // ❌ igual que Python: si te pasas, NO sales
  if (total > saldo) {
    document.getElementById("hud").innerHTML =
      `<span style="color:#ff4fd8">❌ Excede saldo</span>`;
    return;
  }

  let acierto = evaluarCompra(saldo, seleccion);

  document.getElementById("shop").classList.add("hidden");

  volverCasa(acierto);
}

// ===================== VUELTA CASA =====================
function volverCasa(acierto) {
  pos = tiendaPos; // empiezas en tienda

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
    `🏁 FIN<br>
     Acierto: ${acierto}%<br>
     Tiempo: ${tiempo}s`;

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

  let html = "<h3>Partidas anteriores</h3>";

  data.forEach(p => {
    html += `<p>${p.fecha} | ${p.modo} | ${p.acierto}% | ${p.tiempo}s</p>`;
  });

  document.getElementById("historial").innerHTML = html;
  document.getElementById("historial").classList.remove("hidden");
}
