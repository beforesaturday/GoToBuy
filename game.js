const PRODUCTOS = {
  Vino: 1.90,
  Refresco: 2.20,
  Cerveza: 2.45,
  Energetica: 1.80,
  Papas: 1.40
};

let saldo = 0;
let modo = "manual";
let startTime = 0;
let history = JSON.parse(localStorage.getItem("partidas") || "[]");

// ===================== SALDO =====================
function generarSaldo() {
  while (true) {
    let s = +(Math.random() * (8 - 1.5) + 1.5).toFixed(2);
    if (existeCombinacion(s)) return s;
  }
}

// combinations with replacement
function combos(arr, r) {
  let result = [];

  function backtrack(start, path) {
    if (path.length === r) {
      result.push([...path]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      path.push(arr[i]);
      backtrack(i, path);
      path.pop();
    }
  }

  backtrack(0, []);
  return result;
}

function existeCombinacion(saldo) {
  let precios = Object.values(PRODUCTOS);

  for (let r = 1; r <= 5; r++) {
    for (let c of combos(precios, r)) {
      let sum = c.reduce((a, b) => a + b, 0);
      if (sum <= saldo) return true;
    }
  }
  return false;
}

// ===================== MEJOR COMPRA =====================
function mejorCompra(saldo) {
  let entries = Object.entries(PRODUCTOS);
  let mejor = [];
  let mejorDiff = Infinity;

  for (let r = 1; r <= 5; r++) {
    for (let c of combos(entries, r)) {
      let total = c.reduce((a, b) => a + b[1], 0);
      if (total <= saldo) {
        let diff = saldo - total;
        if (diff < mejorDiff) {
          mejorDiff = diff;
          mejor = c;
        }
      }
    }
  }
  return { mejor, mejorDiff };
}

// ===================== EVALUAR =====================
function evaluar(saldo, seleccion) {
  let total = seleccion.reduce((a, p) => a + PRODUCTOS[p], 0);
  if (total > saldo) return 0;

  let { mejorDiff } = mejorCompra(saldo);
  let diffUser = saldo - total;

  if (diffUser === 0) return 100;

  return +(mejorDiff / diffUser * 100).toFixed(2);
}

// ===================== UI =====================
function startGame(m) {
  modo = m;
  saldo = generarSaldo();
  startTime = Date.now();

  document.getElementById("menu").style.display = "none";
  document.getElementById("shop").classList.remove("hidden");

  document.getElementById("saldo").innerText = "💰 Saldo: " + saldo + "€";

  let html = "";
  Object.keys(PRODUCTOS).forEach((p, i) => {
    html += `${i + 1}. ${p} - ${PRODUCTOS[p]}€<br>`;
  });

  document.getElementById("productos").innerHTML = html;
}

// ===================== COMPRA =====================
function buy() {
  let input = document.getElementById("input").value.split(" ");
  let keys = Object.keys(PRODUCTOS);

  let seleccion = input.map(i => keys[parseInt(i) - 1]).filter(Boolean);

  let acierto = evaluar(saldo, seleccion);
  let tiempo = ((Date.now() - startTime) / 1000).toFixed(2);

  history.push({
    modo,
    acierto,
    tiempo,
    fecha: new Date().toLocaleString()
  });

  localStorage.setItem("partidas", JSON.stringify(history));

  alert(`🏁 Fin\nAcierto: ${acierto}%\nTiempo: ${tiempo}s`);
  location.reload();
}

// ===================== HISTORIAL =====================
function showHistory() {
  alert(JSON.stringify(history, null, 2));
}

// ===================== CLEAR =====================
function clearScreen() {
  document.body.innerHTML = "<h1>Juego cerrado</h1>";
}
