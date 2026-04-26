// ===================== VOLVER MENU =====================
function volverMenu() {
  document.getElementById("menu").classList.remove("hidden");
  document.getElementById("game").classList.add("hidden");
  document.getElementById("end").classList.add("hidden");
  document.getElementById("partidas").classList.add("hidden");
  document.getElementById("shop").classList.add("hidden");

  juegoActivo = false;
}

// ===================== GUARDAR PARTIDA =====================
function guardarPartida(acierto, tiempo) {
  let data = JSON.parse(localStorage.getItem("partidas") || "[]");

  data.push({
    modo,
    acierto,
    tiempo,
    fecha: new Date().toLocaleString()
  });

  localStorage.setItem("partidas", JSON.stringify(data));
}

// ===================== LLAMAR EN FINAL =====================
function finalizar() {
  juegoActivo = false;

  let tiempo = ((Date.now() - inicio) / 1000).toFixed(2);

  guardarPartida(aciertoTemp, tiempo);

  document.getElementById("end").classList.remove("hidden");
  document.getElementById("resultado").innerHTML =
    `🏁 Acierto: ${aciertoTemp}%<br>Tiempo: ${tiempo}s`;
}

// ===================== MOSTRAR PARTIDAS =====================
function mostrarPartidas() {
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("partidas").classList.remove("hidden");

  let data = JSON.parse(localStorage.getItem("partidas") || "[]");

  let html = "";

  data.forEach(p => {
    html += `
      <div style="margin:10px;padding:10px;border:1px solid #444">
        Modo: ${p.modo}<br>
        Acierto: ${p.acierto}%<br>
        Tiempo: ${p.tiempo}s<br>
        Fecha: ${p.fecha}
      </div>
    `;
  });

  document.getElementById("listaPartidas").innerHTML =
    html || "No hay partidas aún";
}
