console.log("JS cargado correctamente");

const PRODUCTOS = {
    "Vino": 1.90,
    "Refresco": 2.20,
    "Cerveza": 2.45,
    "Energetica": 1.80,
    "Papas": 1.40
};

let saldo = 0;
let modo = "manual";

let pos = 0;
let tiendaPos = 20;
let fase = "ida";

function generarSaldo() {
    return parseFloat((Math.random() * (8 - 1.5) + 1.5).toFixed(2));
}

function draw() {
    let line = "";

    for (let i = 0; i <= tiendaPos; i++) {
        if (i === 0) line += "🏠";
        else if (i === tiendaPos) line += "🏪";
        else if (i === pos) line += "🧍";
        else line += "·";
    }

    document.getElementById("map").innerText = line;
}

document.addEventListener("keydown", (e) => {
    if (document.getElementById("game").classList.contains("hidden")) return;

    if (fase === "ida") {
        if (e.key === "ArrowRight") pos++;
        if (e.key === "ArrowLeft" && pos > 0) pos--;

        if (pos >= tiendaPos) {
            fase = "tienda";
            document.getElementById("shop").style.display = "block";
        }
    }

    else if (fase === "vuelta") {
        if (e.key === "ArrowLeft") pos--;
        if (e.key === "ArrowRight" && pos < tiendaPos) pos++;

        if (pos <= 0) {
            fase = "fin";
            terminarPartida();
        }
    }

    draw();
});

function mejorCompra(saldo) {
    let keys = Object.keys(PRODUCTOS);
    let best = [];
    let bestDiff = Infinity;

    function backtrack(combo, total) {
        if (total <= saldo) {
            let diff = saldo - total;
            if (diff < bestDiff) {
                bestDiff = diff;
                best = [...combo];
            }
        }
        if (combo.length >= 5) return;

        for (let k of keys) {
            combo.push(k);
            backtrack(combo, total + PRODUCTOS[k]);
            combo.pop();
        }
    }

    backtrack([], 0);
    return { combo: best, diff: bestDiff };
}

function evaluarCompra(saldo, seleccion) {
    let total = seleccion.reduce((a, p) => a + PRODUCTOS[p], 0);
    if (total > saldo) return 0;

    let mejor = mejorCompra(saldo);
    let diffUser = saldo - total;

    if (diffUser === 0) return 100;

    return ((mejor.diff / diffUser) * 100).toFixed(2);
}

function startGame(m) {
    modo = m;
    saldo = generarSaldo();

    pos = 0;
    fase = "ida";

    document.getElementById("menu").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");

    document.getElementById("saldo").innerText = "💰 Saldo: " + saldo + "€";

    let shop = document.getElementById("shop");
    shop.innerHTML = "";
    shop.style.display = "none";

    Object.entries(PRODUCTOS).forEach(([k,v], i) => {
        let div = document.createElement("div");
        div.className = "product";
        div.innerText = `${i+1}. ${k} - ${v}€`;
        shop.appendChild(div);
    });

    if (modo === "auto") {
        let mejor = mejorCompra(saldo);
        document.getElementById("hint").innerText =
            "💡 Mejor: " + mejor.combo.join(", ");
    }

    draw();
}

function submitBuy() {
    let input = document.getElementById("input").value.split(" ");
    let keys = Object.keys(PRODUCTOS);

    try {
        let seleccion = input.map(i => keys[parseInt(i)-1]);
        let total = seleccion.reduce((a,p)=>a+PRODUCTOS[p],0);

        if (total > saldo) {
            alert("❌ Excede saldo");
            return;
        }

        let acierto = evaluarCompra(saldo, seleccion);

        let data = JSON.parse(localStorage.getItem("partidas") || "[]");
        data.push({
            modo: modo,
            acierto: acierto,
            fecha: new Date().toLocaleString()
        });
        localStorage.setItem("partidas", JSON.stringify(data));

        document.getElementById("resultado").innerText =
            `Acierto: ${acierto}%`;

        fase = "vuelta";
        document.getElementById("shop").style.display = "none";
        alert("🏠 Vuelve a casa");

    } catch {
        alert("Entrada inválida");
    }
}

function terminarPartida() {
    document.getElementById("game").classList.add("hidden");
    document.getElementById("result").classList.remove("hidden");
}

function showHistory() {
    let data = JSON.parse(localStorage.getItem("partidas") || "[]");
    alert(JSON.stringify(data, null, 2));
}

function reset() {
    location.reload();
}
