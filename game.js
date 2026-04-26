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

function existeCombinacion(saldo) {
  let precios = Object.values(PRODUCTOS);

  for (let r = 1; r <= 5; r++) {
    let combos = getCombos(precios, r);
    for (let c of combos) {
      let sum = c.reduce((a, b) => a + b, 0);
      if (sum <= saldo) return true;
    }
  }
  return false;
}

function getCombos(arr, r) {
  let res = [];

  function backtrack(start, path) {
    if (path.length === r) {
      res.push([...path]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      path.push(arr[i]);
      backtrack(i, path);
      path.pop();
    }
  }

  backtrack(0, []);
  return res;
}

// ===================== INICIO =====================
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
  let input = document.getElementById("input").value.trim().split(" ");
  let keys = Object.keys(PRODUCTOS);

  let seleccion = input
    .map(i => keys[parseInt(i) - 1])
    .filter(Boolean);

  let total = seleccion.reduce((a, p) => a + PRODUCTOS[p], 0);

  if (total > saldo) {
    alert("❌ Excede saldo");
    return;
  }

  let acierto = evaluar(saldo, total);
  let tiempo = ((Date.now() - startTime) / 1000).toFixed(2);

  history.push({
    modo,
    acierto,
    tiempo,
    fecha: new Date().toLocaleString()
  });

  localStorage.setItem("partidas", JSON.stringify(history));

  alert(`🏁 FIN\nAcierto: ${acierto}%\nTiempo: ${tiempo}s`);
  location.reload();
}

// ===================== EVALUACIÓN =====================
function evaluar(saldo, total) {
  let diff = saldo - total;
  if (diff === 0) return 100;
  return Math.max(0, 100 - diff * 20).toFixed(2);
}

// ===================== HISTORIAL =====================
function showHistory() {
  alert(JSON.stringify(history, null, 2));
}

// ===================== RESET =====================
function resetGame() {
  location.reload();
}
