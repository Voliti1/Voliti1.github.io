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
    LogRetentionDays: 30,
    MaxDisplayLogCount: 5000,
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
        Fields: {
          "Recipe Name": "CVD_1",
          Description: "",
          "Process Time": "5",
          Temperature: "450",
          Pressure: "100",
          "Gas Flow": "100",
          "RF Power": "100",
          "Created By": "User",
          "Modified Date": "2026-07-07 09:20:32",
          "PP ID": "CVD_001"
        }
      },
      {
        PM: "PM A",
        RecipeType: "CVD",
        RecipeName: "CVD_Low",
        PPID: "CVD_002",
        Fields: {
          "Recipe Name": "CVD_Low",
          Description: "",
          "Process Time": "10",
          Temperature: "450",
          Pressure: "2.5",
          "Gas Flow": "100",
          "RF Power": "300",
          "Created By": "User",
          "Modified Date": "2026-07-04 19:11:34",
          "PP ID": "CVD_002"
        }
      }
    ],
    "PM B": [
      {
        PM: "PM B",
        RecipeType: "CMP",
        RecipeName: "CMP_Low",
        PPID: "CMP_002",
        Fields: {
          "Recipe Name": "CMP_Low",
          Description: "",
          "Process Time": "10",
          "Platen Speed": "50",
          "Carrier Speed": "45",
          "Down Force": "2.0",
          "Slurry Flow": "100",
          "Pad Type": "Soft",
          "Created By": "User",
          "PP ID": "CMP_002"
        }
      },
      {
        PM: "PM B",
        RecipeType: "CMP",
        RecipeName: "CMP_Medium",
        PPID: "CMP_001",
        Fields: {
          "Recipe Name": "CMP_Medium",
          Description: "",
          "Process Time": "45",
          "Platen Speed": "50",
          "Carrier Speed": "45",
          "Down Force": "2.0",
          "Slurry Flow": "100",
          "Pad Type": "Soft",
          "Created By": "User",
          "PP ID": "CMP_001"
        }
      }
    ],
    "PM C": [
      {
        PM: "PM C",
        RecipeType: "Cleaning",
        RecipeName: "Cleaning_Low",
        PPID: "Clean_002",
        Fields: {
          "Recipe Name": "Cleaning_Low",
          Description: "",
          "Process Time": "10",
          "Cleaning Mode": "DI",
          "DI Water Flow": "1.5",
          "Chemical Flow": "0",
          "Spin Speed": "800",
          "Dry Time": "5",
          "Created By": "User",
          "PP ID": "Clean_002"
        }
      },
      {
        PM: "PM C",
        RecipeType: "Cleaning",
        RecipeName: "Cleaning_Medium",
        PPID: "Clean_001",
        Fields: {
          "Recipe Name": "Cleaning_Medium",
          Description: "",
          "Process Time": "30",
          "Cleaning Mode": "DI",
          "DI Water Flow": "1.5",
          "Chemical Flow": "0",
          "Spin Speed": "800",
          "Dry Time": "10",
          "Created By": "User",
          "PP ID": "Clean_001"
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
    settings: loadStorage("sct_settings_v2", DEFAULT_SETTINGS),
    recipes: loadStorage("sct_recipes_v2", DEFAULT_RECIPES),
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
      cylForward: false,
      cylBack: true,
      hasWafer: false,
      vacuumOn: false
    },
    tower: { red: false, yellow: true, green: false },
    foupA: [true, true, true, true, true],
    foupB: [false, false, false, false, false],
    pms: {
      "PM A": { doorOpen: false, lampOn: false, lampBlink: false, hasWafer: false, recipe: "", step: "", rTime: "0 / 0", sTime: "0 / 0", stepNum: "0 / 0 step", msg: "", progress: 0, status: "idle" },
      "PM B": { doorOpen: false, lampOn: false, lampBlink: false, hasWafer: false, recipe: "", step: "", rTime: "0 / 0", sTime: "0 / 0", stepNum: "0 / 0 step", msg: "", progress: 0, status: "idle" },
      "PM C": { doorOpen: false, lampOn: false, lampBlink: false, hasWafer: false, recipe: "", step: "", rTime: "0 / 0", sTime: "0 / 0", stepNum: "0 / 0 step", msg: "", progress: 0, status: "idle" }
    },
    seq: {
      running: false,
      paused: false,
      steps: [],
      idx: 0
    }
  };

  let simTimer = null;

  function fitStage() {
    const vp = document.getElementById("stageViewport");
    const win = document.getElementById("winformsWindow");
    if (!vp || !win) return;
    const avail = vp.clientWidth;
    const scale = Math.min(1, avail / 1000);
    win.style.transform = `scale(${scale})`;
    vp.style.height = `${Math.ceil(850 * scale)}px`;
  }

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
      showToast("장비 동작을 하려면 로그인해주세요");
      openLoginModal();
      return false;
    }
    if (!state.connected) {
      showToast("EtherCAT 연결이 해제되어 있습니다. RECONNECT를 눌러주세요.");
      return false;
    }
    if (state.axisFault) {
      showToast("UD 축 위치 확인 실패로 장비 동작이 차단되었습니다. Alarm Reset 후 다시 시도하세요.");
      return false;
    }
    if (state.settings.DoorOpenInterlock) {
      const openPm = Object.keys(state.pms).find((k) => state.pms[k].doorOpen);
      if (openPm) {
        writeLog("Alarm", "WARN", `Door Open Interlock: ${openPm} 도어 열림으로 동작 차단`);
        showToast("Door Open Interlock 상태입니다. Chamber Door를 닫은 후 동작해주세요.");
        return false;
      }
    }
    return true;
  }

  function ensureAdminAllowed() {
    if (state.account && state.account.UserLevel === "Admin") return true;
    showToast("설정을 하려면 관리자 계정으로 로그인해주세요");
    openLoginModal();
    return false;
  }

  function moveRobotTo(targetName, ud) {
    const t = EQUIPMENT_TARGETS.find((x) => x.name === targetName);
    if (t) state.robot.lr = t.lr;
    if (typeof ud === "number") state.robot.ud = ud;
  }

  function buildAutoSequence(processRecipe) {
    const steps = [];
    const recipeSteps = processRecipe.Steps || [];
    if (!recipeSteps.length) return steps;
    const totalProcTime = recipeSteps.reduce((acc, s) => acc + Number(s.ProcessTime || 5), 0);

    for (let slot = 0; slot < 5; slot++) {
      const slotNum = slot + 1;
      const firstPm = recipeSteps[0].Module;

      steps.push({
        module: firstPm,
        desc: `${firstPm} load from FOUP A (slot ${slotNum})`,
        action: () => {
          moveRobotTo("FOUP A", FOUP_UD[slot]);
          state.robot.cylForward = true;
          state.robot.cylBack = false;
        }
      });
      steps.push({
        module: firstPm,
        desc: `FOUP A slot ${slotNum} pick`,
        action: () => {
          state.foupA[slot] = false;
          state.robot.hasWafer = true;
          state.robot.vacuumOn = true;
          state.robot.cylForward = false;
          state.robot.cylBack = true;
          writeLog("INFO", "INFO", `Auto Process: FOUP A slot ${slotNum} pick`);
        }
      });

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
          desc: `${mod} door open`,
          action: () => {
            moveRobotTo(mod, 1156931);
            state.pms[mod].doorOpen = true;
            state.pms[mod].recipe = pmMeta.recipe;
            state.pms[mod].step = pmMeta.stepName;
            state.pms[mod].stepNum = pmMeta.stepNum;
            state.pms[mod].status = "running";
            state.pms[mod].msg = `${mod} loading`;
          }
        });

        steps.push({
          module: mod,
          desc: `${mod} place & door close`,
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
          desc: `${mod} process running`
        });

        steps.push({
          module: mod,
          desc: `${mod} process complete`,
          action: () => {
            state.pms[mod].lampOn = false;
            state.pms[mod].lampBlink = true;
            state.pms[mod].doorOpen = true;
            state.pms[mod].hasWafer = false;
            state.robot.hasWafer = true;
            state.robot.vacuumOn = true;
            state.pms[mod].doorOpen = false;
            state.pms[mod].msg = "process complete";
            state.pms[mod].status = "idle";
            writeLog("INFO", "INFO", `Auto Process: ${mod} (${step.RecipeName}) 완료`);
          }
        });
      });

      const lastPm = recipeSteps[recipeSteps.length - 1].Module;
      steps.push({
        module: lastPm,
        desc: `${lastPm} unload to FOUP B (slot ${slotNum})`,
        action: () => {
          moveRobotTo("FOUP B", FOUP_UD[slot]);
          state.robot.cylForward = true;
          state.robot.cylBack = false;
          state.robot.hasWafer = false;
          state.robot.vacuumOn = false;
          state.foupB[slot] = true;
          state.robot.cylForward = false;
          state.robot.cylBack = true;
          writeLog("INFO", "INFO", `Auto Process: FOUP B slot ${slotNum} unload`);
        }
      });
    }
    return steps;
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
      const pct = Math.min(100, Math.round((step.elapsed / step.seconds) * 100));
      pm.sTime = `${step.elapsed} / ${step.seconds}`;
      pm.rTime = `${Math.min(step.meta.rTotal, step.elapsed)} / ${step.meta.rTotal}`;
      pm.progress = pct;
      pm.msg = `${mod} process running`;
      if (step.elapsed >= step.seconds) state.seq.idx += 1;
    } else {
      if (step.action) step.action();
      if (step.module && state.pms[step.module]) state.pms[step.module].msg = step.desc;
      state.seq.idx += 1;
    }
    renderAll();
    if (state.seq.idx >= state.seq.steps.length) finishSequence();
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
    writeLog("INFO", "INFO", "자동 공정 시퀀스(5슬롯) 완료");
    showToast("자동 공정 시퀀스(5매) 완료");
    renderAll();
  }

  function startSequenceLoop() {
    clearInterval(simTimer);
    simTimer = setInterval(stepSimulationTick, Math.max(150, Math.round(1000 / state.speed)));
  }

  function drawRobotCanvas() {
    const canvas = document.getElementById("robotCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

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
    const gripCenterY = state.robot.cylForward && !state.robot.cylBack ? -98 : -60;

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate((nearest.angle * Math.PI) / 180);

    ctx.fillStyle = "#eef1f6";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.fillRect(-14, -34, 28, 72);
    ctx.fillStyle = "#ced6e0";
    ctx.fillRect(3, -30, 8, 64);
    ctx.strokeRect(-14, -34, 28, 72);

    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(0, gripCenterY + 22);
    ctx.strokeStyle = isAligned ? "#2e8b57" : "#ff8c00";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, gripCenterY, 24, 0, Math.PI * 2);
    ctx.fillStyle = state.robot.hasWafer ? "#ffd700" : "#ffffff";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    ctx.stroke();

    ctx.restore();
  }

  function renderTopBar() {
    const dt = nowStrings();
    document.getElementById("lblDate").textContent = dt.date;
    document.getElementById("lblTime").textContent = dt.time;

    const connDot = document.getElementById("topConnDot");
    connDot.className = "wf-lbl conn-dot" + (state.connected ? " connected" : "");

    const pmDotIds = { "PM A": "topPmADot", "PM B": "topPmBDot", "PM C": "topPmCDot" };
    Object.keys(pmDotIds).forEach((pm) => {
      const el = document.getElementById(pmDotIds[pm]);
      el.style.color = state.activeAlarms.has(pm) ? "#ff0000" : state.pms[pm].status === "running" ? "#16a34a" : "#808080";
    });

    const loginSlot = document.getElementById("loginSlot");
    if (!state.account) {
      loginSlot.innerHTML = `
        <div class="pnl-login" id="loginTrigger">
          <div style="font-size:12px; font-weight:700;">ID</div>
          <div style="font-size:12px; font-weight:700;">PW</div>
          <div><input type="text" readonly /></div>
          <div><input type="password" readonly /></div>
        </div>`;
      document.getElementById("loginTrigger").addEventListener("click", openLoginModal);
    } else {
      loginSlot.innerHTML = `
        <div class="pnl-login-state">
          <div>Login ID</div>
          <div>Level</div>
          <div class="logout-cell"><button type="button" class="wf-btn" id="btnLogout" style="width:100%; height:100%; font-size:14px; font-weight:700;">Log Out</button></div>
          <div>${state.account.UserId}</div>
          <div>${state.account.UserLevel}</div>
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
    const sel = document.getElementById("processRecipeSelect");
    sel.innerHTML = state.recipes.Process.map((r) => `<option value="${r.RecipeName}" ${r.RecipeName === state.selectedProcessName ? "selected" : ""}>${r.RecipeName}</option>`).join("");

    [["PM A", "PMA"], ["PM B", "PMB"], ["PM C", "PMC"]].forEach(([key, suf]) => {
      const pm = state.pms[key];
      document.getElementById(`box${suf}`).className = "op-pm-box" + (pm.lampOn ? " lamp-on" : "") + (pm.lampBlink ? " lamp-blink" : "");
      document.getElementById(`head${suf}`).className = "op-pm-title" + (pm.doorOpen ? " door-open" : "");
      const wafer = document.getElementById(`wafer${suf}`);
      wafer.className = "op-wafer-circle" + (pm.hasWafer ? " has-wafer" : "");
      wafer.textContent = pm.hasWafer ? "Wafer" : "Empty";
    });

    document.getElementById("foupASlots").innerHTML = state.foupA.map((full) => `<div class="op-foup-slot ${full ? "full" : ""}"></div>`).join("");
    document.getElementById("foupBSlots").innerHTML = state.foupB.map((full) => `<div class="op-foup-slot ${full ? "full" : ""}"></div>`).join("");

    document.getElementById("btnStart").disabled = state.seq.running;
    document.getElementById("btnPause").disabled = !state.seq.running || state.seq.paused;
    document.getElementById("btnContinue").disabled = !state.seq.running || !state.seq.paused;
    document.getElementById("btnAbort").disabled = !state.seq.running;
    document.getElementById("btnInitialize").disabled = state.seq.running;

    const tops = { "PM A": 29, "PM B": 233, "PM C": 439 };
    const col = document.getElementById("pmInfoCol");
    col.innerHTML = ["PM A", "PM B", "PM C"]
      .map((name) => {
        const pm = state.pms[name];
        const dotColor = state.activeAlarms.has(name) ? "#ff0000" : pm.status === "running" ? "#16a34a" : "#808080";
        const doorTxt = pm.doorOpen ? "Door Open" : "Door Close";
        return `
        <div class="op-pm-info" style="top:${tops[name]}px; ${name === "PM C" ? "height:187px;" : ""}">
          <div class="op-pm-info-top">
            <span>${name}</span>
            <span style="font-size:16px; color:${pm.doorOpen ? "#b45309" : "#555"};">${doorTxt}</span>
            <span style="color:${dotColor};">●</span>
          </div>
          <div></div><div class="teal-hdr">RECIPE</div><div class="teal-hdr">STEP</div>
          <div>Name</div><div>${pm.recipe}</div><div>${pm.step}</div>
          <div>Time(sec)</div><div>${pm.rTime}</div><div>${pm.sTime}</div>
          <div>Message</div><div></div><div>${pm.stepNum}</div>
          <div class="msg-content">${pm.msg}</div>
          <div>Progress</div>
          <div class="prog-cell">
            <div class="op-prog-track"><div class="op-prog-fill" style="width:${pm.progress}%"></div></div>
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
      .map((r, i) => `<div class="recipe-row-item ${i === state.selectedRecipeIdx ? "active" : ""}" data-ridx="${i}"><span>${r.RecipeName}</span><span>${r.PPID || ""}</span></div>`)
      .join("");
    listEl.querySelectorAll(".recipe-row-item").forEach((el) => {
      el.addEventListener("click", () => {
        state.selectedRecipeIdx = Number(el.dataset.ridx);
        renderRecipes();
      });
    });

    const cur = items[state.selectedRecipeIdx];
    if (!cur) {
      editorEl.innerHTML = "";
      return;
    }

    if (state.recipeTab === "Process") {
      const stepsHtml = (cur.Steps || [])
        .map(
          (st, idx) => `
          <div class="r-lbl">Step ${idx + 1} (${st.Module})</div>
          <div class="r-inp-wrap" style="gap:4px;">
            <input type="text" data-pstep="${idx}" data-pkey="RecipeName" value="${st.RecipeName}" />
            <input type="number" data-pstep="${idx}" data-pkey="ProcessTime" value="${st.ProcessTime}" style="width:60px;" />
          </div>`
        )
        .join("");
      editorEl.innerHTML = `
        <div class="r-lbl">Recipe Name</div><div class="r-inp-wrap"><input type="text" id="edProcName" value="${cur.RecipeName}" /></div>
        <div class="r-lbl">PPID</div><div class="r-inp-wrap"><input type="text" id="edProcPPID" value="${cur.PPID || ""}" /></div>
        ${stepsHtml}`;
    } else {
      const fields = cur.Fields || {};
      editorEl.innerHTML = Object.keys(fields)
        .map((k) => `<div class="r-lbl">${k}</div><div class="r-inp-wrap"><input type="text" data-rfield="${k}" value="${fields[k]}" /></div>`)
        .join("");
    }
  }

  function renderLogs() {
    document.getElementById("logViewTitle").textContent = state.logTab === "Alarm" ? "Alarm Log" : "Full Log";
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
        <td style="text-align:center;">${r.time}</td>
        <td style="text-align:center;">${r.category}</td>
        <td style="text-align:center;" class="lvl-${r.level}">${r.level}</td>
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
        <tr><td style="text-align:center;">Time</td><td>${sel.time}</td></tr>
        <tr><td style="text-align:center;">Category</td><td>${sel.category}</td></tr>
        <tr><td style="text-align:center;">Level</td><td>${sel.level}</td></tr>
        <tr><td style="text-align:center;">Message</td><td>${sel.message}</td></tr>`;
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
    document.getElementById("setLogDays").value = state.settings.LogRetentionDays;
    document.getElementById("setMaxLogs").value = state.settings.MaxDisplayLogCount;
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
    writeLog("User", "INFO", `로그인: ${acc.UserId}`);
    closeLoginModal();
    showToast(`${acc.UserId} (${acc.UserLevel}) 로그인 완료`);
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

  function checkCylLock() {
    if (state.robot.cylForward) {
      showToast("웨이퍼 이송 실린더가 전진되어 있어 이동할 수 없습니다.");
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

  window.sctApp = {
    manualDoor(pmName, open) {
      if (!state.account) { openLoginModal(); return; }
      if (open && !ensureOperationAllowed()) return;
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
      if (color === "all") state.tower.red = state.tower.yellow = state.tower.green = on;
      else state.tower[color] = on;
      writeLog("Maint", "INFO", `Tower Lamp ${color.toUpperCase()} ${on ? "ON" : "OFF"}`);
      renderTower();
    },
    teachLR(pos, label) {
      if (!ensureOperationAllowed() || checkCylLock()) return;
      state.robot.lr = pos;
      writeLog("Maint", "INFO", `Position Teach: ${label} LR (${pos})`);
      renderAll();
    },
    teachUD(pos) {
      if (!ensureOperationAllowed()) return;
      state.robot.ud = pos;
      checkSoftLimit();
      writeLog("Maint", "INFO", `Position Teach: UD (${pos})`);
      renderAll();
    },
    demoNotice(msg) {
      showToast(msg);
    }
  };

  function bindEvents() {
    document.querySelectorAll(".mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => switchMode(btn.dataset.mode));
    });

    document.getElementById("btnQuickAdminLogin").addEventListener("click", () => loginAs("voliti", "1"));
    document.getElementById("btnToggleMockFault").addEventListener("click", () => {
      const pms = ["PM A", "PM B", "PM C"];
      raiseAlarm(pms[Math.floor(Math.random() * 3)], "ERROR", "Chamber Pressure Deviation Detected");
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
      if (!ensureOperationAllowed()) return;
      state.connected = true;
      writeLog("INFO", "INFO", "EtherCAT 마스터 연결 성공 (Mock CIFX-50RE)");
      showToast("가상 EtherCAT 마스터 연결 완료");
      renderAll();
    });

    document.getElementById("btnAlarmReset").addEventListener("click", () => {
      state.axisFault = false;
      state.activeAlarms.clear();
      applyTowerForMode();
      writeLog("Alarm", "INFO", "Alarm Reset 완료: PM Alarm 표시 해제");
      showToast("알람이 해제되었습니다.");
      renderAll();
    });

    document.getElementById("processRecipeSelect").addEventListener("change", (e) => {
      state.selectedProcessName = e.target.value;
    });

    document.getElementById("btnStart").addEventListener("click", () => {
      if (!ensureOperationAllowed()) return;
      if (!state.foupA.some(Boolean)) {
        showToast("FOUP A에 웨이퍼가 없습니다. Initialize를 눌러주세요.");
        return;
      }
      const proc = state.recipes.Process.find((r) => r.RecipeName === state.selectedProcessName);
      if (!proc) return;
      state.seq.steps = buildAutoSequence(proc);
      state.seq.idx = 0;
      state.seq.running = true;
      state.seq.paused = false;
      applyTowerForMode();
      writeLog("INFO", "INFO", `자동 공정 시작: ${proc.RecipeName}`);
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
      writeLog("Alarm", "WARN", "사용자 요청으로 자동 공정 Abort");
      renderAll();
    });

    document.getElementById("btnInitialize").addEventListener("click", () => {
      if (!ensureOperationAllowed()) return;
      state.foupA = [true, true, true, true, true];
      state.foupB = [false, false, false, false, false];
      state.robot = { ud: 0, lr: 13140, cylForward: false, cylBack: true, hasWafer: false, vacuumOn: false };
      Object.keys(state.pms).forEach((k) => {
        state.pms[k] = { doorOpen: false, lampOn: false, lampBlink: false, hasWafer: false, recipe: "", step: "", rTime: "0 / 0", sTime: "0 / 0", stepNum: "0 / 0 step", msg: "", progress: 0, status: "idle" };
      });
      writeLog("INFO", "INFO", "Initialize 완료");
      renderAll();
    });

    // Maint
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
    document.getElementById("btnServoOn").addEventListener("click", () => { state.servoOn = true; renderAll(); });
    document.getElementById("btnServoOff").addEventListener("click", () => { state.servoOn = false; renderAll(); });
    document.getElementById("btnUDBasic").addEventListener("click", () => { if (!ensureOperationAllowed()) return; state.robot.ud = 0; renderAll(); });
    document.getElementById("btnLRBasic").addEventListener("click", () => { if (!ensureOperationAllowed() || checkCylLock()) return; state.robot.lr = 0; renderAll(); });

    const jogDist = () => Number(document.getElementById("inputJogDist").value) || 0;
    document.getElementById("btnJogUp").addEventListener("click", () => { if (!ensureOperationAllowed()) return; state.robot.ud += jogDist(); checkSoftLimit(); renderAll(); });
    document.getElementById("btnJogDown").addEventListener("click", () => { if (!ensureOperationAllowed()) return; state.robot.ud -= jogDist(); renderAll(); });
    document.getElementById("btnJogLeft").addEventListener("click", () => { if (!ensureOperationAllowed() || checkCylLock()) return; state.robot.lr += jogDist(); renderAll(); });
    document.getElementById("btnJogRight").addEventListener("click", () => { if (!ensureOperationAllowed() || checkCylLock()) return; state.robot.lr -= jogDist(); renderAll(); });
    document.getElementById("btnUDMove").addEventListener("click", () => { if (!ensureOperationAllowed()) return; state.robot.ud = Number(document.getElementById("inputTargetPos").value) || 0; checkSoftLimit(); renderAll(); });
    document.getElementById("btnLRMove").addEventListener("click", () => { if (!ensureOperationAllowed() || checkCylLock()) return; state.robot.lr = Number(document.getElementById("inputTargetPos").value) || 0; renderAll(); });
    document.getElementById("btnInOn").addEventListener("click", () => { if (!ensureOperationAllowed()) return; state.robot.vacuumOn = true; writeLog("Maint", "INFO", "Inhalation ON"); });
    document.getElementById("btnInOff").addEventListener("click", () => { state.robot.vacuumOn = false; writeLog("Maint", "INFO", "Inhalation OFF"); });
    document.getElementById("btnExOn").addEventListener("click", () => { if (!ensureOperationAllowed()) return; state.robot.vacuumOn = false; state.robot.hasWafer = false; writeLog("Maint", "INFO", "Exhaust ON"); renderAll(); });
    document.getElementById("btnExOff").addEventListener("click", () => writeLog("Maint", "INFO", "Exhaust OFF"));

    // Recipe
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
        cur.PPID = cur.Fields["PP ID"] || cur.PPID;
      }
      saveStorage("sct_recipes_v2", state.recipes);
      writeLog("INFO", "INFO", `레시피 저장: ${cur.RecipeName}`);
      showToast("레시피 저장 완료");
      renderRecipes();
    });

    document.getElementById("btnRecipeSaveAs").addEventListener("click", () => {
      const items = state.recipes[state.recipeTab];
      const cur = items && items[state.selectedRecipeIdx];
      if (!cur) return;
      const copy = JSON.parse(JSON.stringify(cur));
      copy.RecipeName = `${cur.RecipeName}_Copy`;
      if (copy.Fields) copy.Fields["Recipe Name"] = copy.RecipeName;
      items.push(copy);
      state.selectedRecipeIdx = items.length - 1;
      saveStorage("sct_recipes_v2", state.recipes);
      showToast(`다른 이름으로 저장: ${copy.RecipeName}`);
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
      saveStorage("sct_recipes_v2", state.recipes);
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
      saveStorage("sct_recipes_v2", state.recipes);
      renderRecipes();
    });

    document.getElementById("btnRecipeOpenFolder").addEventListener("click", () => {
      showToast("웹 시뮬레이터 환경: 레시피는 브라우저 localStorage(data/Recipe 구조)에 저장됩니다.");
    });

    // Log
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
      raiseAlarm(pms[Math.floor(Math.random() * 3)], "ERROR", "Random Alarm Triggered");
    });
    document.getElementById("btnSortToggle").addEventListener("click", () => { state.logDesc = !state.logDesc; renderLogs(); });
    document.getElementById("btnSelectMode").addEventListener("click", () => showToast("단일 행 클릭으로 상세 로그를 확인할 수 있습니다."));
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

    // Setting
    document.getElementById("btnParamSet").addEventListener("click", () => {
      state.settings.Accel = Number(document.getElementById("setAccel").value);
      state.settings.Decel = Number(document.getElementById("setDecel").value);
      state.settings.MaxVelo = Number(document.getElementById("setMaxVelo").value);
      state.settings.Velo = Number(document.getElementById("setVelo").value);
      saveStorage("sct_settings_v2", state.settings);
      showToast("Robot Parameter 적용 완료");
    });
    document.getElementById("btnOpenRecipeFolderSetting").addEventListener("click", () => {
      showToast("웹 시뮬레이터 환경: data\\Recipe 가상 경로 사용 중");
    });
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
      state.settings.LogRetentionDays = Number(document.getElementById("setLogDays").value);
      state.settings.MaxDisplayLogCount = Number(document.getElementById("setMaxLogs").value);
      state.settings.ShowDebugLog = document.getElementById("setShowDebug").value === "true";
      state.settings.IdleLampStatus = document.getElementById("setIdleLamp").value;
      state.settings.RunLampStatus = document.getElementById("setRunLamp").value;
      state.settings.AlarmLampStatus = document.getElementById("setAlarmLamp").value;
      state.settings.MaintenanceLampStatus = document.getElementById("setMaintLamp").value;
      saveStorage("sct_settings_v2", state.settings);
      applyTowerForMode();
      writeLog("INFO", "INFO", "장비 설정(Settings) 적용 완료");
      showToast("설정이 적용되었습니다.");
    });
    document.getElementById("btnSettingCancel").addEventListener("click", () => {
      renderSettings();
      showToast("변경 사항을 되돌렸습니다.");
    });

    window.addEventListener("resize", fitStage);
  }

  writeLog("INFO", "INFO", "EtherCAT 마스터 연결 성공 (Mock CIFX-50RE)");
  writeLog("INFO", "INFO", "시스템 초기화 완료 (초기 모드: AUTO)");
  bindEvents();
  renderAll();
  fitStage();
  setInterval(() => {
    const dt = nowStrings();
    document.getElementById("lblDate").textContent = dt.date;
    document.getElementById("lblTime").textContent = dt.time;
  }, 1000);
})();
