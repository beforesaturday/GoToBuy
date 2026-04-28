document.addEventListener('DOMContentLoaded', () => {
    // --- Configuración ---
    const PRODUCTOS = { "Vino": 1.90, "Refresco": 2.20, "Cerveza": 2.45, "Energetica": 1.80, "Papas": 1.40 };
    let state = { pos: 5, saldo: 0, modo: 'manual', carrito: [], startTime: 0, fase: 'menu' };

    const CASA = [" ██████ ", " ██  ██ ", "██████████", "██ ██ ██", "██  ██  "];
    const TIENDA = [" ████████ ", "██ TIEN ██", "██  DA  ██", "██      ██", "██████████"];
    const PERSONA = ["  ██  ", " ████ ", "  ██  ", "  █ █ ", " ██ ██"];

    // --- Selectores ---
    const screens = {
        menu: document.getElementById('menu'),
        game: document.getElementById('game-screen'),
        shop: document.getElementById('shop-screen'),
        stats: document.getElementById('stats-screen')
    };

    // --- Funciones de Lógica ---
    function getBestBuy(saldo) {
        let items = Object.entries(PRODUCTOS);
        let bestDiff = Infinity;
        let bestCombo = [];

        function find(idx, currentCombo, currentTotal) {
            if (currentTotal <= saldo) {
                let diff = saldo - currentTotal;
                if (diff < bestDiff) { bestDiff = diff; bestCombo = [...currentCombo]; }
            }
            if (currentCombo.length >= 5 || idx >= items.length) return;
            for (let i = idx; i < items.length; i++) {
                find(i, [...currentCombo, items[i][0]], currentTotal + items[i][1]);
            }
        }
        find(0, [], 0);
        return { combo: bestCombo, diff: bestDiff };
    }

    function draw() {
        const width = 50;
        let canvas = Array(10).fill().map(() => Array(width).fill(" "));
        CASA.forEach((r, y) => r.split("").forEach((c, x) => canvas[y+2][x] = c));
        TIENDA.forEach((r, y) => r.split("").forEach((c, x) => canvas[y+2][width - r.length + x] = c));
        PERSONA.forEach((r, y) => r.split("").forEach((c, x) => {
            if (state.pos + x < width) canvas[y+3][state.pos + x] = c;
        }));
        document.getElementById('canvas').innerText = canvas.map(r => r.join("")).join("\n");
    }

    // --- Navegación ---
    function showScreen(name) {
        Object.values(screens).forEach(s => s.classList.add('hidden'));
        screens[name].classList.remove('hidden');
    }

    function start(modo) {
        state = { 
            pos: 5, 
            saldo: parseFloat((Math.random() * 6.5 + 1.5).toFixed(2)), 
            modo, 
            carrito: [], 
            startTime: Date.now(), 
            fase: 'camino' 
        };
        document.getElementById('info-bar').innerText = `💰 SALDO: ${state.saldo.toFixed(2)}€`;
        showScreen('game');
        draw();
    }

    // --- Eventos de Botones ---
    document.getElementById('btn-auto').onclick = () => start('auto');
    document.getElementById('btn-manual').onclick = () => start('manual');
    document.getElementById('btn-stats').onclick = () => {
        const log = document.getElementById('stats-log');
        const data = JSON.parse(localStorage.getItem('gp_partidas') || "[]");
        log.innerHTML = data.length ? data.map(p => `<p>${p.fecha} | Acierto: ${p.acierto}% | ${p.tiempo}s</p>`).join("") : "<p>No hay partidas registradas.</p>";
        showScreen('stats');
    };
    
    document.querySelectorAll('.btn-back').forEach(b => b.onclick = () => showScreen('menu'));

    window.onkeydown = (e) => {
        if (state.fase === 'camino' || state.fase === 'vuelta') {
            if (e.key === "ArrowRight" && state.pos < 42) state.pos++;
            if (e.key === "ArrowLeft" && state.pos > 0) state.pos--;
            draw();
            if (state.fase === 'camino' && state.pos >= 38) enterShop();
            if (state.fase === 'vuelta' && state.pos <= 5) finish();
        }
    };

    function enterShop() {
        state.fase = 'tienda';
        showScreen('shop');
        document.getElementById('shop-balance').innerText = `Saldo: ${state.saldo.toFixed(2)}€`;
        const list = document.getElementById('product-list');
        list.innerHTML = "";
        
        Object.entries(PRODUCTOS).forEach(([n, p]) => {
            let b = document.createElement('button');
            b.innerText = `${n} (${p.toFixed(2)}€)`;
            b.onclick = () => {
                state.carrito.push(n);
                document.getElementById('current-cart').innerText = state.carrito.join(", ");
            };
            list.appendChild(b);
        });

        const hint = document.getElementById('hint-box');
        if (state.modo === 'auto') {
            const best = getBestBuy(state.saldo);
            hint.innerText = `💡 AYUDA: Compra ${best.combo.join(", ")}`;
            hint.classList.remove('hidden');
        } else {
            hint.classList.add('hidden');
        }
    }

    document.getElementById('btn-checkout').onclick = () => {
        let total = state.carrito.reduce((a, b) => a + PRODUCTOS[b], 0);
        if (total > state.saldo) return alert("¡Te has pasado del saldo!");
        
        const best = getBestBuy(state.saldo);
        let userDiff = state.saldo - total;
        state.acierto = userDiff === 0 ? 100 : Math.max(0, Math.round((best.diff / userDiff) * 100));
        
        state.fase = 'vuelta';
        showScreen('game');
    };

    function finish() {
        state.fase = 'menu';
        const tiempo = ((Date.now() - state.startTime) / 1000).toFixed(1);
        const res = { acierto: state.acierto, tiempo, fecha: new Date().toLocaleDateString() };
        
        let history = JSON.parse(localStorage.getItem('gp_partidas') || "[]");
        history.push(res);
        localStorage.setItem('gp_partidas', JSON.stringify(history));

        alert(`¡Llegaste a casa!\nAcierto: ${state.acierto}%\nTiempo: ${tiempo}s`);
        showScreen('menu');
    }
});
