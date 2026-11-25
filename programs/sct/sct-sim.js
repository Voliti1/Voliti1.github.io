(function () {
  "use strict";

  const ACCOUNTS = [
    { UserId: "voliti", Password: "1", UserLevel: "Admin", UserName: "서준원" },
    { UserId: "voliti2", Password: "2", UserLevel: "Normal", UserName: "서준원" }
  ];

  const DEFAULT_SETTINGS = {
    EtherCatReadCycleMs: 300,
    ReconnectRetryCount: 3,
    ConnectionTimeoutMs: 5000,
    ShowDebugLog: true,
    DoorOpenInterlock: true,
    AlarmAutoStop: true,
    AutoStopAlarmLevel: "ERROR",
    ModeChangeForceStop: false,
    IdleLampStatus: "Yellow",
    RunLampStatus: "Green",
    AlarmLampStatus: "Red",
    MaintenanceLampStatus: "Yellow",
    Accel: 1000000,
    Decel: 1000000,
    MaxVelo: 100000000,
    Velo: 1000000
  };

  const DEFAULT_RECIPES = {
    "PM A": [
      {
        PM: "PM A",
        RecipeType: "CVD",
        RecipeName: "CVD_1",
        PPID: "CVD_001",
        Description: "",
        CreatedBy: "User",
        ModifiedDate: "2026-07-07 09:20:32",
        Fields: {
          "Recipe Name": "CVD_1",
          PPID: "CVD_001",
          Description: "",
          "Process Time": "5",
          Temperature: "450",
          Pressure: "100",
          "Gas Flow": "100",
          "RF Power": "100"
        }
      },
      {
        PM: "PM A",
        RecipeType: "CVD",
        RecipeName: "CVD_Low",
        PPID: "CVD_002",
        Description: "",
        CreatedBy: "User",
        ModifiedDate: "2026-07-04 19:11:34",
        Fields: {
          "Recipe Name": "CVD_Low",
          PPID: "CVD_002",
          Description: "",
          "Process Time": "10",
          Temperature: "450",
          Pressure: "2.5",
          "Gas Flow": "100",
          "RF Power": "300"
        }
      }
    ],
    "PM B": [
      {
        PM: "PM B",
        RecipeType: "CMP",
        RecipeName: "CMP_Low",
        PPID: "CMP_002",
        Description: "",
        CreatedBy: "User",
        ModifiedDate: "2026-07-04 19:12:21",
        Fields: {
          "Recipe Name": "CMP_Low",
          PPID: "CMP_002",
          Description: "",
          "Process Time": "10",
          "Platen Speed": "50",
          "Carrier Speed": "45",
          "Down Force": "2.0",
          "Slurry Flow": "100",
          "Pad Type": "Soft"
        }
      },
      {
        PM: "PM B",
        RecipeType: "CMP",
        RecipeName: "CMP_Medium",
        PPID: "CMP_001",
        Description: "",
        CreatedBy: "User",
        ModifiedDate: "2026-07-04 19:03:01",
        Fields: {
          "Recipe Name": "CMP_Medium",
          PPID: "CMP_001",
          Description: "",
          "Process Time": "45",
          "Platen Speed": "50",
          "Carrier Speed": "45",
          "Down Force": "2.0",
          "Slurry Flow": "100",
          "Pad Type": "Soft"
        }
      }
    ],
    "PM C": [
      {
        PM: "PM C",
        RecipeType: "Cleaning",
        RecipeName: "Cleaning_Low",
        PPID: "Clean_002",
        Description: "",
        CreatedBy: "User",
        ModifiedDate: "2026-07-04 19:13:15",
        Fields: {
          "Recipe Name": "Cleaning_Low",
          PPID: "Clean_002",
          Description: "",
          "Process Time": "10",
          "Cleaning Mode": "DI",
          "DI Water Flow": "1.5",
          "Chemical Flow": "0",
          "Spin Speed": "800",
          "Dry Time": "5"
        }
      },
      {
        PM: "PM C",
        RecipeType: "Cleaning",
        RecipeName: "Cleaning_Medium",
        PPID: "Clean_001",
        Description: "",
        CreatedBy: "User",
        ModifiedDate: "2026-07-04 19:03:15",
        Fields: {
          "Recipe Name": "Cleaning_Medium",
          PPID: "Clean_001",
          Description: "",
          "Process Time": "30",
          "Cleaning Mode": "DI",
          "DI Water Flow": "1.5",
          "Chemical Flow": "0",
          "Spin Speed": "800",
          "Dry Time": "10"
        }
      }
    ],
    Process: [
      {
        RecipeName: "ABC",
        PPID: "Auto_1",
        Steps: [
          { StepNo: 1, Module: "PM A", RecipeName: "CVD_Low", ProcessTime: 10 },
          { StepNo: 2, Module: "PM B", RecipeName: "CMP_Low", ProcessTime: 10 },
          { StepNo: 3, Module: "PM C", RecipeName: "Cleaning_Low", ProcessTime: 10 }
        ]
      },
      {
        RecipeName: "AC",
        PPID: "AC_001",
        Steps: [
          { StepNo: 1, Module: "PM A", RecipeName: "CVD_Low", ProcessTime: 10 },
          { StepNo: 2, Module: "PM C", RecipeName: "Cleaning_Low", ProcessTime: 10 }
        ]
      },
      {
        RecipeName: "BC",
        PPID: "BC_001",
        Steps: [
          { StepNo: 1, Module: "PM B", RecipeName: "CMP_Low", ProcessTime: 10 },
          { StepNo: 2, Module: "PM C", RecipeName: "Cleaning_Low", ProcessTime: 10 }
        ]
      },
      {
        RecipeName: "C",
        PPID: "C_001",
        Steps: [
          { StepNo: 1, Module: "PM C", RecipeName: "Cleaning_Low", ProcessTime: 10 }
        ]
      }
    ]
  };

  const EQUIPMENT_TARGETS = [
    { name: "PM A", lr: -59064, angle: 270 },
    { name: "PM B", lr: -190823, angle: 0 },
    { name: "PM C", lr: -322000, angle: 90 },
    { name: "FOUP A", lr: 13140, angle: 225 },
    { name: "FOUP B", lr: -395093, angle: 135 }
  ];

  const FOUP_UD = [302380, 982378, 1627604, 2332102, 3018457];
  const AXIS1_SOFT_LIMIT = 3100000;

  function loadStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(fallback));
    } catch (_) {
      return JSON.parse(JSON.stringify(fallback));
    }
  }

  function saveStorage(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (_) {}
  }

  const state = {
    mode: "Operate",
    connected: true,
    servoOn: true,
    account: null,
    settings: loadStorage("sct_settings_v1", DEFAULT_SETTINGS),
    recipes: loadStorage("sct_recipes_v1", DEFAULT_RECIPES),
    selectedProcessName: "ABC",
    recipeTab: "PM A",
    selectedRecipeIdx: 0,
    logTab: "Alarm",
    logDesc: true,
    selectedLogId: null,
    logs: [],
    nextLogId: 1,
    activeAlarms: new Set(),
    axisFault: false,
    speed: 3,
    robot: {
      ud: 0,
      lr: 13140,
      targetLr: 13140,
      cylForward: false,
      cylBack: true,
      hasWafer: false,
      vacuumOn: false
    },
    tower: { red: false, yellow: true, green: false },
    foupA: [true, true, true, true, true],
    foupB: [false, false, false, false, false],
    pms: {
      "PM A": { doorOpen: false, lampOn: false, lampBlink: false, hasWafer: false, recipe: "-", step: "-", rTime: "0 / 0", sTime: "0 / 0", stepNum: "0 / 0 step", msg: "Idle", progress: 0, status: "idle" },
      "PM B": { doorOpen: false, lampOn: false, lampBlink: false, hasWafer: false, recipe: "-", step: "-", rTime: "0 / 0", sTime: "0 / 0", stepNum: "0 / 0 step", msg: "Idle", progress: 0, status: "idle" },
      "PM C": { doorOpen: false, lampOn: false, lampBlink: false, hasWafer: false, recipe: "-", step: "-", rTime: "0 / 0", sTime: "0 / 0", stepNum: "0 / 0 step", msg: "Idle", progress: 0, status: "idle" }
    },
    seq: {
      running: false,
      paused: false,
      steps: [],
      idx: 0,
      waitRemaining: 0,
      totalProcessSec: 0,
      elapsedTotalSec: 0
    }
  };

  let simTimer = null;

  function nowStrings() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return {
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
      full: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    };
  }

  function showToast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.remove("show"), 2600);
  }

  function writeLog(category, level, message) {
    const ts = nowStrings().full;
    state.logs.push({ id: state.nextLogId++, time: ts, category, level, message });
    if (state.logs.length > 500) state.logs.shift();
    if (state.mode === "Log") renderLogs();
  }

  function applyTowerStatus(colorName) {
    state.tower.red = colorName === "Red";
    state.tower.yellow = colorName === "Yellow";
    state.tower.green = colorName === "Green";
    renderTower();
  }

  function applyTowerForMode() {
    if (state.activeAlarms.size > 0) {
      applyTowerStatus(state.settings.AlarmLampStatus);
      return;
    }
    if (state.seq.running && !state.seq.paused) {
      applyTowerStatus(state.settings.RunLampStatus);
      return;
    }
    if (state.mode === "Maint") {
      applyTowerStatus(state.settings.MaintenanceLampStatus);
      return;
    }
    applyTowerStatus(state.settings.IdleLampStatus);
  }

  function ensureOperationAllowed() {
    if (!state.account) {
      showToast("장비 동작을 하려면 로그인해주세요. (상단 또는 '관리자 빠른 로그인' 클릭)");
      openLoginModal();
      return false;
    }
    if (!state.connected) {
      showToast("EtherCAT 연결이 해제되어 있습니다. RECONNECT를 눌러주세요.");
      return false;
    }
    if (state.axisFault) {
      showToast("UD 축 위치 오류(Axis Position Fault) 상태입니다. Alarm Reset 후 시도하세요.");
      return false;
    }
    if (state.settings.DoorOpenInterlock) {
      const openPm = Object.keys(state.pms).find((k) => state.pms[k].doorOpen);
      if (openPm) {
        writeLog("Alarm", "WARN", `Door Open Interlock: ${openPm} 도어가 열려 있어 동작 차단`);
        showToast(`Door Open Interlock 상태입니다. ${openPm} 도어를 닫은 후 동작해주세요.`);
        return false;
      }
    }
    return true;
  }

  function ensureAdminAllowed() {
    if (state.account && state.account.UserLevel === "Admin") return true;
    showToast("설정을 변경하려면 관리자(voliti / 1) 계정으로 로그인해주세요.");
    openLoginModal();
    return false;
  }

  function buildAutoSequence(processRecipe) {
    const steps = [];
    const recipeSteps = processRecipe.Steps || [];
    if (!recipeSteps.length) return steps;
    const totalProcTime = recipeSteps.reduce((acc, s) => acc + Number(s.ProcessTime || 5), 0);

    for (let slot = 0; slot < 5; slot++) {
      const slotNum = slot + 1;
      const firstPm = recipeSteps[0].Module;

      // 1. Pick from FOUP A
      steps.push({
        module: firstPm,
        desc: `FOUP A 슬롯 ${slotNum} 웨이퍼 픽업 이동`,
        action: () => {
          moveRobotTo("FOUP A", FOUP_UD[slot]);
          state.robot.cylForward = true;
          state.robot.cylBack = false;
        }
      });
      steps.push({
        module: firstPm,
        desc: `FOUP A 슬롯 ${slotNum} 진공 흡착`,
        action: () => {
          state.foupA[slot] = false;
          state.robot.hasWafer = true;
          state.robot.vacuumOn = true;
          state.robot.cylForward = false;
          state.robot.cylBack = true;
          writeLog("INFO", "INFO", `Auto Process: FOUP A Slot ${slotNum} Wafer Pick`);
        }
      });

      // 2. Process each PM in order
      recipeSteps.forEach((step, idx) => {
        const mod = step.Module;
        const sec = Math.max(2, Number(step.ProcessTime || 10));
        const pmMeta = {
          recipe: processRecipe.RecipeName,
          stepName: step.RecipeName,
          stepNum: `${idx + 1} / ${recipeSteps.length} step`,
          rTotal: totalProcTime,
          sTotal: sec
        };

        steps.push({
          module: mod,
          desc: `${mod} 이동 및 도어 열림`,
          action: () => {
            moveRobotTo(mod, 1156931);
            state.pms[mod].doorOpen = true;
            state.pms[mod].recipe = pmMeta.recipe;
            state.pms[mod].step = pmMeta.stepName;
            state.pms[mod].stepNum = pmMeta.stepNum;
            state.pms[mod].status = "running";
            state.pms[mod].msg = `${mod} loading wafer`;
          }
        });

        steps.push({
          module: mod,
          desc: `${mod} 웨이퍼 투입 및 도어 닫힘`,
          action: () => {
            state.robot.cylForward = true;
            state.robot.cylBack = false;
            state.robot.hasWafer = false;
            state.robot.vacuumOn = false;
            state.pms[mod].hasWafer = true;
            state.robot.cylForward = false;
            state.robot.cylBack = true;
            state.pms[mod].doorOpen = false;
            state.pms[mod].lampOn = true;
            state.pms[mod].lampBlink = false;
            state.pms[mod].msg = `${mod} process running`;
          }
        });

        steps.push({
          kind: "wait",
          module: mod,
          seconds: sec,
          meta: pmMeta,
          desc: `${mod} 공정 진행 중 (${step.RecipeName})`
        });

        steps.push({
          module: mod,
          desc: `${mod} 공정 완료 및 언로드`,
          action: () => {
            state.pms[mod].lampOn = false;
            state.pms[mod].lampBlink = true;
            state.pms[mod].doorOpen = true;
            state.pms[mod].hasWafer = false;
            state.robot.hasWafer = true;
            state.robot.vacuumOn = true;
            state.pms[mod].doorOpen = false;
            state.pms[mod].msg = `${mod} process complete`;
            state.pms[mod].status = "idle";
            writeLog("INFO", "INFO", `Auto Process: ${mod} (${step.RecipeName}) 완료`);
          }
        });
      });

      // 3. Place into FOUP B
      const lastPm = recipeSteps[recipeSteps.length - 1].Module;
      steps.push({
        module: lastPm,
        desc: `FOUP B 슬롯 ${slotNum} 적재`,
        action: () => {
          moveRobotTo("FOUP B", FOUP_UD[slot]);
          state.robot.cylForward = true;
          state.robot.cylBack = false;
          state.robot.hasWafer = false;
          state.robot.vacuumOn = false;
          state.foupB[slot] = true;
          state.robot.cylForward = false;
          state.robot.cylBack = true;
          writeLog("INFO", "INFO", `Auto Process: FOUP B Slot ${slotNum} Wafer Unload 완료`);
        }
      });
    }

    return steps;
  }

  function moveRobotTo(targetName, ud) {
    const t = EQUIPMENT_TARGETS.find((x) => x.name === targetName);
    if (t) {
      state.robot.lr = t.lr;
      state.robot.targetLr = t.lr;
    }
    if (typeof ud === "number") {
      state.robot.ud = ud;
    }
  }

  function stepSimulationTick() {
    if (!state.seq.running || state.seq.paused) return;
    const step = state.seq.steps[state.seq.idx];
    if (!step) {
      finishSequence();
      return;
    }

    if (step.kind === "wait") {
      const mod = step.module;
      const pm = state.pms[mod];
      step.elapsed = (step.elapsed || 0) + 1;
      state.seq.elapsedTotalSec += 1;
      const pct = Math.min(100, Math.round((step.elapsed / step.seconds) * 100));
      pm.sTime = `${step.elapsed} / ${step.seconds}`;
      pm.rTime = `${Math.min(step.meta.rTotal, step.elapsed)} / ${step.meta.rTotal}`;
      pm.progress = pct;
      pm.msg = `${mod} process running (${step.elapsed}/${step.seconds}s)`;

      if (step.elapsed >= step.seconds) {
        state.seq.idx += 1;
      }
    } else {
      if (step.action) step.action();
      if (step.module && state.pms[step.module]) {
        state.pms[step.module].msg = step.desc;
      }
      state.seq.idx += 1;
    }

    renderAll();
    if (state.seq.idx >= state.seq.steps.length) {
      finishSequence();
    }
  }

  function finishSequence() {
    state.seq.running = false;
    state.seq.paused = false;
    clearInterval(simTimer);
    simTimer = null;
    moveRobotTo("FOUP A", 0);
    Object.keys(state.pms).forEach((k) => {
      state.pms[k].lampBlink = false;
      state.pms[k].status = "idle";
    });
    applyTowerForMode();
    writeLog("INFO", "INFO", "전체 웨이퍼(5매) 자동 공정 시퀀스 완료!");
    showToast("자동 공정 시퀀스(5매)가 모두 완료되었습니다.");
    renderAll();
  }

  function startSequenceLoop() {
    clearInterval(simTimer);
    const intervalMs = Math.max(150, Math.round(1000 / state.speed));
    simTimer = setInterval(stepSimulationTick, intervalMs);
  }

  function drawRobotCanvas() {
    const canvas = document.getElementById("robotCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Find nearest target angle
    let nearest = EQUIPMENT_TARGETS[3];
    let minDiff = Infinity;
    for (const t of EQUIPMENT_TARGETS) {
      const d = Math.abs(state.robot.lr - t.lr);
      if (d < minDiff) {
        minDiff = d;
        nearest = t;
      }
    }
    const isAligned = minDiff <= 5000;
    const gripCenterY = state.robot.cylForward && !state.robot.cylBack ? -98 : -62;

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate((nearest.angle * Math.PI) / 180);

    // Body
    ctx.fillStyle = "#eef1f6";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 4;
    ctx.fillRect(-14, -34, 28, 72);
    ctx.fillStyle = "#ced6e0";
    ctx.fillRect(3, -30, 8, 64);
    ctx.strokeRect(-14, -34, 28, 72);

    // Arm
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(0, gripCenterY + 22);
    ctx.strokeStyle = isAligned ? "#2e8b57" : "#ff8c00";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.stroke();

    // End effector / wafer
    ctx.beginPath();
    ctx.arc(0, gripCenterY, 24, 0, Math.PI * 2);
    ctx.fillStyle = state.robot.hasWafer ? "#ffd700" : "#ffffff";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    ctx.stroke();

    ctx.restore();

    document.getElementById("robotFacingLabel").textContent = `Target: ${nearest.name}`;
    document.getElementById("robotWaferLabel").textContent = `Wafer: ${state.robot.hasWafer ? "Loaded" : "None"}`;
  }

  function renderTopBar() {
    const dt = nowStrings();
    document.getElementById("lblDate").textContent = dt.date;
    document.getElementById("lblTime").textContent = dt.time;

    const connDot = document.getElementById("topConnDot");
    connDot.className = "conn-dot" + (state.connected ? " connected" : "");

    const pmDotIds = { "PM A": "topPmADot", "PM B": "topPmBDot", "PM C": "topPmCDot" };
    Object.keys(pmDotIds).forEach((pm) => {
      const el = document.getElementById(pmDotIds[pm]);
      if (state.activeAlarms.has(pm)) {
        el.style.color = "#dc2626";
      } else if (state.pms[pm].status === "running") {
        el.style.color = "#16a34a";
      } else {
        el.style.color = "#6b7280";
      }
    });

    const loginSlot = document.getElementById("loginSlot");
    if (!state.account) {
      loginSlot.innerHTML = `
        <div class="login-grid" id="loginTrigger">
          <div class="cell-head">ID</div>
          <div class="cell-head">PW</div>
          <input type="text" readonly placeholder="Click Login" />
          <input type="password" readonly placeholder="****" />
        </div>`;
      document.getElementById("loginTrigger").addEventListener("click", openLoginModal);
    } else {
      loginSlot.innerHTML = `
        <div class="login-state-box">
          <div class="login-state-info">
            <strong>${state.account.UserId} (${state.account.UserName})</strong>
            <span>${state.account.UserLevel}</span>
          </div>
          <button type="button" class="hmi-btn" id="btnLogout">Logout</button>
        </div>`;
      document.getElementById("btnLogout").addEventListener("click", () => {
        writeLog("User", "INFO", `로그아웃: ${state.account.UserId}`);
        state.account = null;
        if (state.mode === "Recipe" || state.mode === "Setting") switchMode("Operate");
        renderAll();
      });
    }
  }

  function renderTower() {
    document.getElementById("towerRed").classList.toggle("on", state.tower.red);
    document.getElementById("towerYellow").classList.toggle("on", state.tower.yellow);
    document.getElementById("towerGreen").classList.toggle("on", state.tower.green);
    document.getElementById("servoBadge").textContent = `Servo: ${state.servoOn ? "ON" : "OFF"}`;
  }

  function renderOperate() {
    // Process recipe dropdown
    const sel = document.getElementById("processRecipeSelect");
    sel.innerHTML = state.recipes.Process.map((r) => `<option value="${r.RecipeName}" ${r.RecipeName === state.selectedProcessName ? "selected" : ""}>${r.RecipeName}</option>`).join("");

    // PM visual boxes
    const map = [
      { key: "PM A", box: "boxPMA", head: "headPMA", wafer: "waferPMA" },
      { key: "PM B", box: "boxPMB", head: "headPMB", wafer: "waferPMB" },
      { key: "PM C", box: "boxPMC", head: "headPMC", wafer: "waferPMC" }
    ];
    map.forEach((m) => {
      const pm = state.pms[m.key];
      const box = document.getElementById(m.box);
      const head = document.getElementById(m.head);
      const wafer = document.getElementById(m.wafer);
      box.className = "pm-box" + (pm.lampOn ? " lamp-on" : "") + (pm.lampBlink ? " lamp-blink" : "");
      head.className = "pm-box-head" + (pm.doorOpen ? " door-open" : "");
      wafer.className = "wafer-slot-circle" + (pm.hasWafer ? " has-wafer" : "");
      wafer.textContent = pm.hasWafer ? "Wafer" : "Empty";
    });

    // FOUP A & B slots
    const foupAEl = document.getElementById("foupASlots");
    const foupBEl = document.getElementById("foupBSlots");
    foupAEl.innerHTML = state.foupA.map((full, i) => `<div class="foup-slot ${full ? "full" : ""}">Slot ${i + 1}</div>`).join("");
    foupBEl.innerHTML = state.foupB.map((full, i) => `<div class="foup-slot ${full ? "full" : ""}">Slot ${i + 1}</div>`).join("");

    // Buttons
    document.getElementById("btnStart").disabled = state.seq.running;
    document.getElementById("btnPause").disabled = !state.seq.running || state.seq.paused;
    document.getElementById("btnContinue").disabled = !state.seq.running || !state.seq.paused;
    document.getElementById("btnAbort").disabled = !state.seq.running;
    document.getElementById("btnInitialize").disabled = state.seq.running;

    // Right PM cards
    const col = document.getElementById("pmInfoCol");
    col.innerHTML = ["PM A", "PM B", "PM C"]
      .map((name) => {
        const pm = state.pms[name];
        const dotCls = state.activeAlarms.has(name) ? "alarm" : pm.status === "running" ? "running" : "";
        return `
        <div class="pm-card">
          <div class="pm-card-top">
            <span>${name}</span>
            <span>${pm.doorOpen ? "Door Open" : "Door Close"}</span>
            <span class="dot ${dotCls}">●</span>
          </div>
          <div class="pm-card-body">
            <div></div><div class="hdr">RECIPE</div><div class="hdr">STEP</div>
            <div class="lbl">Name</div><div>${pm.recipe}</div><div>${pm.step}</div>
            <div class="lbl">Time(sec)</div><div>${pm.rTime}</div><div>${pm.sTime}</div>
            <div class="lbl">Message</div><div class="span2">${pm.stepNum}</div>
            <div class="msg-row">${pm.msg}</div>
            <div class="lbl">Progress</div>
            <div class="pm-progress-wrap">
              <div class="pm-progress-bar"><div class="pm-progress-fill" style="width:${pm.progress}%"></div></div>
            </div>
          </div>
        </div>`;
      })
      .join("");

    drawRobotCanvas();
  }

  function renderMaint() {
    document.getElementById("lblUDPos").textContent = String(state.robot.ud);
    document.getElementById("lblLRPos").textContent = String(state.robot.lr);
    document.getElementById("maintDoorLblA").textContent = `A 도어 ${state.pms["PM A"].doorOpen ? "열림" : "닫힘"}`;
    document.getElementById("maintDoorLblB").textContent = `B 도어 ${state.pms["PM B"].doorOpen ? "열림" : "닫힘"}`;
    document.getElementById("maintDoorLblC").textContent = `C 도어 ${state.pms["PM C"].doorOpen ? "열림" : "닫힘"}`;

    [["PM A", "A"], ["PM B", "B"], ["PM C", "C"]].forEach(([k, s]) => {
      document.getElementById(`indDoor${s}`).classList.toggle("door-open", state.pms[k].doorOpen);
      document.getElementById(`indLamp${s}`).classList.toggle("lamp-on", state.pms[k].lampOn);
    });
  }

  function renderRecipes() {
    const listEl = document.getElementById("recipeList");
    const editorEl = document.getElementById("recipeEditor");
    const items = state.recipes[state.recipeTab] || [];
    if (state.selectedRecipeIdx >= items.length) state.selectedRecipeIdx = 0;

    listEl.innerHTML = items
      .map((r, i) => `<div class="recipe-item ${i === state.selectedRecipeIdx ? "active" : ""}" data-ridx="${i}"><span>${r.RecipeName}</span><span style="color:#64748b;font-size:11px;">${r.PPID || ""}</span></div>`)
      .join("");
    listEl.querySelectorAll(".recipe-item").forEach((el) => {
      el.addEventListener("click", () => {
        state.selectedRecipeIdx = Number(el.dataset.ridx);
        renderRecipes();
      });
    });

    const cur = items[state.selectedRecipeIdx];
    if (!cur) {
      editorEl.innerHTML = `<p style="color:#64748b;">선택된 레시피가 없습니다. New 버튼을 눌러 생성하세요.</p>`;
      return;
    }

    if (state.recipeTab === "Process") {
      const stepsHtml = (cur.Steps || [])
        .map(
          (st, idx) => `
          <div class="field-row">
            <label>Step ${idx + 1} (${st.Module})</label>
            <div style="display:flex; gap:6px;">
              <input type="text" data-pstep="${idx}" data-pkey="RecipeName" value="${st.RecipeName}" style="flex:1;" />
              <input type="number" data-pstep="${idx}" data-pkey="ProcessTime" value="${st.ProcessTime}" style="width:80px;" />
            </div>
          </div>`
        )
        .join("");
      editorEl.innerHTML = `
        <div class="field-row"><label>Recipe Name</label><input type="text" id="edProcName" value="${cur.RecipeName}" /></div>
        <div class="field-row"><label>PPID</label><input type="text" id="edProcPPID" value="${cur.PPID || ""}" /></div>
        ${stepsHtml}`;
    } else {
      const fields = cur.Fields || {};
      editorEl.innerHTML = Object.keys(fields)
        .map((k) => `<div class="field-row"><label>${k}</label><input type="text" data-rfield="${k}" value="${fields[k]}" /></div>`)
        .join("");
    }
  }

  function renderLogs() {
    const titleEl = document.getElementById("logViewTitle");
    titleEl.textContent = state.logTab === "Alarm" ? "Alarm Log" : "Full Log";
    document.getElementById("btnSortToggle").textContent = state.logDesc ? "DESC" : "ASC";

    const fLevel = document.getElementById("filterLevel").value;
    const fCat = document.getElementById("filterCategory").value;
    const fKw = document.getElementById("filterKeyword").value.trim().toLowerCase();

    let rows = state.logs.filter((l) => {
      if (!state.settings.ShowDebugLog && l.level === "DEBUG") return false;
      if (state.logTab === "Alarm" && l.category !== "Alarm" && l.level !== "WARN" && l.level !== "ERROR") return false;
      if (fLevel && l.level !== fLevel) return false;
      if (fCat && l.category !== fCat) return false;
      if (fKw && !l.message.toLowerCase().includes(fKw)) return false;
      return true;
    });

    if (state.logDesc) rows = [...rows].reverse();

    const tbody = document.getElementById("logTableBody");
    tbody.innerHTML = rows
      .map(
        (r) => `
      <tr class="${r.id === state.selectedLogId ? "selected" : ""}" data-lid="${r.id}">
        <td>${r.time}</td>
        <td>${r.category}</td>
        <td class="log-level-${r.level}">${r.level}</td>
        <td>${r.message}</td>
      </tr>`
      )
      .join("");

    tbody.querySelectorAll("tr").forEach((tr) => {
      tr.addEventListener("click", () => {
        state.selectedLogId = Number(tr.dataset.lid);
        renderLogs();
      });
    });

    const detailEl = document.getElementById("logDetailBody");
    const sel = state.logs.find((l) => l.id === state.selectedLogId);
    if (sel) {
      detailEl.innerHTML = `
        <tr><td>Time</td><td>${sel.time}</td></tr>
        <tr><td>Category</td><td>${sel.category}</td></tr>
        <tr><td>Level</td><td>${sel.level}</td></tr>
        <tr><td>Message</td><td>${sel.message}</td></tr>`;
    }
  }

  function renderSettings() {
    document.getElementById("setAccel").value = state.settings.Accel;
    document.getElementById("setDecel").value = state.settings.Decel;
    document.getElementById("setMaxVelo").value = state.settings.MaxVelo;
    document.getElementById("setVelo").value = state.settings.Velo;
    document.getElementById("setDoorInterlock").value = String(state.settings.DoorOpenInterlock);
    document.getElementById("setAlarmAutoStop").value = String(state.settings.AlarmAutoStop);
    document.getElementById("setAutoStopLevel").value = state.settings.AutoStopAlarmLevel;
    document.getElementById("setModeForceStop").value = String(state.settings.ModeChangeForceStop);
    document.getElementById("setCycleMs").value = state.settings.EtherCatReadCycleMs;
    document.getElementById("setRetry").value = state.settings.ReconnectRetryCount;
    document.getElementById("setTimeout").value = state.settings.ConnectionTimeoutMs;
    document.getElementById("setShowDebug").value = String(state.settings.ShowDebugLog);
    document.getElementById("setIdleLamp").value = state.settings.IdleLampStatus;
    document.getElementById("setRunLamp").value = state.settings.RunLampStatus;
    document.getElementById("setAlarmLamp").value = state.settings.AlarmLampStatus;
    document.getElementById("setMaintLamp").value = state.settings.MaintenanceLampStatus;
  }

  function renderAll() {
    renderTopBar();
    renderTower();
    if (state.mode === "Operate") renderOperate();
    if (state.mode === "Maint") renderMaint();
    if (state.mode === "Recipe") renderRecipes();
    if (state.mode === "Log") renderLogs();
    if (state.mode === "Setting") renderSettings();
  }

  function switchMode(nextMode) {
    if (nextMode === "Maint" && !ensureOperationAllowed()) return;
    if ((nextMode === "Recipe" || nextMode === "Setting") && !ensureAdminAllowed()) return;

    state.mode = nextMode;
    document.querySelectorAll(".mode-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.mode === nextMode);
    });
    document.querySelectorAll(".view-pane").forEach((p) => p.classList.remove("active"));
    document.getElementById(`view-${nextMode.toLowerCase()}`).classList.add("active");

    if (state.settings.ModeChangeForceStop && state.seq.running) {
      state.seq.running = false;
      clearInterval(simTimer);
      writeLog("INFO", "WARN", "Mode Change Force Stop에 의해 공정 정지");
    }

    applyTowerForMode();
    renderAll();
  }

  function openLoginModal() {
    document.getElementById("loginModal").classList.add("open");
  }

  function closeLoginModal() {
    document.getElementById("loginModal").classList.remove("open");
  }

  function loginAs(userId, password) {
    const acc = ACCOUNTS.find((a) => a.UserId === userId && a.Password === password);
    if (!acc) {
      showToast("아이디 또는 비밀번호가 일치하지 않습니다.");
      return false;
    }
    state.account = acc;
    writeLog("User", "INFO", `로그인: ${acc.UserId} (${acc.UserLevel})`);
    closeLoginModal();
    showToast(`${acc.UserId} (${acc.UserLevel}) 계정으로 로그인되었습니다.`);
    renderAll();
    return true;
  }

  function raiseAlarm(pmName, level, message) {
    state.activeAlarms.add(pmName);
    writeLog("Alarm", level, `${pmName} ${message}`);
    applyTowerForMode();
    if (state.settings.AlarmAutoStop && state.seq.running) {
      state.seq.paused = true;
      showToast(`알람 발생(${pmName})으로 공정이 일시 정지되었습니다.`);
    } else {
      showToast(`알람 발생: ${pmName} - ${message}`);
    }
    renderAll();
  }

  // Public helpers for inline maint onclicks
  window.sctApp = {
    manualDoor(pmName, open) {
      if (!ensureOperationAllowedForDoor(open)) return;
      state.pms[pmName].doorOpen = open;
      writeLog("Maint", "INFO", `${pmName} 도어 ${open ? "OPEN" : "CLOSE"} 완료`);
      renderAll();
    },
    manualLamp(pmName, on) {
      if (!ensureOperationAllowed()) return;
      state.pms[pmName].lampOn = on;
      state.pms[pmName].lampBlink = false;
      writeLog("Maint", "INFO", `${pmName} 램프 ${on ? "ON" : "OFF"} 완료`);
      renderAll();
    },
    manualTower(color, on) {
      if (!ensureOperationAllowed()) return;
      if (color === "all") {
        state.tower.red = state.tower.yellow = state.tower.green = on;
      } else {
        state.tower[color] = on;
      }
      writeLog("Maint", "INFO", `Tower Lamp ${color.toUpperCase()} ${on ? "ON" : "OFF"}`);
      renderTower();
    }
  };

  function ensureOperationAllowedForDoor(opening) {
    if (!state.account) {
      openLoginModal();
      return false;
    }
    if (!opening) return true; // closing door allowed even under DoorOpenInterlock
    return ensureOperationAllowed();
  }

  function bindEvents() {
    document.querySelectorAll(".mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => switchMode(btn.dataset.mode));
    });

    document.getElementById("btnQuickAdminLogin").addEventListener("click", () => loginAs("voliti", "1"));
    document.getElementById("btnToggleMockFault").addEventListener("click", () => {
      const pms = ["PM A", "PM B", "PM C"];
      const pick = pms[Math.floor(Math.random() * pms.length)];
      raiseAlarm(pick, "ERROR", "Chamber Pressure Deviation Detected");
    });

    document.getElementById("simSpeedSelect").addEventListener("change", (e) => {
      state.speed = Number(e.target.value);
      if (state.seq.running && !state.seq.paused) startSequenceLoop();
    });

    document.getElementById("btnModalCancel").addEventListener("click", closeLoginModal);
    document.getElementById("btnModalLogin").addEventListener("click", () => {
      loginAs(document.getElementById("modalUserId").value.trim(), document.getElementById("modalPassword").value.trim());
    });

    document.getElementById("btnReconnect").addEventListener("click", () => {
      if (!state.account) {
        openLoginModal();
        return;
      }
      state.connected = true;
      writeLog("INFO", "INFO", "EtherCAT 마스터 연결 성공 (Mock CIFX-50RE)");
      showToast("가상 EtherCAT 마스터 연결 완료");
      renderAll();
    });

    document.getElementById("btnAlarmReset").addEventListener("click", () => {
      state.axisFault = false;
      state.activeAlarms.clear();
      applyTowerForMode();
      writeLog("Alarm", "INFO", "Alarm Reset 완료: PM Alarm 및 Fault 해제");
      showToast("알람이 해제되었습니다.");
      renderAll();
    });

    // Operate buttons
    document.getElementById("processRecipeSelect").addEventListener("change", (e) => {
      state.selectedProcessName = e.target.value;
    });

    document.getElementById("btnStart").addEventListener("click", () => {
      if (!ensureOperationAllowed()) return;
      if (!state.foupA.some(Boolean)) {
        showToast("FOUP A에 웨이퍼가 없습니다. Initialize를 먼저 눌러주세요.");
        return;
      }
      const proc = state.recipes.Process.find((r) => r.RecipeName === state.selectedProcessName);
      if (!proc) return;
      state.seq.steps = buildAutoSequence(proc);
      state.seq.idx = 0;
      state.seq.running = true;
      state.seq.paused = false;
      applyTowerForMode();
      writeLog("INFO", "INFO", `자동 공정 시작: Process Recipe [${proc.RecipeName}]`);
      startSequenceLoop();
      renderAll();
    });

    document.getElementById("btnPause").addEventListener("click", () => {
      if (!state.seq.running) return;
      state.seq.paused = true;
      applyTowerForMode();
      writeLog("INFO", "WARN", "자동 공정 일시 정지 (Pause)");
      renderAll();
    });

    document.getElementById("btnContinue").addEventListener("click", () => {
      if (!state.seq.running || !ensureOperationAllowed()) return;
      state.seq.paused = false;
      applyTowerForMode();
      writeLog("INFO", "INFO", "자동 공정 재개 (Continue)");
      startSequenceLoop();
      renderAll();
    });

    document.getElementById("btnAbort").addEventListener("click", () => {
      if (!state.seq.running) return;
      state.seq.running = false;
      state.seq.paused = false;
      clearInterval(simTimer);
      simTimer = null;
      state.robot.cylForward = false;
      state.robot.cylBack = true;
      state.robot.hasWafer = false;
      moveRobotTo("FOUP A", 0);
      Object.keys(state.pms).forEach((k) => {
        state.pms[k].doorOpen = false;
        state.pms[k].lampOn = false;
        state.pms[k].lampBlink = false;
        state.pms[k].status = "idle";
        state.pms[k].msg = "Aborted";
      });
      applyTowerForMode();
      writeLog("Alarm", "WARN", "사용자 요청으로 자동 공정 중단(Abort) 및 안전 복귀");
      showToast("공정이 중단되고 안전 위치로 복귀했습니다.");
      renderAll();
    });

    document.getElementById("btnInitialize").addEventListener("click", () => {
      if (!ensureOperationAllowed()) return;
      state.foupA = [true, true, true, true, true];
      state.foupB = [false, false, false, false, false];
      state.robot = { ud: 0, lr: 13140, targetLr: 13140, cylForward: false, cylBack: true, hasWafer: false, vacuumOn: false };
      Object.keys(state.pms).forEach((k) => {
        state.pms[k] = { doorOpen: false, lampOn: false, lampBlink: false, hasWafer: false, recipe: "-", step: "-", rTime: "0 / 0", sTime: "0 / 0", stepNum: "0 / 0 step", msg: "Initialized", progress: 0, status: "idle" };
      });
      writeLog("INFO", "INFO", "장비 Initialize 완료 (FOUP A 5매 적재 / 원점 복귀)");
      showToast("장비 초기화 완료");
      renderAll();
    });

    // Maint buttons
    document.getElementById("btnCylFront").addEventListener("click", () => {
      if (!ensureOperationAllowed()) return;
      state.robot.cylForward = true;
      state.robot.cylBack = false;
      writeLog("Maint", "INFO", "Robot Cylinder Move Front");
      renderAll();
    });
    document.getElementById("btnCylBack").addEventListener("click", () => {
      if (!ensureOperationAllowed()) return;
      state.robot.cylForward = false;
      state.robot.cylBack = true;
      writeLog("Maint", "INFO", "Robot Cylinder Move Back");
      renderAll();
    });
    document.getElementById("btnServoOn").addEventListener("click", () => {
      state.servoOn = true;
      writeLog("Maint", "INFO", "Servo Motor ON");
      renderAll();
    });
    document.getElementById("btnServoOff").addEventListener("click", () => {
      state.servoOn = false;
      writeLog("Maint", "INFO", "Servo Motor OFF");
      renderAll();
    });
    document.getElementById("btnUDBasic").addEventListener("click", () => {
      if (!ensureOperationAllowed()) return;
      state.robot.ud = 0;
      renderAll();
    });
    document.getElementById("btnLRBasic").addEventListener("click", () => {
      if (!ensureOperationAllowed() || checkCylLock()) return;
      state.robot.lr = 0;
      renderAll();
    });

    const jogDist = () => Number(document.getElementById("inputJogDist").value) || 0;
    document.getElementById("btnJogUp").addEventListener("click", () => {
      if (!ensureOperationAllowed()) return;
      state.robot.ud += jogDist();
      checkSoftLimit();
      renderAll();
    });
    document.getElementById("btnJogDown").addEventListener("click", () => {
      if (!ensureOperationAllowed()) return;
      state.robot.ud -= jogDist();
      renderAll();
    });
    document.getElementById("btnJogLeft").addEventListener("click", () => {
      if (!ensureOperationAllowed() || checkCylLock()) return;
      state.robot.lr += jogDist();
      renderAll();
    });
    document.getElementById("btnJogRight").addEventListener("click", () => {
      if (!ensureOperationAllowed() || checkCylLock()) return;
      state.robot.lr -= jogDist();
      renderAll();
    });
    document.getElementById("btnUDMove").addEventListener("click", () => {
      if (!ensureOperationAllowed()) return;
      state.robot.ud = Number(document.getElementById("inputTargetPos").value) || 0;
      checkSoftLimit();
      renderAll();
    });
    document.getElementById("btnLRMove").addEventListener("click", () => {
      if (!ensureOperationAllowed() || checkCylLock()) return;
      state.robot.lr = Number(document.getElementById("inputTargetPos").value) || 0;
      renderAll();
    });
    document.getElementById("btnInOn").addEventListener("click", () => {
      if (!ensureOperationAllowed()) return;
      state.robot.vacuumOn = true;
      writeLog("Maint", "INFO", "Vacuum Inhalation ON");
    });
    document.getElementById("btnInOff").addEventListener("click", () => {
      state.robot.vacuumOn = false;
      writeLog("Maint", "INFO", "Vacuum Inhalation OFF");
    });
    document.getElementById("btnExOn").addEventListener("click", () => {
      if (!ensureOperationAllowed()) return;
      state.robot.vacuumOn = false;
      state.robot.hasWafer = false;
      writeLog("Maint", "INFO", "Vacuum Exhaust ON");
      renderAll();
    });
    document.getElementById("btnExOff").addEventListener("click", () => writeLog("Maint", "INFO", "Vacuum Exhaust OFF"));

    // Recipe tabs & CRUD
    document.querySelectorAll("[data-rtab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-rtab]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.recipeTab = btn.dataset.rtab;
        state.selectedRecipeIdx = 0;
        renderRecipes();
      });
    });

    document.getElementById("btnRecipeSave").addEventListener("click", () => {
      const items = state.recipes[state.recipeTab];
      const cur = items && items[state.selectedRecipeIdx];
      if (!cur) return;
      if (state.recipeTab === "Process") {
        cur.RecipeName = document.getElementById("edProcName").value.trim() || cur.RecipeName;
        cur.PPID = document.getElementById("edProcPPID").value.trim();
        document.querySelectorAll("[data-pstep]").forEach((inp) => {
          const i = Number(inp.dataset.pstep);
          const k = inp.dataset.pkey;
          cur.Steps[i][k] = k === "ProcessTime" ? Number(inp.value) || 5 : inp.value;
        });
      } else {
        document.querySelectorAll("[data-rfield]").forEach((inp) => {
          cur.Fields[inp.dataset.rfield] = inp.value;
        });
        cur.RecipeName = cur.Fields["Recipe Name"] || cur.RecipeName;
        cur.PPID = cur.Fields["PPID"] || cur.PPID;
      }
      saveStorage("sct_recipes_v1", state.recipes);
      writeLog("INFO", "INFO", `레시피 저장: ${cur.RecipeName}`);
      showToast("레시피가 저장되었습니다.");
      renderRecipes();
    });

    document.getElementById("btnRecipeNew").addEventListener("click", () => {
      const items = state.recipes[state.recipeTab];
      if (state.recipeTab === "Process") {
        items.push({ RecipeName: `Custom_${items.length + 1}`, PPID: `P_${items.length + 1}`, Steps: [{ StepNo: 1, Module: "PM A", RecipeName: "CVD_Low", ProcessTime: 8 }] });
      } else {
        const template = JSON.parse(JSON.stringify(items[0] || DEFAULT_RECIPES[state.recipeTab][0]));
        template.RecipeName = `${template.RecipeType}_New_${items.length + 1}`;
        template.Fields["Recipe Name"] = template.RecipeName;
        items.push(template);
      }
      state.selectedRecipeIdx = items.length - 1;
      saveStorage("sct_recipes_v1", state.recipes);
      renderRecipes();
    });

    document.getElementById("btnRecipeDelete").addEventListener("click", () => {
      const items = state.recipes[state.recipeTab];
      if (!items || items.length <= 1) {
        showToast("최소 1개 레시피는 유지해야 합니다.");
        return;
      }
      items.splice(state.selectedRecipeIdx, 1);
      state.selectedRecipeIdx = 0;
      saveStorage("sct_recipes_v1", state.recipes);
      renderRecipes();
    });

    document.getElementById("btnRecipeReset").addEventListener("click", () => {
      state.recipes = JSON.parse(JSON.stringify(DEFAULT_RECIPES));
      state.selectedRecipeIdx = 0;
      saveStorage("sct_recipes_v1", state.recipes);
      showToast("기본 레시피로 복원되었습니다.");
      renderRecipes();
    });

    // Log controls
    document.querySelectorAll("[data-ltab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-ltab]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.logTab = btn.dataset.ltab;
        renderLogs();
      });
    });
    document.getElementById("btnRandomAlarm").addEventListener("click", () => {
      const pms = ["PM A", "PM B", "PM C"];
      raiseAlarm(pms[Math.floor(Math.random() * 3)], "ERROR", "Random Demo Alarm Triggered");
    });
    document.getElementById("btnSortToggle").addEventListener("click", () => {
      state.logDesc = !state.logDesc;
      renderLogs();
    });
    document.getElementById("btnLogSearch").addEventListener("click", renderLogs);
    document.getElementById("btnLogClearFilter").addEventListener("click", () => {
      document.getElementById("filterLevel").value = "";
      document.getElementById("filterCategory").value = "";
      document.getElementById("filterKeyword").value = "";
      renderLogs();
    });
    document.getElementById("btnLogDelete").addEventListener("click", () => {
      if (!state.selectedLogId) return;
      state.logs = state.logs.filter((l) => l.id !== state.selectedLogId);
      state.selectedLogId = null;
      renderLogs();
    });
    document.getElementById("btnLogExport").addEventListener("click", () => {
      const csv = "Time,Category,Level,Message\n" + state.logs.map((l) => `"${l.time}","${l.category}","${l.level}","${l.message.replace(/"/g, '""')}"`).join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "SCT_Logs.csv";
      a.click();
    });

    // Setting controls
    document.getElementById("btnSettingApply").addEventListener("click", () => {
      state.settings.Accel = Number(document.getElementById("setAccel").value);
      state.settings.Decel = Number(document.getElementById("setDecel").value);
      state.settings.MaxVelo = Number(document.getElementById("setMaxVelo").value);
      state.settings.Velo = Number(document.getElementById("setVelo").value);
      state.settings.DoorOpenInterlock = document.getElementById("setDoorInterlock").value === "true";
      state.settings.AlarmAutoStop = document.getElementById("setAlarmAutoStop").value === "true";
      state.settings.AutoStopAlarmLevel = document.getElementById("setAutoStopLevel").value;
      state.settings.ModeChangeForceStop = document.getElementById("setModeForceStop").value === "true";
      state.settings.EtherCatReadCycleMs = Number(document.getElementById("setCycleMs").value);
      state.settings.ReconnectRetryCount = Number(document.getElementById("setRetry").value);
      state.settings.ConnectionTimeoutMs = Number(document.getElementById("setTimeout").value);
      state.settings.ShowDebugLog = document.getElementById("setShowDebug").value === "true";
      state.settings.IdleLampStatus = document.getElementById("setIdleLamp").value;
      state.settings.RunLampStatus = document.getElementById("setRunLamp").value;
      state.settings.AlarmLampStatus = document.getElementById("setAlarmLamp").value;
      state.settings.MaintenanceLampStatus = document.getElementById("setMaintLamp").value;
      saveStorage("sct_settings_v1", state.settings);
      applyTowerForMode();
      writeLog("INFO", "INFO", "장비 설정(Settings) 적용 완료");
      showToast("설정이 적용되었습니다.");
    });
    document.getElementById("btnSettingCancel").addEventListener("click", () => {
      renderSettings();
      showToast("변경 사항을 되돌렸습니다.");
    });
  }

  function checkCylLock() {
    if (state.robot.cylForward) {
      showToast("웨이퍼 이송 실린더가 전진되어 있어 좌우 이동할 수 없습니다.");
      return true;
    }
    return false;
  }

  function checkSoftLimit() {
    if (state.robot.ud > AXIS1_SOFT_LIMIT) {
      state.axisFault = true;
      raiseAlarm("PM A", "ERROR", `UD 축 상한 소프트 리밋(${AXIS1_SOFT_LIMIT}) 초과 -> 동작 차단`);
    }
  }

  // Init
  writeLog("INFO", "INFO", "EtherCAT 마스터 연결 성공 (Mock CIFX-50RE)");
  writeLog("INFO", "INFO", "시스템 초기화 완료 (초기 모드: Operate)");
  bindEvents();
  renderAll();
  setInterval(() => {
    const dt = nowStrings();
    document.getElementById("lblDate").textContent = dt.date;
    document.getElementById("lblTime").textContent = dt.time;
  }, 1000);
})();
