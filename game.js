const state = {
    doorClosed: false,
    windowClosed: false,
    monitorOpen: false,
    temperature: 25,
    isCooling: false,
    currentCam: 1,
    hour: 0,
    power: 100,
    extremeTempTimer: 0,
    isRecharging: false,
    // Velocidade reduzida: quanto maior o número, mais lento.
    freddyPos: 1, // 1 a 6
    babyPos: 1,
    springPos: 6
};

// Controles de Temperatura
document.getElementById('btn-temp-down').addEventListener('pointerdown', () => state.isCooling = true);
document.getElementById('btn-temp-up').addEventListener('pointerdown', () => state.isCooling = false);

// Recarga Câmera 4
const rechargeBtn = document.getElementById('btn-recharge');
rechargeBtn.addEventListener('pointerdown', () => state.isRecharging = true);
rechargeBtn.addEventListener('pointerup', () => state.isRecharging = false);

// Office Actions
document.getElementById('btn-door-action').addEventListener('pointerdown', () => {
    state.doorClosed = !state.doorClosed;
    document.getElementById('door-right').classList.toggle('closed');
});

document.getElementById('btn-window-action').addEventListener('pointerdown', () => {
    state.windowClosed = !state.windowClosed;
    document.getElementById('window').classList.toggle('closed');
});

document.getElementById('btn-open-monitor').addEventListener('pointerdown', () => {
    state.monitorOpen = true;
    document.getElementById('camera-monitor').style.display = 'flex';
});

document.getElementById('btn-close-cam').addEventListener('pointerdown', () => {
    state.monitorOpen = false;
    state.isRecharging = false;
    document.getElementById('camera-monitor').style.display = 'none';
});

document.getElementById('btn-audio').addEventListener('pointerdown', () => {
    state.springPos = state.currentCam;
});

document.querySelectorAll('.cam-btn').forEach(btn => {
    btn.addEventListener('pointerdown', (e) => {
        state.currentCam = parseInt(e.target.dataset.cam);
        document.getElementById('cam-name').innerText = "CAM 0" + state.currentCam;
        // Mostrar botão de recarga apenas na CAM 4
        rechargeBtn.style.display = (state.currentCam === 4) ? "block" : "none";
        updateMotionAlert();
    });
});

function updateMotionAlert() {
    let alerts = [];
    if (state.freddyPos == state.currentCam) alerts.push("FREDDY");
    if (state.babyPos == state.currentCam) alerts.push("BABY");
    if (state.springPos == state.currentCam) alerts.push("SPRINGBONNIE");
    document.getElementById('motion-alert').innerText = alerts.length > 0 ? "MOVIMENTO: " + alerts.join(", ") : "NENHUM MOVIMENTO";
}

// Loop Principal
setInterval(() => {
    // 1. Temperatura
    state.temperature += state.isCooling ? -1 : 0.5;
    document.getElementById('temp-display').innerText = `TEMP: ${Math.floor(state.temperature)}°C`;
    
    if (state.temperature <= 0 || state.temperature >= 50) {
        state.extremeTempTimer++;
        if (state.extremeTempTimer >= 60) gameOver("COLAPSO TÉRMICO");
    } else {
        state.extremeTempTimer = 0;
    }

    // 2. Energia
    if (state.isRecharging && state.monitorOpen && state.currentCam === 4) {
        state.power = Math.min(100, state.power + 1.5);
    } else {
        let drain = 0.05;
        if (state.doorClosed) drain += 0.15;
        if (state.windowClosed) drain += 0.15;
        state.power -= drain;
    }
    document.getElementById('power-display').innerText = `BATERIA: ${Math.floor(state.power)}%`;
    if (state.power <= 0) gameOver("FALTA DE ENERGIA");

    // 3. IA Lenta (Chance de movimento reduzida para 10%)
    if (Math.random() > 0.90) {
        state.freddyPos = (state.freddyPos >= 6) ? 0 : state.freddyPos + 1;
        if (state.freddyPos === 0 && !state.doorClosed) gameOver("FREDDY");
        if (state.freddyPos === 0 && state.doorClosed) state.freddyPos = 1;
    }

    if (Math.random() > 0.95) {
        state.babyPos = (state.babyPos >= 6) ? 0 : state.babyPos + 1;
        if (state.babyPos === 0) {
            if (state.temperature > 10 && !state.windowClosed) gameOver("CIRCUS BABY");
            else if (state.windowClosed || state.temperature <= 10) {
                if(Math.random() > 0.5) state.babyPos = 1; // Ela volta um pouco
            }
        }
    }

    if (Math.random() > 0.92) {
        state.springPos--;
        if (state.springPos <= 0) {
            if (!state.doorClosed) gameOver("SPRINGBONNIE");
            else state.springPos = 5;
        }
    }

    if (state.monitorOpen) updateMotionAlert();
}, 1000);

// Relógio (1 min real = 1h jogo)
setInterval(() => {
    state.hour++;
    document.getElementById('clock').innerText = state.hour + " AM";
    if (state.hour >= 6) { alert("VENCEU!"); location.reload(); }
}, 60000);

function gameOver(anim) {
    alert("JUMPSCARE: " + anim);
    location.reload();
}
