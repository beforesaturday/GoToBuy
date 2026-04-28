const PRODUCTOS = { "Vino": 1.90, "Refresco": 2.20, "Cerveza": 2.45, "Energetica": 1.80, "Papas": 1.40 };
let gameState = {
    pos: 5,
    saldo: 0,
    modo: 'manual',
    carrito: [],
    startTime: 0,
    fase: 'camino' // camino, tienda, vuelta
};

const CASA = [" ██████ ", " ██  ██ ", "██████████", "██ ██ ██", "██  ██  "];
const TIENDA = [" ████████ ", "██ TIEN ██", "██  DA  ██", "██      ██", "██████████"];
const PERSONA = ["  ██  ", " ████ ", "  ██  ", "  █ █ ", " ██ ██"];

// --- Lógica de Juego ---

function generarSaldo() {
    return (Math.random() * (8.0 - 1.5) + 1.5).toFixed(2);
}

function obtenerMejorCompra(saldo) {
    let precios = Object.entries(PRODUCTOS);
    let mejorDiff = Infinity;
    let mejorCombo = [];

    function buscar(index, actualCombo, actualTotal) {
        if (actualTotal <= saldo) {
            let diff = saldo - actualTotal;
            if (diff < mejorDiff) {
                mejorDiff = diff;
                mejorCombo = [...actualCombo];
            }
        }
        if (actualCombo.length >= 5 || index >= precios.length) return;

        for (let i = index; i < precios.length; i++) {
            buscar(i, [...actualCombo, precios[i][0]], actualTotal + precios[i][1]);
        }
    }
    buscar(0, [], 0);
    return { combo: mejorCombo, diff: mejorDiff };
}

// --- Renderizado ---

function dibujar() {
    const width = 50;
    let canvas = Array(10).fill().map(() => Array(width).fill(" "));

    // Dibujar Casa
    CASA.forEach((row, y) => {
        row.split("").forEach((char, x) => { canvas[y+2][x] = char; });
    });

    // Dibujar Tienda
    TIENDA.forEach((row, y) => {
        row.split("").forEach((char, x) => { canvas[y+2][width - row.length + x] = char; });
    });

    // Dibujar Persona
    PERSONA.forEach((row, y) => {
        row.split("").forEach((char, x) => {
            if (gameState.pos + x < width) canvas[y+3][gameState.pos + x] = char;
        });
    });

    document.getElementById('canvas').innerText = canvas.map(r => r.join("")).join("\n");
}

// --- Controladores ---

function startGame(modo) {
    gameState = { pos: 5, saldo: parseFloat(generarSaldo()), modo, carrito: [], startTime: Date.now(), fase: 'camino' };
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('info-bar').innerText = `💰 Saldo: ${gameState.saldo}€`;
    dibujar();
}

window.addEventListener('keydown', (e) => {
    if (gameState.fase === 'camino' || gameState.fase === 'vuelta') {
        if (e.key === "ArrowRight" && gameState.pos < 40) gameState.pos++;
        if (e.key === "ArrowLeft" && gameState.pos > 0) gameState.pos--;
        
        dibujar();

        if (gameState.fase === 'camino' && gameState.pos >= 38) abrirTienda();
        if (gameState.fase === 'vuelta' && gameState.pos <= 5) finalizarPartida();
    }
});

function abrirTienda() {
    gameState.fase = 'tienda';
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('shop-screen').classList.remove('hidden');
    document.getElementById('shop-balance').innerText = `Saldo disponible: ${gameState.saldo}€`;
    
    const list = document.getElementById('product-list');
    list.innerHTML = "";
    Object.entries(PRODUCTOS).forEach(([nombre, precio]) => {
        let btn = document.createElement('button');
        btn.innerText = `${nombre} - ${precio.toFixed(2)}€`;
        btn.onclick = () => {
            gameState.carrito.push(nombre);
            document.getElementById('current-cart').innerText = gameState.carrito.join(", ");
        };
        list.appendChild(btn);
    });

    if (gameState.modo === 'auto') {
        const mejor = obtenerMejorCompra(gameState.saldo);
        const hint = document.getElementById('hint');
        hint.innerText = `💡 Tip: La mejor compra es ${mejor.combo.join(", ")}`;
        hint.classList.remove('hidden');
    }
}

function checkout() {
    let total = gameState.carrito.reduce((acc, prod) => acc + PRODUCTOS[prod], 0);
    if (total > gameState.saldo) {
        alert("¡Te has pasado del presupuesto!");
        gameState.carrito = [];
        document.getElementById('current-cart').innerText = "";
        return;
    }
    
    const mejor = obtenerMejorCompra(gameState.saldo);
    let diffUsuario = gameState.saldo - total;
    gameState.acierto = diffUsuario === 0 ? 100 : Math.min(100, Math.round((mejor.diff / diffUsuario) * 100));
    
    gameState.fase = 'vuelta';
    document.getElementById('shop-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
}

function finalizarPartida() {
    const tiempo = ((Date.now() - gameState.startTime) / 1000).toFixed(2);
    const partida = {
        modo: gameState.modo,
        acierto: gameState.acierto,
        tiempo: tiempo,
        fecha: new Date().toLocaleString()
    };

    let historial = JSON.parse(localStorage.getItem('partidas') || "[]");
    historial.push(partida);
    localStorage.setItem('partidas', JSON.stringify(historial));

    alert(`🏁 FIN\nAcierto: ${gameState.acierto}%\nTiempo: ${tiempo}s`);
    showMenu();
}

function showMenu() {
    document.querySelectorAll('#game-container > div').forEach(div => div.classList.add('hidden'));
    document.getElementById('menu').classList.remove('hidden');
}

function showStats() {
    document.getElementById('menu').classList.add('hidden');
    const screen = document.getElementById('stats-screen');
    screen.classList.remove('hidden');
    const log = document.getElementById('stats-log');
    let historial = JSON.parse(localStorage.getItem('partidas') || "[]");
    log.innerHTML = historial.map(p => `<p>${p.fecha} - ${p.modo}: ${p.acierto}% en ${p.tiempo}s</p>`).join("");
}
