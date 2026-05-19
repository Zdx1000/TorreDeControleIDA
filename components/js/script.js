(() => {
    "use strict";

    const SECTORS_BASE = [
    { setor: "10", descricao: "10 FRAC.HIG./BELEZ./AER.", meta: 59 },
    { setor: "11", descricao: "11 FRAC.HIG./BELEZ./TINT.", meta: 76 },
    { setor: "12", descricao: "12 FRAC.CALCADOS", meta: 112 },
    { setor: "13", descricao: "13 FRAC.MARTCOM/BOMBONIER", meta: 84 },
    { setor: "14", descricao: "14 FRAC.ALIMENTOS/BEBIDAS", meta: 93 },
    { setor: "15", descricao: "15 FRAC.PET", meta: 82 },
    { setor: "20", descricao: "20 ARM. E 20", meta: 30 },
    { setor: "21", descricao: "21 CARGA GROSSA", meta: 45 },
    { setor: "39", descricao: "39 MOD.A", meta: 42 },
    { setor: "44", descricao: "44 MOD.B", meta: 64 },
    { setor: "50", descricao: "50 ARM. ESPECIAL", meta: 0 },
    { setor: "52", descricao: "52 CARGA GROSSA 2", meta: 23 },
    { setor: "53", descricao: "53 CARGA GROSSA 3", meta: 184 },
    { setor: "58", descricao: "58 CARGA GROSSA 4", meta: 60 },
    { setor: "60", descricao: "60 CARGA GROSSA 5", meta: 68 },
    { setor: "ARMI-2", descricao: "ARMI-2 FRACIONADO", meta: 0 },
    { setor: "ARMI-3", descricao: "ARMI-3 FRACIONADO", meta: 0 },
    { setor: "ARMFRAC", descricao: "ARMFRAC FRACIONADO", meta: 0 },
    { setor: "SETOR24", descricao: "SETOR24 APOIO", meta: 0 }
    ];

    const SIM_START_MINUTES = 5 * 60;

    const state = {
    sectors: [],
    running: true,
    timerId: null,
    searchTerm: "",
    sortKey: "setor",
    sortDir: "asc",
    startMinutesRef: SIM_START_MINUTES,
    simulatedMinutes: SIM_START_MINUTES,
    secondsPerProdHour: 60,
    chartFilter: "todos",
    demandDifficulty: "random",
    timelineHorizon: "120",
    timelineRateMode: "avg",
    productionHistory: [],
    timelineHistoryChart: null,
    timelineHistoryExpanded: false,
    timelineHistorySector: "__total__",
    timelineHistoryWindowMinutes: 60,
    timelineHistoryMode: "accumulated",
    timelineStatusTolerancePct: 0.05,
    timelineTooltipContext: null,
    config: {
        workStartMin: 5 * 60,
        workEndMin: 14 * 60,
        lunchStartMin: 11 * 60 + 30,
        lunchEndMin: 12 * 60 + 30,
        distribution: {
        fracionado: 40,
        cargaGrossa: 45,
        arm20: 15
        },
        demandOverrides: {},
        simulation: {
        lphWindowMinutes: 60,
        ewmaAlpha: 0.20,
        warmupMinutes: 22,
        postLunchMinutes: 14,
        fatigueWindowMinutes: 60,
        fatigueDrop: 0.04,
        endSprintMinutes: 20,
        endSprintBoost: 0.04,
        stopProbPerMin: 0.012,
        cv: 0.09,
        forecastCurrentWeight: 0.60,
        demandVeryEasyMin: 10000,
        demandVeryEasyMax: 13000,
        demandEasyMin: 13000,
        demandEasyMax: 18000,
        demandMediumMin: 18000,
        demandMediumMax: 24000,
        demandHardMin: 24000,
        demandHardMax: 30000,
        demandVeryHardMin: 30000,
        demandVeryHardMax: 36000,
        demandRandomEasyWeight: 55,
        demandRandomVeryEasyWeight: 25,
        demandRandomMediumWeight: 15,
        demandRandomHardWeight: 4,
        demandRandomVeryHardWeight: 1,
        capacityMinPerShift: 24000,
        capacityMaxPerShift: 31000,
        calmScenarioLimit: 24000
        }
    }
    };

    const ui = {
    kpiSetores: document.getElementById("kpiSetores"),
    kpiSeparadas: document.getElementById("kpiSeparadas"),
    kpiRestantes: document.getElementById("kpiRestantes"),
    kpiPct: document.getElementById("kpiPct"),
    tableBody: document.getElementById("tableBody"),
    searchInput: document.getElementById("searchInput"),
    timestamp: document.getElementById("timestamp"),
    ring: document.getElementById("progressRing"),
    ringText: document.getElementById("ringText"),
    simPanel: document.querySelector(".sim-panel"),
    configToggleBtn: document.getElementById("configToggleBtn"),
    configToggleLabel: document.getElementById("configToggleLabel"),
    simClock: document.getElementById("simClock"),
    speedLabel: document.getElementById("speedLabel"),
    hourRef: document.getElementById("hourRef"),
    timelineHorizonSelect: document.getElementById("timelineHorizonSelect"),
    timelineRateModeSelect: document.getElementById("timelineRateModeSelect"),
    timelinePastValue: document.getElementById("timelinePastValue"),
    timelinePastSub: document.getElementById("timelinePastSub"),
    timelineNowValue: document.getElementById("timelineNowValue"),
    timelineNowSub: document.getElementById("timelineNowSub"),
    timelineFutureValue: document.getElementById("timelineFutureValue"),
    timelineFutureSub: document.getElementById("timelineFutureSub"),
    timelineEtaValue: document.getElementById("timelineEtaValue"),
    timelineEtaSub: document.getElementById("timelineEtaSub"),
    timelinePastSegment: document.getElementById("timelinePastSegment"),
    timelineFutureSegment: document.getElementById("timelineFutureSegment"),
    timelineNowMarker: document.getElementById("timelineNowMarker"),
    timelineCompletionMarker: document.getElementById("timelineCompletionMarker"),
    timelineStartLabel: document.getElementById("timelineStartLabel"),
    timelineCurrentLabel: document.getElementById("timelineCurrentLabel"),
    timelineEndLabel: document.getElementById("timelineEndLabel"),
    timelineRealProgress: document.getElementById("timelineRealProgress"),
    timelineProjectedProgress: document.getElementById("timelineProjectedProgress"),
    timelineHistoryCard: document.getElementById("timelineHistoryCard"),
    timelineHistoryToggleBtn: document.getElementById("timelineHistoryToggleBtn"),
    timelineSummaryStatus: document.getElementById("timelineSummaryStatus"),
    timelineSummaryStatusSub: document.getElementById("timelineSummaryStatusSub"),
    timelineSummaryAvg: document.getElementById("timelineSummaryAvg"),
    timelineSummaryAvgSub: document.getElementById("timelineSummaryAvgSub"),
    timelineSummaryEta: document.getElementById("timelineSummaryEta"),
    timelineSummaryEtaSub: document.getElementById("timelineSummaryEtaSub"),
    timelineHistoryExpanded: document.getElementById("timelineHistoryExpanded"),
    timelineHistorySectorSelect: document.getElementById("timelineHistorySectorSelect"),
    timelineHistoryWindowSelect: document.getElementById("timelineHistoryWindowSelect"),
    timelineHistoryModeSelect: document.getElementById("timelineHistoryModeSelect"),
    timelineStatusToleranceSelect: document.getElementById("timelineStatusToleranceSelect"),
    timelineKpiDeltaValue: document.getElementById("timelineKpiDeltaValue"),
    timelineKpiDeltaSub: document.getElementById("timelineKpiDeltaSub"),
    timelineKpiRatesValue: document.getElementById("timelineKpiRatesValue"),
    timelineKpiRatesSub: document.getElementById("timelineKpiRatesSub"),
    timelineKpiForecastValue: document.getElementById("timelineKpiForecastValue"),
    timelineKpiForecastSub: document.getElementById("timelineKpiForecastSub"),
    timelineHistoryCanvas: document.getElementById("timelineHistoryCanvas"),
    timelineHistoryTooltip: document.getElementById("timelineHistoryTooltip"),
    speedSelect: document.getElementById("speedSelect"),
    runPauseBtn: document.getElementById("runPauseBtn"),
    resetBtn: document.getElementById("resetBtn"),
    shiftStatus: document.getElementById("shiftStatus"),
    workStartInput: document.getElementById("workStartInput"),
    workEndInput: document.getElementById("workEndInput"),
    lunchStartInput: document.getElementById("lunchStartInput"),
    lunchEndInput: document.getElementById("lunchEndInput"),
    distFracInput: document.getElementById("distFracInput"),
    distGrossaInput: document.getElementById("distGrossaInput"),
    distArmInput: document.getElementById("distArmInput"),
    distTotalLabel: document.getElementById("distTotalLabel"),
    applyDistBtn: document.getElementById("applyDistBtn"),
    difficultySelect: document.getElementById("difficultySelect"),
    demandSectorSelect: document.getElementById("demandSectorSelect"),
    demandValueInput: document.getElementById("demandValueInput"),
    applyDemandBtn: document.getElementById("applyDemandBtn"),
    clearDemandBtn: document.getElementById("clearDemandBtn"),
    demandStatus: document.getElementById("demandStatus"),
    chartBtn: document.getElementById("chartBtn"),
    chartModal: document.getElementById("chartModal"),
    closeChart: document.getElementById("closeChart"),
    chartList: document.getElementById("chartList"),
    filterButtons: Array.from(document.querySelectorAll(".f-btn")),
    detailModal: document.getElementById("detailModal"),
    closeDetail: document.getElementById("closeDetail"),
    detailTitle: document.getElementById("detailTitle"),
    detailSubtitle: document.getElementById("detailSubtitle"),
    detailSummary: document.getElementById("detailSummary"),
    detailThead: document.getElementById("detailThead"),
    detailTbody: document.getElementById("detailTbody"),
    sortHeaders: Array.from(document.querySelectorAll("th[data-sort]")),
    statCards: Array.from(document.querySelectorAll(".stat-card"))
    };

    const tableRowsBySector = new Map();
    let renderFrameId = null;
    const BADGE_STATUS_CLASSES = ["status-high", "status-medium", "status-low", "status-meta"];
    const DOT_STATUS_CLASSES = ["dot-high", "dot-medium", "dot-low", "dot-meta"];
    const KPI_TONE_CLASSES = ["kpi-tone-ok", "kpi-tone-warn", "kpi-tone-critical", "kpi-tone-off"];
    const PROD_STATE_OFF = "OFF";
    const PROD_STATE_BREAK = "BREAK";
    const PROD_STATE_DOWNTIME = "DOWNTIME";
    const PROD_STATE_WORK = "WORK";
    const PROD_STATE_DONE = "DONE";
    let timelineHistoryPluginsRegistered = false;

    const timelineLunchPlugin = {
    id: "timelineLunchBands",
    beforeDatasetsDraw(chart, _args, pluginOptions) {
        const segments = pluginOptions && Array.isArray(pluginOptions.segments)
        ? pluginOptions.segments
        : [];
        if (!segments.length) return;

        const { ctx, chartArea, scales } = chart;
        const xScale = scales.x;
        if (!ctx || !chartArea || !xScale) return;

        ctx.save();
        segments.forEach((segment) => {
        const left = xScale.getPixelForValue(segment.start);
        const right = xScale.getPixelForValue(segment.end);
        const width = Math.max(right - left, 1);
        ctx.fillStyle = "rgba(245, 158, 11, 0.14)";
        ctx.fillRect(left, chartArea.top, width, chartArea.bottom - chartArea.top);
        ctx.strokeStyle = "rgba(217, 119, 6, 0.35)";
        ctx.lineWidth = 1;
        ctx.strokeRect(left, chartArea.top, width, chartArea.bottom - chartArea.top);

        if (width >= 44 && segment.label) {
            ctx.fillStyle = "rgba(146, 64, 14, 0.92)";
            ctx.font = "700 10px Segoe UI";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
            String(segment.label),
            left + (width / 2),
            chartArea.top + 12
            );
        }
        });
        ctx.restore();
    }
    };

    const timelineNowMarkerPlugin = {
    id: "timelineNowMarker",
    afterDatasetsDraw(chart, _args, pluginOptions) {
        const nowMinute = Number(pluginOptions && pluginOptions.nowMinute);
        if (!Number.isFinite(nowMinute)) return;

        const { ctx, chartArea, scales } = chart;
        const xScale = scales.x;
        if (!ctx || !chartArea || !xScale) return;

        const x = xScale.getPixelForValue(nowMinute);
        if (!Number.isFinite(x)) return;

        ctx.save();
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 1.6;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(x, chartArea.top);
        ctx.lineTo(x, chartArea.bottom);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.fillStyle = "#0f172a";
        ctx.font = "700 10px Segoe UI";
        ctx.textAlign = "center";
        ctx.fillText("Agora", x, Math.max(chartArea.top + 10, 12));
        ctx.restore();
    }
    };

    const timelineHoverFocusPlugin = {
    id: "timelineHoverFocus",
    afterDatasetsDraw(chart, _args, pluginOptions) {
        const xValue = Number(pluginOptions && pluginOptions.xValue);
        if (!Number.isFinite(xValue)) return;

        const { ctx, chartArea, scales } = chart;
        const xScale = scales.x;
        if (!ctx || !chartArea || !xScale) return;

        const x = xScale.getPixelForValue(xValue);
        if (!Number.isFinite(x)) return;

        ctx.save();
        ctx.fillStyle = "rgba(8, 145, 178, 0.08)";
        ctx.fillRect(
        x - 8,
        chartArea.top,
        16,
        chartArea.bottom - chartArea.top
        );
        ctx.strokeStyle = "rgba(15, 118, 110, 0.55)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, chartArea.top);
        ctx.lineTo(x, chartArea.bottom);
        ctx.stroke();
        ctx.restore();
    }
    };

    init();

    function init() {
    populateDemandSectorSelect();
    syncConfigInputsFromState();
    ui.timelineHorizonSelect.value = state.timelineHorizon;
    ui.timelineRateModeSelect.value = state.timelineRateMode;
    ui.timelineHistoryWindowSelect.value = String(state.timelineHistoryWindowMinutes);
    ui.timelineHistoryModeSelect.value = state.timelineHistoryMode;
    ui.timelineStatusToleranceSelect.value = String(state.timelineStatusTolerancePct);
    ui.difficultySelect.value = state.demandDifficulty;
    applyTimelineHistoryExpandedState();
    ensureTimelineHistoryChart();
    resetSimulation(true);
    bindEvents();
    setSimPanelCollapsed(false);
    startTimer();
    }

    function bindEvents() {
    ui.searchInput.addEventListener("input", (event) => {
        state.searchTerm = (event.target.value || "").trim().toLowerCase();
        renderAll();
    });

    ui.speedSelect.addEventListener("change", (event) => {
        state.secondsPerProdHour = Number(event.target.value) || 60;
        updateSpeedLabel();
    });

    ui.timelineHorizonSelect.addEventListener("change", (event) => {
        state.timelineHorizon = String(event.target.value || "120");
        requestRender();
    });

    ui.timelineRateModeSelect.addEventListener("change", (event) => {
        state.timelineRateMode = String(event.target.value || "avg");
        requestRender();
    });

    ui.timelineHistoryToggleBtn.addEventListener("click", () => {
        state.timelineHistoryExpanded = !state.timelineHistoryExpanded;
        applyTimelineHistoryExpandedState();
        requestRender();
    });

    ui.timelineHistorySectorSelect.addEventListener("change", (event) => {
        state.timelineHistorySector = String(event.target.value || "__total__");
        requestRender();
    });

    ui.timelineHistoryWindowSelect.addEventListener("change", (event) => {
        state.timelineHistoryWindowMinutes = Math.max(10, Number(event.target.value) || 60);
        requestRender();
    });

    ui.timelineHistoryModeSelect.addEventListener("change", (event) => {
        state.timelineHistoryMode = String(event.target.value || "accumulated");
        requestRender();
    });

    ui.timelineStatusToleranceSelect.addEventListener("change", (event) => {
        state.timelineStatusTolerancePct = clamp(Number(event.target.value) || 0.05, 0.01, 0.3);
        requestRender();
    });

    ui.runPauseBtn.addEventListener("click", toggleRunPause);
    ui.resetBtn.addEventListener("click", () => resetSimulation(false));
    ui.configToggleBtn.addEventListener("click", toggleSimPanel);

    ui.workStartInput.addEventListener("change", () => {
        state.config.workStartMin = parseTimeToMinutes(ui.workStartInput.value, state.config.workStartMin);
        requestRender();
    });

    ui.workEndInput.addEventListener("change", () => {
        state.config.workEndMin = parseTimeToMinutes(ui.workEndInput.value, state.config.workEndMin);
        requestRender();
    });

    ui.lunchStartInput.addEventListener("change", () => {
        state.config.lunchStartMin = parseTimeToMinutes(ui.lunchStartInput.value, state.config.lunchStartMin);
        requestRender();
    });

    ui.lunchEndInput.addEventListener("change", () => {
        state.config.lunchEndMin = parseTimeToMinutes(ui.lunchEndInput.value, state.config.lunchEndMin);
        requestRender();
    });

    ui.applyDistBtn.addEventListener("click", () => {
        applyDistributionConfig();
        resetSimulation(false);
    });

    [ui.distFracInput, ui.distGrossaInput, ui.distArmInput].forEach((input) => {
        input.addEventListener("input", updateDistributionTotalLabel);
    });

    ui.difficultySelect.addEventListener("change", (event) => {
        const selected = String(event.target.value || "random");
        if (isAnyDemandOverrideActive()) {
        ui.difficultySelect.value = state.demandDifficulty;
        setConfigFeedback("Override ativo: dificuldade nao altera demanda.");
        updateDemandStatus(ui.demandSectorSelect.value);
        return;
        }
        state.demandDifficulty = selected;
        resetSimulation(false);
    });

    ui.applyDemandBtn.addEventListener("click", () => {
        const setor = ui.demandSectorSelect.value;
        const value = Math.max(0, Math.round(Number(ui.demandValueInput.value) || 0));
        if (!setor || value <= 0) {
        setConfigFeedback("Informe setor e demanda valida.");
        return;
        }
        state.config.demandOverrides[setor] = value;
        updateDemandStatus(setor);
        resetSimulation(false);
    });

    ui.clearDemandBtn.addEventListener("click", () => {
        const setor = ui.demandSectorSelect.value;
        if (!setor) return;
        delete state.config.demandOverrides[setor];
        updateDemandStatus(setor);
        resetSimulation(false);
    });

    ui.demandSectorSelect.addEventListener("change", () => {
        updateDemandStatus(ui.demandSectorSelect.value);
    });

    ui.sortHeaders.forEach((header) => {
        header.addEventListener("click", () => {
        const key = header.dataset.sort;
        if (state.sortKey === key) {
            state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        } else {
            state.sortKey = key;
            state.sortDir = "asc";
        }
        renderAll();
        });
    });

    ui.chartBtn.addEventListener("click", () => {
        ui.chartModal.classList.add("show");
        renderChart();
    });

    ui.closeChart.addEventListener("click", () => ui.chartModal.classList.remove("show"));
    ui.chartModal.addEventListener("click", (event) => {
        if (event.target === ui.chartModal) ui.chartModal.classList.remove("show");
    });

    ui.filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
        ui.filterButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        state.chartFilter = button.dataset.filter;
        renderChart();
        });
    });

    ui.statCards.forEach((card) => {
        card.addEventListener("click", () => {
        const detailType = card.dataset.detail;
        openDetailModal(detailType);
        });
    });

    ui.closeDetail.addEventListener("click", () => ui.detailModal.classList.remove("show"));
    ui.detailModal.addEventListener("click", (event) => {
        if (event.target === ui.detailModal) ui.detailModal.classList.remove("show");
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
        ui.chartModal.classList.remove("show");
        ui.detailModal.classList.remove("show");
        }
    });

    ui.timelineHistoryCanvas.addEventListener("mouseleave", () => {
        if (ui.timelineHistoryTooltip) {
        ui.timelineHistoryTooltip.classList.remove("show");
        }

        const chart = state.timelineHistoryChart;
        if (chart && chart.options && chart.options.plugins && chart.options.plugins.timelineHoverFocus) {
        chart.options.plugins.timelineHoverFocus.xValue = null;
        chart.draw();
        }
    });
    }

    function toggleRunPause() {
    state.running = !state.running;
    ui.runPauseBtn.textContent = state.running ? "Pausar" : "Retomar";
    }

    function toggleSimPanel() {
    const collapsed = !ui.simPanel.classList.contains("is-collapsed");
    setSimPanelCollapsed(collapsed);
    }

    function setSimPanelCollapsed(collapsed) {
    ui.simPanel.classList.toggle("is-collapsed", collapsed);
    ui.configToggleLabel.textContent = collapsed ? "Expandir Config." : "Ocultar Config.";
    ui.configToggleBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
    }

    function applyTimelineHistoryExpandedState() {
    ui.timelineHistoryCard.classList.toggle("expanded", state.timelineHistoryExpanded);
    ui.timelineHistoryToggleBtn.textContent = state.timelineHistoryExpanded ? "Recolher" : "Expandir";
    if (!state.timelineHistoryExpanded && ui.timelineHistoryTooltip) {
        ui.timelineHistoryTooltip.classList.remove("show");
    }
    }

    function populateTimelineHistorySectorSelect() {
    const selected = state.timelineHistorySector;
    const options = [
        `<option value="__total__">Operação Total</option>`,
        ...state.sectors.map((sector) =>
        `<option value="${escapeHtml(sector.setor)}">${escapeHtml(sector.setor)} - ${escapeHtml(sector.descricao)}</option>`
        )
    ];
    ui.timelineHistorySectorSelect.innerHTML = options.join("");

    const hasSelected = state.timelineHistorySector === "__total__"
        || state.sectors.some((sector) => sector.setor === selected);
    state.timelineHistorySector = hasSelected ? selected : "__total__";
    ui.timelineHistorySectorSelect.value = state.timelineHistorySector;
    }

    function ensureTimelineHistoryChart() {
    if (state.timelineHistoryChart || !ui.timelineHistoryCanvas || typeof Chart === "undefined") return;

    if (!timelineHistoryPluginsRegistered) {
        Chart.register(timelineLunchPlugin);
        Chart.register(timelineNowMarkerPlugin);
        Chart.register(timelineHoverFocusPlugin);
        timelineHistoryPluginsRegistered = true;
    }

    state.timelineHistoryChart = new Chart(ui.timelineHistoryCanvas, {
        type: "line",
        data: {
        datasets: [
            {
            label: "Produção Real",
            data: [],
            parsing: false,
            borderColor: "#2563eb",
            backgroundColor: "rgba(37, 99, 235, 0.14)",
            borderWidth: 2.1,
            pointRadius: 0,
            pointHoverRadius: 3.2,
            pointHitRadius: 10,
            fill: true,
            tension: 0.22,
            cubicInterpolationMode: "monotone"
            },
            {
            label: "Meta Dinâmica",
            data: [],
            parsing: false,
            borderColor: "#f59e0b",
            borderWidth: 1.95,
            borderDash: [6, 4],
            pointRadius: 0,
            pointHoverRadius: 3,
            pointHitRadius: 10,
            fill: false,
            tension: 0.18,
            cubicInterpolationMode: "monotone"
            },
            {
            label: "Previsão",
            data: [],
            parsing: false,
            borderColor: "#10b981",
            borderWidth: 1.8,
            borderDash: [2, 6],
            borderCapStyle: "round",
            borderJoinStyle: "round",
            backgroundColor: "rgba(16, 185, 129, 0.12)",
            pointRadius: 0,
            pointHoverRadius: 3,
            pointHitRadius: 10,
            fill: false,
            tension: 0.18,
            cubicInterpolationMode: "monotone"
            },
            {
            label: "Agora",
            data: [],
            parsing: false,
            borderColor: "#0f172a",
            backgroundColor: "#0f172a",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 5,
            showLine: false
            }
        ]
        },
        options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        parsing: false,
        normalized: true,
        interaction: {
            mode: "index",
            axis: "x",
            intersect: false
        },
        onHover(_event, elements, chart) {
            const first = elements && elements.length ? elements[0] : null;
            if (!first) {
            if (chart.options.plugins.timelineHoverFocus.xValue !== null) {
                chart.options.plugins.timelineHoverFocus.xValue = null;
                chart.draw();
            }
            return;
            }

            const dataset = chart.data.datasets[first.datasetIndex];
            const point = dataset && dataset.data ? dataset.data[first.index] : null;
            const xValue = point && Number.isFinite(point.x) ? point.x : null;

            if (chart.options.plugins.timelineHoverFocus.xValue !== xValue) {
            chart.options.plugins.timelineHoverFocus.xValue = xValue;
            chart.draw();
            }
        },
        plugins: {
            legend: {
            display: false
            },
            tooltip: {
            enabled: false,
            mode: "index",
            intersect: false,
            external(context) {
                renderTimelineHistoryTooltip(context);
            }
            },
            timelineLunchBands: {
            segments: []
            },
            timelineNowMarker: {
            nowMinute: null
            },
            timelineHoverFocus: {
            xValue: null
            }
        },
        scales: {
            x: {
            type: "linear",
            min: 0,
            max: 1,
            grid: {
                color: "rgba(203, 213, 225, 0.58)"
            },
            border: {
                color: "#cbd5e1"
            },
            ticks: {
                color: "#64748b",
                maxTicksLimit: 6,
                callback(value) {
                return formatTimelineTick(Number(value));
                }
            }
            },
            y: {
            beginAtZero: true,
            grace: "10%",
            grid: {
                color: "rgba(203, 213, 225, 0.45)"
            },
            border: {
                color: "#cbd5e1"
            },
            ticks: {
                color: "#64748b",
                precision: 0,
                callback(value) {
                return fmtInt(Number(value));
                }
            }
            }
        }
        }
    });
    }

    function renderTimelineHistoryTooltip(context) {
    const tooltipEl = ui.timelineHistoryTooltip;
    if (!tooltipEl) return;

    const chart = context && context.chart ? context.chart : null;
    const tooltip = context && context.tooltip ? context.tooltip : null;
    if (!chart || !tooltip || tooltip.opacity === 0 || !state.timelineHistoryExpanded) {
        tooltipEl.classList.remove("show");
        return;
    }

    const firstPoint = tooltip.dataPoints && tooltip.dataPoints.length
        ? tooltip.dataPoints[0]
        : null;
    const minute = firstPoint ? Number(firstPoint.parsed.x) : NaN;
    const metrics = Number.isFinite(minute) ? resolveTimelineTooltipMetrics(minute) : null;
    const scopeContext = state.timelineTooltipContext;
    if (!metrics || !scopeContext) {
        tooltipEl.classList.remove("show");
        return;
    }

    const hasTarget = scopeContext.targetTotal > 0;
    const minuteOfDay = ((Math.floor(metrics.minute) % (24 * 60)) + (24 * 60)) % (24 * 60);
    const activeBreak = getTimelineBreakLabels().find((item) => isTimeInRange(minuteOfDay, item.start, item.end));
    const hasDiff = Number.isFinite(metrics.diff);
    const diffValue = hasDiff ? metrics.diff : 0;
    const deltaPct = hasTarget && hasDiff
        ? Math.abs(diffValue) / Math.max(scopeContext.targetTotal, 1)
        : 0;
    const deltaClass = !hasDiff
        ? "warn"
        : (diffValue >= 0
        ? "ok"
        : (deltaPct <= state.timelineStatusTolerancePct ? "warn" : "critical"));
    const deltaText = !hasDiff
        ? "Sem referência"
        : (diffValue >= 0
        ? `+${fmtInt(Math.abs(diffValue))} adiantado`
        : `-${fmtInt(Math.abs(diffValue))} atrasado`);

    const avgLPHText = Number.isFinite(metrics.avgLPH) ? `${fmtInt(metrics.avgLPH)} LPH` : "Insuficiente";
    const reqLPHText = Number.isFinite(scopeContext.requiredLPHNow)
        ? `${fmtInt(scopeContext.requiredLPHNow)} LPH`
        : "Sem janela";
    const hasForecast = Number.isFinite(scopeContext.forecastEndTotal);
    const forecastEndText = hasForecast
        ? `${fmtInt(scopeContext.forecastEndTotal)} linhas`
        : "Sem previsão";
    const forecastGap = hasTarget && hasForecast
        ? Math.max(scopeContext.targetTotal - scopeContext.forecastEndTotal, 0)
        : null;
    const forecastGapText = hasTarget
        ? (!hasForecast
        ? "Sem ritmo para estimar"
        : (forecastGap <= 0 ? "Meta atingida" : `${fmtInt(forecastGap)} linhas`))
        : "";

    const remainingWorkMinutes = Math.max(
        0,
        Math.round((Number(scopeContext.remainingWorkHoursNow) || 0) * 60)
    );
    const remainingBreakMinutes = Math.max(
        0,
        Math.round(Number(scopeContext.remainingBreakMinutesNow) || 0)
    );
    const effectiveRemainingText = formatDurationFromMinutes(remainingWorkMinutes);
    const breaksRemainingText = formatDurationFromMinutes(remainingBreakMinutes);
    const lowTimeAlert = remainingWorkMinutes > 0 && remainingWorkMinutes < 30;

    let html = `
        <div class="t-head">
        <span class="t-time">Horário: ${escapeHtml(formatSimulatedClock(metrics.minute))}</span>
        ${activeBreak ? `<span class="t-badge">PAUSA (${escapeHtml(activeBreak.label)})</span>` : ""}
        </div>
    `;

    if (hasTarget) {
        html += `
        <div class="t-section">
            <div class="t-title">Acumulado até o momento</div>
            <div class="t-row"><span>Produzido (Acumulado)</span><strong>${fmtInt(metrics.producedAt)} linhas</strong></div>
            <div class="t-row"><span>Meta (Acumulada)</span><strong>${Number.isFinite(metrics.metaAccum) ? `${fmtInt(metrics.metaAccum)} linhas` : "--"}</strong></div>
            <div class="t-row t-delta"><span>Diferença</span><strong class="${deltaClass}">${deltaText}</strong></div>
        </div>
        `;
    } else {
        html += `
        <div class="t-section">
            <div class="t-title">Acumulado até o momento</div>
            <div class="t-row"><span>Produzido</span><strong>${fmtInt(metrics.producedAt)} linhas</strong></div>
        </div>
        `;
    }

    html += `
        <div class="t-section">
        <div class="t-title">Ritmo e previsão</div>
        <div class="t-row"><span>LPH Médio</span><strong>${avgLPHText}</strong></div>
        ${hasTarget ? `<div class="t-row"><span>LPH Necessário (agora)</span><strong>${reqLPHText}</strong></div>` : ""}
        <div class="t-row"><span>Previsão no fim</span><strong>${forecastEndText}</strong></div>
        ${hasTarget ? `<div class="t-row"><span>Falta para meta no fim</span><strong>${forecastGapText}</strong></div>` : ""}
        </div>
        <div class="t-section">
        <div class="t-title">Tempo efetivo</div>
        <div class="t-row"><span>Tempo restante efetivo</span><strong>${effectiveRemainingText}</strong></div>
        <div class="t-row"><span>Pausas restantes</span><strong>${breaksRemainingText}</strong></div>
        </div>
    `;

    if (activeBreak) {
        html += `<div class="hint">Pausa ativa: meta nao avanca neste intervalo.</div>`;
    } else if (lowTimeAlert) {
        html += `<div class="hint">Atenção: pouco tempo restante para correção de ritmo.</div>`;
    }

    tooltipEl.innerHTML = html;
    tooltipEl.classList.add("show");

    const parent = chart.canvas.parentNode;
    const parentWidth = parent ? parent.clientWidth : 0;
    const parentHeight = parent ? parent.clientHeight : 0;
    const tooltipWidth = tooltipEl.offsetWidth || 260;
    const tooltipHeight = tooltipEl.offsetHeight || 180;
    let left = tooltip.caretX + 14;
    let top = tooltip.caretY + 12;

    if (left + tooltipWidth > parentWidth - 4) {
        left = tooltip.caretX - tooltipWidth - 14;
    }
    if (left < 4) left = 4;
    if (top + tooltipHeight > parentHeight - 4) {
        top = parentHeight - tooltipHeight - 4;
    }
    if (top < 4) top = 4;

    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${top}px`;
    }

    function startTimer() {
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = setInterval(onTick, 1000);
    }

    function onTick() {
    if (!state.running) return;
    const stepMinutes = Math.max(1, Math.round(60 / state.secondsPerProdHour));
    for (let step = 0; step < stepMinutes; step++) {
        state.simulatedMinutes += 1;
        const currentMinute = Math.floor(state.simulatedMinutes);
        const shiftContext = getLiveShiftContext(currentMinute);

        state.sectors.forEach((sector) => {
        runLiveProductionMinute(sector, shiftContext);
        });

        registerProductionPoint(false);
    }

    state.sectors.forEach((sector) => {
        syncDerived(sector);
        updateSectorRates(sector, state.simulatedMinutes);
    });

    const statusContext = buildDeliveryContext();
    state.sectors.forEach((sector) => {
        sector.statusMeta = classifyMeta(sector, statusContext);
    });

    requestRender();
    }

    function resetSimulation(firstLoad) {
    state.startMinutesRef = state.config.workStartMin;
    state.simulatedMinutes = state.startMinutesRef;
    state.running = true;
    ui.runPauseBtn.textContent = "Pausar";
    state.sectors = buildFakeData();
    state.productionHistory = [];
    populateTimelineHistorySectorSelect();
    registerProductionPoint(true);
    state.sectors.forEach((sector) => {
        updateSectorRates(sector, state.simulatedMinutes);
    });
    updateDistributionTotalLabel();
    updateDemandStatus(ui.demandSectorSelect.value);
    updateSpeedLabel();
    renderAll();

    if (!firstLoad) {
        flashReset();
    }
    }

    function flashReset() {
    ui.timestamp.textContent = "Simulação reiniciada com novos dados fictícios.";
    setTimeout(() => renderTimestamp(), 800);
    }

    function populateDemandSectorSelect() {
    ui.demandSectorSelect.innerHTML = SECTORS_BASE.map((base) =>
        `<option value="${escapeHtml(base.setor)}">${escapeHtml(base.setor)} - ${escapeHtml(base.descricao)}</option>`
    ).join("");

    if (!ui.demandSectorSelect.value && SECTORS_BASE.length) {
        ui.demandSectorSelect.value = SECTORS_BASE[0].setor;
    }
    }

    function syncConfigInputsFromState() {
    ui.workStartInput.value = formatMinutesToTime(state.config.workStartMin);
    ui.workEndInput.value = formatMinutesToTime(state.config.workEndMin);
    ui.lunchStartInput.value = formatMinutesToTime(state.config.lunchStartMin);
    ui.lunchEndInput.value = formatMinutesToTime(state.config.lunchEndMin);
    ui.distFracInput.value = String(state.config.distribution.fracionado);
    ui.distGrossaInput.value = String(state.config.distribution.cargaGrossa);
    ui.distArmInput.value = String(state.config.distribution.arm20);
    updateDistributionTotalLabel();
    updateDemandStatus(ui.demandSectorSelect.value);
    }

    function applyDistributionConfig() {
    const normalized = normalizeDistributionValues([
        Number(ui.distFracInput.value),
        Number(ui.distGrossaInput.value),
        Number(ui.distArmInput.value)
    ]);

    state.config.distribution.fracionado = normalized[0];
    state.config.distribution.cargaGrossa = normalized[1];
    state.config.distribution.arm20 = normalized[2];

    ui.distFracInput.value = String(normalized[0]);
    ui.distGrossaInput.value = String(normalized[1]);
    ui.distArmInput.value = String(normalized[2]);
    updateDistributionTotalLabel();
    setConfigFeedback("Distribuicao de demanda aplicada.");
    }

    function normalizeDistributionValues(rawValues) {
    const safe = rawValues.map((value) => clamp(Math.round(Number(value) || 0), 0, 100));
    const total = safe.reduce((sum, value) => sum + value, 0);
    if (total <= 0) return [40, 45, 15];

    const normalized = safe.map((value) => Math.round((value / total) * 100));
    const diff = 100 - normalized.reduce((sum, value) => sum + value, 0);
    normalized[0] = clamp(normalized[0] + diff, 0, 100);
    return normalized;
    }

    function updateDistributionTotalLabel() {
    const total = Number(ui.distFracInput.value || 0)
        + Number(ui.distGrossaInput.value || 0)
        + Number(ui.distArmInput.value || 0);

    ui.distTotalLabel.textContent = `Total: ${total}%`;
    ui.distTotalLabel.classList.remove("status-run", "status-break");
    ui.distTotalLabel.classList.add(total === 100 ? "status-run" : "status-break");
    }

    function isAnyDemandOverrideActive() {
    return Object.values(state.config.demandOverrides).some((value) => Number(value) > 0);
    }

    function updateDemandStatus(setor) {
    const key = setor || ui.demandSectorSelect.value;
    const override = Number(state.config.demandOverrides[key] || 0);
    const anyOverride = isAnyDemandOverrideActive();
    ui.demandValueInput.value = override > 0 ? String(override) : "";
    if (override > 0) {
        ui.demandStatus.textContent = `Override ativo: ${fmtInt(override)} linhas`;
    } else if (anyOverride) {
        ui.demandStatus.textContent = "Override ativo em outro setor";
    } else {
        ui.demandStatus.textContent = "Sem override";
    }
    ui.demandStatus.classList.remove("status-run", "status-off");
    ui.demandStatus.classList.add((override > 0 || anyOverride) ? "status-run" : "status-off");
    }

    function setConfigFeedback(message) {
    ui.timestamp.textContent = message;
    setTimeout(() => renderTimestamp(), 1200);
    }

    function parseTimeToMinutes(rawValue, fallback) {
    if (!rawValue || !rawValue.includes(":")) return fallback;
    const [hourRaw, minuteRaw] = rawValue.split(":");
    const hour = Number(hourRaw);
    const minute = Number(minuteRaw);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return fallback;
    return clamp(hour, 0, 23) * 60 + clamp(minute, 0, 59);
    }

    function formatMinutesToTime(totalMinutes) {
    const safeMinutes = ((Math.round(totalMinutes) % (24 * 60)) + (24 * 60)) % (24 * 60);
    const hour = Math.floor(safeMinutes / 60);
    const minute = safeMinutes % 60;
    return `${pad2(hour)}:${pad2(minute)}`;
    }

    function isTimeInRange(currentMinute, startMinute, endMinute) {
    if (startMinute === endMinute) return true;
    if (startMinute < endMinute) {
        return currentMinute >= startMinute && currentMinute < endMinute;
    }
    return currentMinute >= startMinute || currentMinute < endMinute;
    }

    function isScheduledBreakMinute(minuteOfDay) {
    if (state.config.lunchStartMin === state.config.lunchEndMin) return false;
    return isTimeInRange(minuteOfDay, state.config.lunchStartMin, state.config.lunchEndMin);
    }

    function isProductionWindow(minuteOfDay) {
    const inWork = isTimeInRange(minuteOfDay, state.config.workStartMin, state.config.workEndMin);
    if (!inWork) return false;
    const inLunch = isScheduledBreakMinute(minuteOfDay);
    return !inLunch;
    }

    function getOperationState(minuteOfDay) {
    const inWork = isTimeInRange(minuteOfDay, state.config.workStartMin, state.config.workEndMin);
    if (!inWork) return { label: "Fora da jornada", className: "status-off" };
    const inLunch = isScheduledBreakMinute(minuteOfDay);
    if (inLunch) return { label: "Em almoço", className: "status-break" };
    return { label: "Em operação", className: "status-run" };
    }

    function getDistributionCategoryKey(setor) {
    const category = categorizeSector(setor);
    if (category === "fracionado") return "fracionado";
    if (category === "carga-grossa") return "cargaGrossa";
    if (category === "arm-20") return "arm20";
    return null;
    }

    function getSectorSeed(setor) {
    let seed = 0;
    String(setor).split("").forEach((char, index) => {
        seed += char.charCodeAt(0) * (index + 3);
    });
    return seed || 17;
    }

    function getSectorProfileBase(categoryKey) {
    const sim = state.config.simulation;
    if (categoryKey === "fracionado") {
        return {
        warmupMinutes: sim.warmupMinutes,
        postLunchMinutes: sim.postLunchMinutes + 4,
        fatigueWindowMinutes: sim.fatigueWindowMinutes,
        fatigueDrop: sim.fatigueDrop,
        endSprintMinutes: sim.endSprintMinutes,
        endSprintBoost: sim.endSprintBoost + 0.01,
        stopProbPerMin: sim.stopProbPerMin + 0.003,
        cv: sim.cv + 0.015
        };
    }

    if (categoryKey === "cargaGrossa") {
        return {
        warmupMinutes: Math.max(12, sim.warmupMinutes - 6),
        postLunchMinutes: Math.max(10, sim.postLunchMinutes - 4),
        fatigueWindowMinutes: sim.fatigueWindowMinutes,
        fatigueDrop: Math.max(0.02, sim.fatigueDrop - 0.012),
        endSprintMinutes: sim.endSprintMinutes,
        endSprintBoost: Math.max(0, sim.endSprintBoost - 0.015),
        stopProbPerMin: Math.max(0.004, sim.stopProbPerMin - 0.004),
        cv: Math.max(0.06, sim.cv - 0.02)
        };
    }

    return {
        warmupMinutes: sim.warmupMinutes,
        postLunchMinutes: sim.postLunchMinutes,
        fatigueWindowMinutes: sim.fatigueWindowMinutes,
        fatigueDrop: sim.fatigueDrop,
        endSprintMinutes: sim.endSprintMinutes,
        endSprintBoost: sim.endSprintBoost,
        stopProbPerMin: sim.stopProbPerMin,
        cv: sim.cv
    };
    }

    function jitter(value, pct) {
    return value * rand(1 - pct, 1 + pct);
    }

    function buildSectorSimulationProfile(setor) {
    const categoryKey = getDistributionCategoryKey(setor);
    const base = getSectorProfileBase(categoryKey);
    return {
        warmupMinutes: clamp(Math.round(jitter(base.warmupMinutes, 0.16)), 10, 90),
        postLunchMinutes: clamp(Math.round(jitter(base.postLunchMinutes, 0.20)), 8, 60),
        fatigueWindowMinutes: clamp(Math.round(jitter(base.fatigueWindowMinutes, 0.15)), 30, 180),
        fatigueDrop: clamp(jitter(base.fatigueDrop, 0.18), 0.02, 0.16),
        endSprintMinutes: clamp(Math.round(jitter(base.endSprintMinutes, 0.25)), 0, 60),
        endSprintBoost: clamp(jitter(base.endSprintBoost, 0.24), 0, 0.15),
        stopProbPerMin: clamp(jitter(base.stopProbPerMin, 0.25), 0.004, 0.05),
        cv: clamp(jitter(base.cv, 0.22), 0.06, 0.22)
    };
    }

    function sampleNormal(mean, stdDev) {
    if (!Number.isFinite(stdDev) || stdDev <= 0) return mean;
    let u1 = Math.random();
    let u2 = Math.random();
    if (u1 <= 0) u1 = 1e-9;
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + (z * stdDev);
    }

    function sampleDowntimeDuration() {
    const draw = Math.random();
    if (draw < 0.60) return randInt(1, 2);
    if (draw < 0.90) return randInt(3, 4);
    return randInt(5, 6);
    }

    function getShiftBreakBounds(shiftStartMinute) {
    if (state.config.lunchStartMin === state.config.lunchEndMin) {
        return { start: null, end: null };
    }

    const minuteOfDay = ((Math.floor(shiftStartMinute) % (24 * 60)) + (24 * 60)) % (24 * 60);
    const dayBase = shiftStartMinute - minuteOfDay;
    let breakStart = dayBase + state.config.lunchStartMin;
    let breakEnd = dayBase + state.config.lunchEndMin;
    if (state.config.lunchEndMin <= state.config.lunchStartMin) {
        breakEnd += 24 * 60;
    }
    if (breakStart < shiftStartMinute) {
        breakStart += 24 * 60;
        breakEnd += 24 * 60;
    }

    return { start: breakStart, end: breakEnd };
    }

    function getLiveShiftContext(minuteAbsolute) {
    const minuteOfDay = ((Math.floor(minuteAbsolute) % (24 * 60)) + (24 * 60)) % (24 * 60);
    const inWork = isTimeInRange(minuteOfDay, state.config.workStartMin, state.config.workEndMin);
    const inBreak = inWork && isScheduledBreakMinute(minuteOfDay);
    const shiftStart = getCurrentShiftStart(minuteAbsolute);
    const shiftEnd = getCurrentShiftEnd(minuteAbsolute);
    const breakBounds = getShiftBreakBounds(shiftStart);

    return {
        minute: minuteAbsolute,
        minuteOfDay,
        inWork,
        inBreak,
        shiftStart,
        shiftEnd,
        breakStart: breakBounds.start,
        breakEnd: breakBounds.end
    };
    }

    function computeWarmupFactor(minuteAbsolute, shiftStart, warmupMinutes) {
    if (!Number.isFinite(warmupMinutes) || warmupMinutes <= 0) return 1;
    const sinceStart = minuteAbsolute - shiftStart;
    const ratio = clamp(sinceStart / warmupMinutes, 0, 1);
    return 0.60 + (ratio * 0.40);
    }

    function computePostLunchFactor(minuteAbsolute, breakEnd, postLunchMinutes) {
    if (!Number.isFinite(breakEnd)) return 1;
    if (!Number.isFinite(postLunchMinutes) || postLunchMinutes <= 0) return 1;
    const sinceReturn = minuteAbsolute - breakEnd;
    if (sinceReturn <= 0) return 1;
    const ratio = clamp(sinceReturn / postLunchMinutes, 0, 1);
    return 0.75 + (ratio * 0.25);
    }

    function computeFatigueFactor(minuteAbsolute, shiftEnd, fatigueWindowMinutes, fatigueDrop) {
    if (!Number.isFinite(fatigueWindowMinutes) || fatigueWindowMinutes <= 0) return 1;
    const fatigueStart = shiftEnd - fatigueWindowMinutes;
    if (minuteAbsolute <= fatigueStart) return 1;
    const ratio = clamp((minuteAbsolute - fatigueStart) / fatigueWindowMinutes, 0, 1);
    return 1 - (clamp(fatigueDrop, 0, 0.6) * ratio);
    }

    function computeEndSprintFactor(minuteAbsolute, shiftEnd, sprintWindowMinutes, sprintBoost) {
    if (!Number.isFinite(sprintWindowMinutes) || sprintWindowMinutes <= 0) return 1;
    if (!Number.isFinite(sprintBoost) || sprintBoost <= 0) return 1;
    const sprintStart = shiftEnd - sprintWindowMinutes;
    if (minuteAbsolute <= sprintStart) return 1;
    const ratio = clamp((minuteAbsolute - sprintStart) / sprintWindowMinutes, 0, 1);
    return 1 + (sprintBoost * ratio);
    }

    function getExpectedLpmAtMinute(baseLPH, profile, shiftContext) {
    const baseLpm = Math.max(baseLPH, 0) / 60;
    const warmupFactor = computeWarmupFactor(
        shiftContext.minute,
        shiftContext.shiftStart,
        profile.warmupMinutes
    );
    const postLunchFactor = computePostLunchFactor(
        shiftContext.minute,
        shiftContext.breakEnd,
        profile.postLunchMinutes
    );
    const fatigueFactor = computeFatigueFactor(
        shiftContext.minute,
        shiftContext.shiftEnd,
        profile.fatigueWindowMinutes,
        profile.fatigueDrop
    );
    const sprintFactor = computeEndSprintFactor(
        shiftContext.minute,
        shiftContext.shiftEnd,
        profile.endSprintMinutes,
        profile.endSprintBoost
    );

    return Math.max(0, baseLpm * warmupFactor * postLunchFactor * fatigueFactor * sprintFactor);
    }

    function pushSectorMinutePoint(sector, minute, prodState, producedLines) {
    if (!Array.isArray(sector.minuteSeries)) sector.minuteSeries = [];
    sector.minuteSeries.push({
        minute,
        state: prodState,
        lines: producedLines
    });

    const maxPoints = 1700;
    if (sector.minuteSeries.length > maxPoints) {
        sector.minuteSeries.splice(0, sector.minuteSeries.length - maxPoints);
    }
    }

    function getSectorProducedBetween(sector, startMinuteExclusive, endMinuteInclusive) {
    const history = Array.isArray(sector.minuteSeries) ? sector.minuteSeries : [];
    if (!history.length || endMinuteInclusive <= startMinuteExclusive) return 0;

    let produced = 0;
    for (let index = history.length - 1; index >= 0; index--) {
        const point = history[index];
        if (point.minute <= startMinuteExclusive) break;
        if (point.minute > endMinuteInclusive) continue;
        produced += Number(point.lines || 0);
    }
    return produced;
    }

    function getSectorWindowRates(sector, endMinute, windowMinutes) {
    const history = Array.isArray(sector.minuteSeries) ? sector.minuteSeries : [];
    if (!history.length || windowMinutes <= 0) {
        return {
        producedLines: 0,
        effectiveMinutes: 0,
        productiveMinutes: 0,
        operationalLPH: null,
        productiveLPH: null
        };
    }

    const start = endMinute - windowMinutes;
    let producedLines = 0;
    let effectiveMinutes = 0;
    let productiveMinutes = 0;

    for (let index = history.length - 1; index >= 0; index--) {
        const point = history[index];
        if (point.minute <= start) break;
        if (point.minute > endMinute) continue;

        producedLines += Number(point.lines || 0);
        if (point.state === PROD_STATE_WORK || point.state === PROD_STATE_DOWNTIME) {
        effectiveMinutes++;
        }
        if (point.state === PROD_STATE_WORK) {
        productiveMinutes++;
        }
    }

    const operationalLPH = effectiveMinutes > 0
        ? (producedLines / effectiveMinutes) * 60
        : null;
    const productiveLPH = productiveMinutes > 0
        ? (producedLines / productiveMinutes) * 60
        : null;

    return {
        producedLines,
        effectiveMinutes,
        productiveMinutes,
        operationalLPH,
        productiveLPH
    };
    }

    function updateSectorRates(sector, nowMinute) {
    const sim = state.config.simulation;
    const windowMinutes = Math.max(10, Number(sim.lphWindowMinutes) || 60);
    const alpha = clamp(Number(sim.ewmaAlpha) || 0.2, 0.05, 0.9);
    const stats = getSectorWindowRates(sector, nowMinute, windowMinutes);
    const currentHourStart = Math.floor(nowMinute / 60) * 60;

    sector.producaoHoraAtual = getSectorProducedBetween(sector, currentHourStart, nowMinute);
    sector.producaoHoraAnterior = getSectorProducedBetween(
        sector,
        currentHourStart - 60,
        currentHourStart
    );

    sector.lphOperationalLastWindow = Number.isFinite(stats.operationalLPH) ? stats.operationalLPH : 0;
    sector.lphProductiveLastWindow = Number.isFinite(stats.productiveLPH) ? stats.productiveLPH : 0;

    if (Number.isFinite(stats.operationalLPH)) {
        sector.lphOperationalEwma = Number.isFinite(sector.lphOperationalEwma)
        ? (alpha * stats.operationalLPH) + ((1 - alpha) * sector.lphOperationalEwma)
        : stats.operationalLPH;
    }

    if (Number.isFinite(stats.productiveLPH)) {
        sector.lphProductiveEwma = Number.isFinite(sector.lphProductiveEwma)
        ? (alpha * stats.productiveLPH) + ((1 - alpha) * sector.lphProductiveEwma)
        : stats.productiveLPH;
    }
    }

    function runLiveProductionMinute(sector, shiftContext) {
    let produced = 0;
    let prodState = PROD_STATE_OFF;
    const remaining = Math.max(sector.linhasTotais - sector.linhasSeparadas, 0);

    if (!shiftContext.inWork) {
        prodState = PROD_STATE_OFF;
        sector.downtimeRemaining = 0;
    } else if (shiftContext.inBreak) {
        prodState = PROD_STATE_BREAK;
    } else if (remaining <= 0) {
        prodState = PROD_STATE_DONE;
    } else if (sector.downtimeRemaining > 0) {
        prodState = PROD_STATE_DOWNTIME;
        sector.downtimeRemaining--;
    } else if (Math.random() < sector.simProfile.stopProbPerMin) {
        prodState = PROD_STATE_DOWNTIME;
        sector.downtimeRemaining = Math.max(0, sampleDowntimeDuration() - 1);
    } else {
        prodState = PROD_STATE_WORK;
        const expectedLpm = getExpectedLpmAtMinute(sector.baseLPH, sector.simProfile, shiftContext);
        const sigma = expectedLpm * sector.simProfile.cv;
        const upper = expectedLpm * (1 + clamp(sector.simProfile.cv * 2.4, 0.35, 1.15));
        produced = clamp(sampleNormal(expectedLpm, sigma), 0, Math.max(upper, expectedLpm));
        produced = Math.min(produced, remaining);
        if (!Number.isFinite(produced) || produced < 0) produced = 0;
    }

    if (produced > 0) {
        sector.linhasSeparadas += produced;
    }

    pushSectorMinutePoint(sector, shiftContext.minute, prodState, produced);
    }

    function deterministicUnit(seedA, seedB, salt) {
    const a = Number(seedA) || 0;
    const b = Number(seedB) || 0;
    const c = Number(salt) || 0;
    const raw = Math.sin((a * 12.9898) + (b * 78.233) + (c * 37.719)) * 43758.5453123;
    return raw - Math.floor(raw);
    }

    function deterministicNormal(seedA, seedB, salt) {
    const u1 = Math.max(deterministicUnit(seedA, seedB, salt), 1e-8);
    const u2 = deterministicUnit(seedA + 31.7, seedB + 19.3, salt + 1.9);
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }

    function sampleDowntimeDurationDeterministic(seedMinute, sectorSeed, salt) {
    const draw = deterministicUnit(seedMinute, sectorSeed, salt);
    if (draw < 0.60) {
        return 1 + Math.floor(deterministicUnit(seedMinute, sectorSeed, salt + 1.2) * 2);
    }
    if (draw < 0.90) {
        return 3 + Math.floor(deterministicUnit(seedMinute, sectorSeed, salt + 2.2) * 2);
    }
    return 5 + Math.floor(deterministicUnit(seedMinute, sectorSeed, salt + 3.2) * 2);
    }

    function mix(valueA, valueB, weightB) {
    const w = clamp(Number(weightB) || 0, 0, 1);
    return (valueA * (1 - w)) + (valueB * w);
    }

    function createForecastSectorState(sector) {
    const sim = state.config.simulation;
    const current = Number.isFinite(sector.lphOperationalEwma) && sector.lphOperationalEwma > 0
        ? sector.lphOperationalEwma
        : (Number.isFinite(sector.lphOperationalLastWindow) && sector.lphOperationalLastWindow > 0
        ? sector.lphOperationalLastWindow
        : sector.baseLPH);
    const baseLPHDynamic = mix(
        sector.baseLPH,
        current,
        clamp(Number(sim.forecastCurrentWeight) || 0.6, 0, 1)
    );

    return {
        seed: sector.seed,
        baseLPH: Math.max(baseLPHDynamic, 0),
        profile: sector.simProfile,
        remaining: Math.max(sector.linhasTotais - sector.linhasSeparadas, 0),
        downtimeRemaining: 0
    };
    }

    function runForecastMinuteForSector(forecastSector, shiftContext, horizonSeed) {
    if (forecastSector.remaining <= 0) return 0;
    if (!shiftContext.inWork || shiftContext.inBreak) return 0;

    if (forecastSector.downtimeRemaining > 0) {
        forecastSector.downtimeRemaining--;
        return 0;
    }

    const stopDraw = deterministicUnit(
        shiftContext.minute + horizonSeed,
        forecastSector.seed,
        0.61
    );
    if (stopDraw < forecastSector.profile.stopProbPerMin) {
        const duration = sampleDowntimeDurationDeterministic(
        shiftContext.minute + horizonSeed,
        forecastSector.seed,
        0.83
        );
        forecastSector.downtimeRemaining = Math.max(0, duration - 1);
        return 0;
    }

    const expectedLpm = getExpectedLpmAtMinute(
        forecastSector.baseLPH,
        forecastSector.profile,
        shiftContext
    );
    const sigma = expectedLpm * forecastSector.profile.cv * 0.70;
    const z = deterministicNormal(
        shiftContext.minute + horizonSeed,
        forecastSector.seed,
        2.37
    );
    let produced = expectedLpm + (z * sigma);
    const maxLimit = expectedLpm * (1 + clamp(forecastSector.profile.cv * 2, 0.30, 1.00));
    produced = clamp(produced, 0, Math.max(maxLimit, expectedLpm));
    produced = Math.min(produced, forecastSector.remaining);
    if (!Number.isFinite(produced) || produced <= 0) return 0;

    forecastSector.remaining -= produced;
    return produced;
    }

    function getScopeSectors(scopeKey) {
    if (scopeKey === "__total__") return state.sectors;
    const sector = state.sectors.find((item) => item.setor === scopeKey);
    return sector ? [sector] : [];
    }

    function buildScopeForecastSeries(scopeKey, nowMinute, endMinute) {
    const fromMinute = Math.floor(nowMinute);
    const toMinute = Math.floor(endMinute);
    if (toMinute <= fromMinute) {
        return {
        series: [{ minute: fromMinute, produced: 0 }],
        projectedLines: 0,
        finishMinute: null
        };
    }

    const sectors = getScopeSectors(scopeKey);
    if (!sectors.length) {
        return {
        series: [{ minute: fromMinute, produced: 0 }],
        projectedLines: 0,
        finishMinute: null
        };
    }

    const localStates = sectors.map((sector) => createForecastSectorState(sector));
    const horizonSeed = Math.floor(nowMinute);
    const series = [{ minute: fromMinute, produced: 0 }];
    let cumulative = 0;
    let finishMinute = null;

    for (let minute = fromMinute + 1; minute <= toMinute; minute++) {
        const shiftContext = getLiveShiftContext(minute);
        let producedMinute = 0;

        localStates.forEach((localState) => {
        producedMinute += runForecastMinuteForSector(localState, shiftContext, horizonSeed);
        });

        cumulative += producedMinute;
        series.push({ minute, produced: cumulative });

        if (finishMinute === null && localStates.every((item) => item.remaining <= 0.0001)) {
        finishMinute = minute;
        }
    }

    return {
        series,
        projectedLines: cumulative,
        finishMinute
    };
    }

    function getConfiguredShiftProductiveHours() {
    let durationMinutes = state.config.workEndMin - state.config.workStartMin;
    if (durationMinutes <= 0) durationMinutes += 24 * 60;
    const shiftStart = state.config.workStartMin;
    const shiftEnd = shiftStart + durationMinutes;
    const productiveMinutes = getWorkingMinutesBetween(shiftStart, shiftEnd);
    return Math.max(productiveMinutes / 60, 1 / 60);
    }

    function weightedPickWeightedList(list) {
    const entries = Array.isArray(list) ? list : [];
    if (!entries.length) return null;

    const sanitized = entries
        .map((entry) => ({
        key: entry.key,
        w: Math.max(0, Number(entry.w) || 0)
        }))
        .filter((entry) => entry.key);

    if (!sanitized.length) return String(entries[entries.length - 1].key || "");

    const totalWeight = sanitized.reduce((acc, item) => acc + item.w, 0);
    if (totalWeight <= 0) return String(sanitized[sanitized.length - 1].key);

    const draw = Math.random() * totalWeight;
    let acc = 0;
    for (let index = 0; index < sanitized.length; index++) {
        acc += sanitized[index].w;
        if (draw <= acc) return String(sanitized[index].key);
    }

    return String(sanitized[sanitized.length - 1].key);
    }

    function getDemandDifficultyRangeMap() {
    const sim = state.config.simulation;
    return {
        very_easy: {
        min: Math.round(Number(sim.demandVeryEasyMin) || 10000),
        max: Math.round(Number(sim.demandVeryEasyMax) || 13000)
        },
        easy: {
        min: Math.round(Number(sim.demandEasyMin) || 13000),
        max: Math.round(Number(sim.demandEasyMax) || 18000)
        },
        medium: {
        min: Math.round(Number(sim.demandMediumMin) || 18000),
        max: Math.round(Number(sim.demandMediumMax) || 24000)
        },
        hard: {
        min: Math.round(Number(sim.demandHardMin) || 24000),
        max: Math.round(Number(sim.demandHardMax) || 30000)
        },
        very_hard: {
        min: Math.round(Number(sim.demandVeryHardMin) || 30000),
        max: Math.round(Number(sim.demandVeryHardMax) || 36000)
        }
    };
    }

    function sampleDemandTotalLines(selectedDifficulty) {
    const sim = state.config.simulation;
    const ranges = getDemandDifficultyRangeMap();
    let level = String(selectedDifficulty || state.demandDifficulty || "random");

    if (level === "random") {
        level = weightedPickWeightedList([
        { key: "easy", w: Number(sim.demandRandomEasyWeight) || 55 },
        { key: "very_easy", w: Number(sim.demandRandomVeryEasyWeight) || 25 },
        { key: "medium", w: Number(sim.demandRandomMediumWeight) || 15 },
        { key: "hard", w: Number(sim.demandRandomHardWeight) || 4 },
        { key: "very_hard", w: Number(sim.demandRandomVeryHardWeight) || 1 }
        ]) || "easy";
    }

    if (!ranges[level]) {
        level = "easy";
    }

    const cfg = ranges[level];
    const min = Math.min(cfg.min, cfg.max);
    const max = Math.max(cfg.min, cfg.max);
    return {
        total: randInt(min, max),
        levelKey: level
    };
    }

    function sampleCapacityTotalLines() {
    const sim = state.config.simulation;
    const min = Math.round(Number(sim.capacityMinPerShift) || 24000);
    const max = Math.round(Number(sim.capacityMaxPerShift) || 31000);
    return randInt(Math.min(min, max), Math.max(min, max));
    }

    function allocateIntegerByWeight(total, items, weightGetter, keyGetter) {
    const result = new Map();
    const normalizedTotal = Math.max(0, Math.round(Number(total) || 0));
    const list = Array.isArray(items) ? items : [];
    const resolveKey = typeof keyGetter === "function"
        ? keyGetter
        : (item, index) => (item && item.setor ? item.setor : String(index));

    if (!list.length || normalizedTotal <= 0) {
        list.forEach((item, index) => {
        result.set(resolveKey(item, index), 0);
        });
        return result;
    }

    const weighted = list.map((item, index) => {
        const raw = typeof weightGetter === "function" ? weightGetter(item, index) : 1;
        const weight = Math.max(0, Number(raw) || 0);
        return {
        item,
        index,
        key: resolveKey(item, index),
        weight
        };
    });

    let weightSum = weighted.reduce((acc, entry) => acc + entry.weight, 0);
    if (weightSum <= 0) {
        weighted.forEach((entry) => {
        entry.weight = 1;
        });
        weightSum = weighted.length;
    }

    const buckets = weighted.map((entry) => {
        const exact = (entry.weight / weightSum) * normalizedTotal;
        const base = Math.floor(exact);
        return {
        ...entry,
        base,
        fraction: exact - base
        };
    });

    let assigned = buckets.reduce((acc, entry) => acc + entry.base, 0);
    let remainder = Math.max(0, normalizedTotal - assigned);

    buckets.sort((a, b) => b.fraction - a.fraction);
    for (let index = 0; index < buckets.length && remainder > 0; index++) {
        buckets[index].base += 1;
        remainder--;
    }

    buckets.forEach((entry) => {
        result.set(entry.key, entry.base);
    });

    return result;
    }

    function buildFakeData() {
    const draft = SECTORS_BASE.map((base) => {
        return {
        setor: base.setor,
        descricao: base.descricao,
        meta: base.meta,
        metaSimulada: Math.max(20, base.meta > 0 ? base.meta : randInt(26, 48)),
        baseLPH: 0,
        simProfile: buildSectorSimulationProfile(base.setor),
        seed: getSectorSeed(base.setor),
        categoryKey: getDistributionCategoryKey(base.setor),
        demandWeight: Math.max(6, base.meta > 0 ? base.meta : randInt(18, 40)),
        linhasTotais: 0,
        isOverride: false
        };
    });

    const demandSample = sampleDemandTotalLines(state.demandDifficulty);
    const demandTarget = demandSample.total;
    const capacityTarget = sampleCapacityTotalLines();
    const productiveHours = getConfiguredShiftProductiveHours();
    const baseLPHTotal = capacityTarget / Math.max(productiveHours, 1 / 60);

    let overridesTotal = 0;
    const adjustable = [];

    draft.forEach((item) => {
        const overrideValue = Number(state.config.demandOverrides[item.setor] || 0);
        if (overrideValue > 0) {
        item.linhasTotais = Math.max(20, Math.round(overrideValue));
        item.isOverride = true;
        overridesTotal += item.linhasTotais;
        return;
        }

        item.linhasTotais = 0;
        item.isOverride = false;
        adjustable.push(item);
    });

    const effectiveDemandTarget = Math.max(demandTarget, overridesTotal);
    let remainingDemand = Math.max(effectiveDemandTarget - overridesTotal, 0);

    if (adjustable.length && remainingDemand > 0) {
        const baselineTotal = Math.min(remainingDemand, adjustable.length * 20);
        const baselineMap = allocateIntegerByWeight(baselineTotal, adjustable, () => 1);
        adjustable.forEach((item) => {
        item.linhasTotais += baselineMap.get(item.setor) || 0;
        });
        remainingDemand -= baselineTotal;
    }

    const categorized = adjustable.filter((item) => Boolean(item.categoryKey));
    const misc = adjustable.filter((item) => !item.categoryKey);

    if (remainingDemand > 0 && misc.length) {
        const miscReserve = Math.min(
        remainingDemand,
        Math.max(misc.length * 40, Math.round(remainingDemand * 0.04))
        );
        const miscMap = allocateIntegerByWeight(
        miscReserve,
        misc,
        (item) => item.demandWeight * rand(0.9, 1.1)
        );
        misc.forEach((item) => {
        item.linhasTotais += miscMap.get(item.setor) || 0;
        });
        remainingDemand -= miscReserve;
    }

    if (remainingDemand > 0) {
        if (categorized.length) {
        const grouped = {
            fracionado: [],
            cargaGrossa: [],
            arm20: []
        };
        categorized.forEach((item) => {
            grouped[item.categoryKey].push(item);
        });

        const buckets = [
            {
            setor: "fracionado",
            key: "fracionado",
            pct: Math.max(0, Number(state.config.distribution.fracionado) || 0),
            items: grouped.fracionado
            },
            {
            setor: "cargaGrossa",
            key: "cargaGrossa",
            pct: Math.max(0, Number(state.config.distribution.cargaGrossa) || 0),
            items: grouped.cargaGrossa
            },
            {
            setor: "arm20",
            key: "arm20",
            pct: Math.max(0, Number(state.config.distribution.arm20) || 0),
            items: grouped.arm20
            }
        ].filter((bucket) => bucket.items.length > 0);

        const bucketPctSum = buckets.reduce((acc, bucket) => acc + bucket.pct, 0);
        const bucketTotals = allocateIntegerByWeight(
            remainingDemand,
            buckets,
            (bucket) => (bucketPctSum > 0 ? bucket.pct : 1),
            (bucket) => bucket.key
        );

        buckets.forEach((bucket) => {
            const bucketTotal = bucketTotals.get(bucket.key) || 0;
            const bySector = allocateIntegerByWeight(
            bucketTotal,
            bucket.items,
            (item) => item.demandWeight * rand(0.88, 1.14)
            );

            bucket.items.forEach((item) => {
            item.linhasTotais += bySector.get(item.setor) || 0;
            });
        });

        remainingDemand = 0;
        } else if (misc.length) {
        const miscMap = allocateIntegerByWeight(
            remainingDemand,
            misc,
            (item) => item.demandWeight * rand(0.85, 1.2)
        );
        misc.forEach((item) => {
            item.linhasTotais += miscMap.get(item.setor) || 0;
        });
        remainingDemand = 0;
        }
    }

    if (remainingDemand > 0 && adjustable.length) {
        const topWeightItem = adjustable.reduce((selected, item) =>
        (item.demandWeight > selected.demandWeight ? item : selected), adjustable[0]);
        topWeightItem.linhasTotais += remainingDemand;
    }

    const totalDemandLines = Math.max(1, draft.reduce((acc, item) => acc + item.linhasTotais, 0));
    const capacityWeights = draft.map((item) => {
        const demandShare = item.linhasTotais / totalDemandLines;
        const demandBase = item.linhasTotais > 0 ? Math.max(item.linhasTotais, 20) : 1;
        const weighted = demandBase * rand(0.92, 1.08) * (0.85 + (demandShare * 0.30));
        return {
        item,
        weight: Math.max(weighted, 0.1)
        };
    });
    const capacityWeightSum = capacityWeights.reduce((acc, entry) => acc + entry.weight, 0) || 1;
    capacityWeights.forEach((entry) => {
        const share = entry.weight / capacityWeightSum;
        entry.item.baseLPH = Math.max(1, baseLPHTotal * share);
        entry.item.metaSimulada = Math.max(20, Math.round(entry.item.baseLPH * rand(0.90, 1.10)));
    });

    state.lastScenario = {
        demandTarget: effectiveDemandTarget,
        demandDifficulty: state.demandDifficulty,
        demandLevel: demandSample.levelKey,
        capacityTarget,
        productiveHours,
        calmLimit: Number(state.config.simulation.calmScenarioLimit) || 24000
    };

    return draft.map((item) => {
        const linhasTotais = Math.max(0, Math.round(item.linhasTotais));
        const containersTotais = linhasTotais > 0
        ? Math.max(1, Math.round(linhasTotais * rand(0.20, 0.36)))
        : 0;
        const itensTotais = linhasTotais > 0
        ? Math.max(20, Math.round(linhasTotais * rand(5.2, 9.1)))
        : 0;
        const pesoPrevisto = linhasTotais > 0 ? round2(linhasTotais * rand(0.85, 3.10)) : 0;

        return {
        setor: item.setor,
        descricao: item.descricao,
        meta: item.meta,
        metaSimulada: item.metaSimulada,
        baseLPH: item.baseLPH,
        simProfile: item.simProfile,
        seed: item.seed,
        downtimeRemaining: 0,
        minuteSeries: [],
        lphOperationalEwma: 0,
        lphProductiveEwma: 0,
        lphOperationalLastWindow: 0,
        lphProductiveLastWindow: 0,
        linhasTotais,
        linhasSeparadas: 0,
        linhasRestantes: linhasTotais,
        containersTotais,
        containersSeparados: 0,
        containersRestantes: containersTotais,
        itensTotais,
        itensSeparados: 0,
        itensRestantes: itensTotais,
        pesoPrevisto,
        pesoSeparado: 0,
        pesoRestante: pesoPrevisto,
        progresso: 0,
        prioridade: "Alta",
        producaoHoraAtual: 0,
        producaoHoraAnterior: 0,
        statusMeta: {
            label: "Sem dados",
            chipClass: "c-neutral"
        }
        };
    });
    }

    function syncDerived(sector) {
    sector.linhasRestantes = Math.max(0, sector.linhasTotais - sector.linhasSeparadas);
    sector.progresso = sector.linhasTotais > 0 ? (sector.linhasSeparadas / sector.linhasTotais) * 100 : 0;

    sector.containersSeparados = Math.min(
        sector.containersTotais,
        Math.round((sector.progresso / 100) * sector.containersTotais)
    );
    sector.containersRestantes = Math.max(0, sector.containersTotais - sector.containersSeparados);

    sector.itensSeparados = Math.min(
        sector.itensTotais,
        Math.round((sector.progresso / 100) * sector.itensTotais)
    );
    sector.itensRestantes = Math.max(0, sector.itensTotais - sector.itensSeparados);

    sector.pesoSeparado = round2((sector.progresso / 100) * sector.pesoPrevisto);
    sector.pesoRestante = round2(Math.max(0, sector.pesoPrevisto - sector.pesoSeparado));

    const remainRatio = sector.linhasTotais > 0 ? sector.linhasRestantes / sector.linhasTotais : 0;
    if (sector.linhasRestantes === 0) sector.prioridade = "Concluído";
    else if (remainRatio >= 0.50) sector.prioridade = "Alta";
    else if (remainRatio >= 0.20) sector.prioridade = "Média";
    else sector.prioridade = "Baixa";
    }

    function classifyMeta(sector, context) {
    const ctx = context || buildDeliveryContext();

    if (sector.linhasRestantes <= 0) {
        return {
        label: "Concluído",
        chipClass: "c-ok",
        badgeClass: "status-high",
        dotClass: "dot-high",
        barColor: "#16a34a",
        effectiveRate: getEffectiveRateBySector(sector, ctx),
        requiredRate: 0,
        ratio: Infinity,
        etaMinutes: ctx.nowMinutes
        };
    }

    const effectiveRate = getEffectiveRateBySector(sector, ctx);
    const remainingHours = Math.max(ctx.remainingProdHours, 0);
    const requiredRate = remainingHours > 0 ? sector.linhasRestantes / remainingHours : Infinity;
    const ratio = requiredRate > 0 ? (effectiveRate / requiredRate) : Infinity;
    const etaMinutes = effectiveRate > 0
        ? ctx.nowMinutes + ((sector.linhasRestantes / effectiveRate) * 60)
        : null;

    if (ctx.elapsedHours < 0.10 && effectiveRate <= 0) {
        return {
        label: "Aguardando",
        chipClass: "c-neutral",
        badgeClass: "status-meta",
        dotClass: "dot-meta",
        barColor: "#64748b",
        effectiveRate,
        requiredRate,
        ratio,
        etaMinutes
        };
    }

    if (remainingHours <= 0) {
        return {
        label: "Péssimo",
        chipClass: "c-bad",
        badgeClass: "status-low",
        dotClass: "dot-low",
        barColor: "#dc2626",
        effectiveRate,
        requiredRate,
        ratio: 0,
        etaMinutes
        };
    }

    if (effectiveRate <= 0) {
        return {
        label: "Ruim",
        chipClass: "c-warn",
        badgeClass: "status-low",
        dotClass: "dot-low",
        barColor: "#dc2626",
        effectiveRate,
        requiredRate,
        ratio: 0,
        etaMinutes
        };
    }

    if (ratio >= 1.30) {
        return {
        label: "Excelente",
        chipClass: "c-ok",
        badgeClass: "status-high",
        dotClass: "dot-high",
        barColor: "#16a34a",
        effectiveRate,
        requiredRate,
        ratio,
        etaMinutes
        };
    }

    if (ratio >= 1.05) {
        return {
        label: "Bom",
        chipClass: "c-good",
        badgeClass: "status-high",
        dotClass: "dot-medium",
        barColor: "#22c55e",
        effectiveRate,
        requiredRate,
        ratio,
        etaMinutes
        };
    }

    if (ratio >= 0.95) {
        return {
        label: "No limite",
        chipClass: "c-warn",
        badgeClass: "status-medium",
        dotClass: "dot-medium",
        barColor: "#f59e0b",
        effectiveRate,
        requiredRate,
        ratio,
        etaMinutes
        };
    }

    if (ratio >= 0.80) {
        return {
        label: "Ruim",
        chipClass: "c-warn",
        badgeClass: "status-low",
        dotClass: "dot-low",
        barColor: "#ef4444",
        effectiveRate,
        requiredRate,
        ratio,
        etaMinutes
        };
    }

    return {
        label: "Péssimo",
        chipClass: "c-bad",
        badgeClass: "status-low",
        dotClass: "dot-low",
        barColor: "#dc2626",
        effectiveRate,
        requiredRate,
        ratio,
        etaMinutes
    };
    }

    function getVisibleSectors() {
    let list = [...state.sectors];
    if (state.searchTerm) {
        list = list.filter((sector) => {
        const sectorText = `${sector.setor} ${sector.descricao}`.toLowerCase();
        return sectorText.includes(state.searchTerm);
        });
    }
    sortSectors(list);
    return list;
    }

    function sortSectors(list) {
    const dir = state.sortDir === "asc" ? 1 : -1;
    const key = state.sortKey;
    list.sort((a, b) => {
        const va = getSortValue(a, key);
        const vb = getSortValue(b, key);
        if (typeof va === "string" || typeof vb === "string") {
        return String(va).localeCompare(String(vb), "pt-BR", { numeric: true }) * dir;
        }
        return (Number(va) - Number(vb)) * dir;
    });
    }

    function getSortValue(sector, key) {
    switch (key) {
        case "setor":
        return sector.setor;
        case "descricao":
        return sector.descricao;
        case "separadas":
        return sector.linhasSeparadas;
        case "restantes":
        return sector.linhasRestantes;
        case "containers_restantes":
        return sector.containersRestantes;
        case "total":
        return sector.linhasTotais;
        case "progresso":
        return sector.progresso;
        case "linhas_h":
        return getAverageLinesPerHour(sector);
        default:
        return sector.setor;
    }
    }

    function getElapsedSimulationHours() {
    return Math.max((state.simulatedMinutes - state.startMinutesRef) / 60, 0);
    }

    function getAverageLinesPerHour(sector) {
    if (Number.isFinite(sector.lphOperationalEwma) && sector.lphOperationalEwma > 0) {
        return sector.lphOperationalEwma;
    }
    if (Number.isFinite(sector.lphOperationalLastWindow) && sector.lphOperationalLastWindow > 0) {
        return sector.lphOperationalLastWindow;
    }
    return 0;
    }

    function buildDeliveryContext() {
    return {
        nowMinutes: state.simulatedMinutes,
        minuteOfDay: ((Math.floor(state.simulatedMinutes) % (24 * 60)) + (24 * 60)) % (24 * 60),
        elapsedHours: getElapsedSimulationHours(),
        remainingProdHours: getRemainingProductiveHours(state.simulatedMinutes)
    };
    }

    function getRemainingProductiveHours(fromMinutes) {
    const minuteOfDay = ((Math.floor(fromMinutes) % (24 * 60)) + (24 * 60)) % (24 * 60);
    let minutesUntilEnd = state.config.workEndMin - minuteOfDay;
    if (minutesUntilEnd <= 0) minutesUntilEnd += 24 * 60;

    let productive = 0;
    for (let offset = 0; offset < minutesUntilEnd; offset++) {
        const probeMinute = ((Math.floor(fromMinutes + offset) % (24 * 60)) + (24 * 60)) % (24 * 60);
        if (isProductionWindow(probeMinute)) productive++;
    }

    return productive / 60;
    }

    function getEffectiveRateBySector(sector, context) {
    void context;
    return getAverageLinesPerHour(sector);
    }

    function getTotalSeparatedLines() {
    return sum(state.sectors, "linhasSeparadas");
    }

    function getTotalDemandLines() {
    return sum(state.sectors, "linhasTotais");
    }

    function registerProductionPoint(force) {
    const minute = state.simulatedMinutes;
    const separated = getTotalSeparatedLines();
    const lastPoint = state.productionHistory[state.productionHistory.length - 1];
    const roundedMinute = Math.floor(minute);
    const sectorValues = {};
    state.sectors.forEach((sector) => {
        sectorValues[sector.setor] = sector.linhasSeparadas;
    });

    if (!force && lastPoint) {
        const sameMinute = Math.floor(lastPoint.minute) === roundedMinute;
        const sameValue = Math.abs(lastPoint.value - separated) < 0.0001;
        if (sameMinute && sameValue) return;
    }

    state.productionHistory.push({
        minute,
        value: separated,
        sectors: sectorValues
    });

    if (state.productionHistory.length > 1400) {
        state.productionHistory.splice(0, state.productionHistory.length - 1400);
    }
    }

    function getProjectionRate() {
    const activeSectors = state.sectors.filter((sector) => sector.linhasRestantes > 0.0001);
    if (!activeSectors.length) return 0;

    if (state.timelineRateMode === "last-hour") {
        const lastWindowRate = activeSectors.reduce((acc, sector) =>
        acc + (Number(sector.lphOperationalLastWindow) || 0), 0);
        if (lastWindowRate > 0) return lastWindowRate;
    }

    const ewmaRate = activeSectors.reduce((acc, sector) =>
        acc + (Number(sector.lphOperationalEwma) || 0), 0);
    return ewmaRate;
    }

    function getTimelineWindowEnd(nowMinutes) {
    if (state.timelineHorizon === "shift-end") {
        const minuteOfDay = ((Math.floor(nowMinutes) % (24 * 60)) + (24 * 60)) % (24 * 60);
        let delta = state.config.workEndMin - minuteOfDay;
        if (delta <= 0) delta += 24 * 60;
        return nowMinutes + delta;
    }

    const horizonMinutes = Math.max(30, Number(state.timelineHorizon) || 120);
    return nowMinutes + horizonMinutes;
    }

    function getCurrentShiftStart(nowMinutes) {
    const minuteOfDay = ((Math.floor(nowMinutes) % (24 * 60)) + (24 * 60)) % (24 * 60);
    const dayBase = nowMinutes - minuteOfDay;
    const shiftStartToday = dayBase + state.config.workStartMin;
    if (minuteOfDay >= state.config.workStartMin) return shiftStartToday;
    return shiftStartToday - (24 * 60);
    }

    function getCurrentShiftEnd(nowMinutes) {
    const shiftStart = getCurrentShiftStart(nowMinutes);
    let duration = state.config.workEndMin - state.config.workStartMin;
    if (duration <= 0) duration += 24 * 60;
    return shiftStart + duration;
    }

    function getWorkingMinutesBetween(startMinute, endMinute) {
    if (endMinute <= startMinute) return 0;
    const first = Math.floor(startMinute);
    const last = Math.ceil(endMinute);
    let worked = 0;
    for (let minute = first; minute < last; minute++) {
        const minuteOfDay = ((minute % (24 * 60)) + (24 * 60)) % (24 * 60);
        if (isProductionWindow(minuteOfDay)) worked++;
    }
    return worked;
    }

    function getBreakMinutesBetween(startMinute, endMinute) {
    if (endMinute <= startMinute) return 0;
    const breaks = getTimelineBreakLabels();
    if (!breaks.length) return 0;

    const first = Math.floor(startMinute);
    const last = Math.ceil(endMinute);
    let breakMinutes = 0;

    for (let minute = first; minute < last; minute++) {
        const minuteOfDay = ((minute % (24 * 60)) + (24 * 60)) % (24 * 60);
        const inWork = isTimeInRange(minuteOfDay, state.config.workStartMin, state.config.workEndMin);
        if (!inWork) continue;
        const inBreak = breaks.some((item) => isTimeInRange(minuteOfDay, item.start, item.end));
        if (inBreak) breakMinutes++;
    }

    return breakMinutes;
    }

    function getTimelineScopeMeta(scopeKey) {
    if (scopeKey === "__total__") {
        return {
        label: "Operação Total",
        targetTotal: Math.max(getTotalDemandLines(), 0),
        producedNow: Math.max(getTotalSeparatedLines(), 0)
        };
    }

    const sector = state.sectors.find((item) => item.setor === scopeKey);
    if (!sector) {
        return {
        label: "Operação Total",
        targetTotal: Math.max(getTotalDemandLines(), 0),
        producedNow: Math.max(getTotalSeparatedLines(), 0)
        };
    }

    return {
        label: `${sector.setor} - ${sector.descricao}`,
        targetTotal: Math.max(sector.linhasTotais, 0),
        producedNow: Math.max(sector.linhasSeparadas, 0)
    };
    }

    function getScopeProducedFromPoint(point, scopeKey) {
    if (scopeKey === "__total__") return Number(point.value || 0);
    const sectors = point.sectors || {};
    return Number(sectors[scopeKey] || 0);
    }

    function buildScopeHistory(scopeKey, startMinute, nowMinute, producedNow) {
    const history = state.productionHistory
        .filter((point) => point.minute >= startMinute && point.minute <= nowMinute)
        .map((point) => ({
        minute: point.minute,
        produced: getScopeProducedFromPoint(point, scopeKey)
        }))
        .sort((a, b) => a.minute - b.minute);

    if (!history.length) {
        history.push({ minute: startMinute, produced: 0 });
        history.push({ minute: nowMinute, produced: producedNow });
        return history;
    }

    if (history[0].minute > startMinute) {
        history.unshift({ minute: startMinute, produced: history[0].produced });
    }

    const last = history[history.length - 1];
    if (Math.abs(last.minute - nowMinute) > 0.0001 || Math.abs(last.produced - producedNow) > 0.0001) {
        history.push({ minute: nowMinute, produced: producedNow });
    }

    return history;
    }

    function getProducedAtMinute(history, minute) {
    if (!history.length) return 0;
    if (minute <= history[0].minute) return history[0].produced;
    const last = history[history.length - 1];
    if (minute >= last.minute) return last.produced;

    for (let index = 1; index < history.length; index++) {
        const previous = history[index - 1];
        const current = history[index];
        if (minute < current.minute) {
        const span = Math.max(current.minute - previous.minute, 0.0001);
        const ratio = clamp((minute - previous.minute) / span, 0, 1);
        return previous.produced + ((current.produced - previous.produced) * ratio);
        }
    }

    return last.produced;
    }

    function getMovingAverageLPH(history, minute, windowMinutes) {
    if (!history.length || windowMinutes <= 0) return null;
    const windowStart = minute - windowMinutes;
    const producedEnd = getProducedAtMinute(history, minute);
    const producedStart = getProducedAtMinute(history, windowStart);
    const producedDelta = Math.max(producedEnd - producedStart, 0);
    const workedMinutes = getWorkingMinutesBetween(windowStart, minute);
    if (workedMinutes <= 0) return null;
    return producedDelta / (workedMinutes / 60);
    }

    function getFinishEstimateMinute(nowMinute, requiredLines, avgLPH, shiftEndMinute) {
    if (requiredLines <= 0) return nowMinute;
    if (!Number.isFinite(avgLPH) || avgLPH <= 0) return null;

    const neededWorkMinutes = (requiredLines / avgLPH) * 60;
    if (!Number.isFinite(neededWorkMinutes) || neededWorkMinutes <= 0) return nowMinute;

    let remaining = neededWorkMinutes;
    let cursor = nowMinute;
    let guard = 0;

    while (remaining > 0 && cursor < shiftEndMinute && guard < 4000) {
        const wholeMinute = Math.floor(cursor);
        const nextBoundary = Math.min(wholeMinute + 1, shiftEndMinute);
        const slice = nextBoundary - cursor;
        const minuteOfDay = ((wholeMinute % (24 * 60)) + (24 * 60)) % (24 * 60);

        if (isProductionWindow(minuteOfDay)) {
        const consumed = Math.min(slice, remaining);
        remaining -= consumed;
        cursor += consumed;
        if (consumed < slice) break;
        } else {
        cursor = nextBoundary;
        }

        guard++;
    }

    return remaining <= 0 ? cursor : null;
    }

    function getTimelineStatus(requiredLines, targetTotal, forecastEndTotal) {
    if (targetTotal <= 0) {
        return {
        key: "off",
        label: "Sem Meta",
        detail: "Sem meta configurada para o escopo.",
        gap: 0
        };
    }

    if (requiredLines <= 0) {
        return {
        key: "ok",
        label: "Meta Atingida",
        detail: "Meta ja concluida antes do fim da jornada.",
        gap: 0
        };
    }

    const gap = targetTotal - forecastEndTotal;
    if (gap <= 0) {
        return {
        key: "ok",
        label: "No Ritmo / OK",
        detail: "Mantendo o ritmo atual, entrega dentro da jornada.",
        gap
        };
    }

    const deficitPct = gap / Math.max(targetTotal, 1);
    if (deficitPct <= state.timelineStatusTolerancePct) {
        return {
        key: "warn",
        label: "Atenção",
        detail: `Abaixo da meta em ${fmtPct(deficitPct * 100)} (limite ${fmtPct(state.timelineStatusTolerancePct * 100)}).`,
        gap
        };
    }

    return {
        key: "critical",
        label: "Critico",
        detail: `Deficit projetado de ${fmtPct(deficitPct * 100)} ate o fim da jornada.`,
        gap
    };
    }

    function getTimelineBreakLabels() {
    const list = [];
    if (state.config.lunchStartMin !== state.config.lunchEndMin) {
        list.push({
        start: state.config.lunchStartMin,
        end: state.config.lunchEndMin,
        label: "Almoço"
        });
    }
    return list;
    }

    function renderOperationTimeline() {
    const total = Math.max(getTotalDemandLines(), 1);
    const separated = getTotalSeparatedLines();
    const remaining = Math.max(total - separated, 0);
    const now = state.simulatedMinutes;
    const start = getCurrentShiftStart(now);
    const shiftEnd = Math.max(getCurrentShiftEnd(now), now + 1);
    const end = Math.max(getTimelineWindowEnd(now), now + 1);
    const totalSpan = Math.max(end - start, 1);
    const rate = Math.max(getProjectionRate(), 0);
    const windowForecast = buildScopeForecastSeries("__total__", now, end);
    const projectedAdd = Math.min(remaining, windowForecast.projectedLines);
    const projectedTotal = Math.min(total, separated + projectedAdd);
    const realPct = clamp((separated / total) * 100, 0, 100);
    const projectedPct = clamp((projectedTotal / total) * 100, 0, 100);
    const projectedExtraPct = Math.max(projectedPct - realPct, 0);
    const nowPos = clamp(((now - start) / totalSpan) * 100, 0, 100);
    const pastWidth = nowPos;
    const futureWidth = Math.max(100 - nowPos, 0);

    const etaForecast = end >= shiftEnd
        ? windowForecast
        : buildScopeForecastSeries("__total__", now, shiftEnd);
    const etaMinutes = remaining > 0 ? etaForecast.finishMinute : now;
    const etaInsideWindow = etaMinutes !== null && etaMinutes <= end;

    ui.timelinePastSegment.style.width = `${pastWidth.toFixed(2)}%`;
    ui.timelineFutureSegment.style.width = `${futureWidth.toFixed(2)}%`;
    ui.timelineNowMarker.style.left = `${nowPos.toFixed(2)}%`;

    if (etaInsideWindow) {
        const completionPos = clamp(((etaMinutes - start) / totalSpan) * 100, 0, 100);
        ui.timelineCompletionMarker.style.display = "block";
        ui.timelineCompletionMarker.style.left = `${completionPos.toFixed(2)}%`;
    } else {
        ui.timelineCompletionMarker.style.display = "none";
    }

    ui.timelineRealProgress.style.width = `${realPct.toFixed(2)}%`;
    ui.timelineProjectedProgress.style.left = `${realPct.toFixed(2)}%`;
    ui.timelineProjectedProgress.style.width = `${projectedExtraPct.toFixed(2)}%`;

    ui.timelinePastValue.textContent = `${fmtInt(separated)} linhas`;
    ui.timelinePastSub.textContent = `${fmtPct(realPct)} concluído até agora`;
    ui.timelineNowValue.textContent = formatSimulatedClock(now);
    const rateModeLabel = state.timelineRateMode === "last-hour"
        ? "janela 60min"
        : "ewma operacional";
    ui.timelineNowSub.textContent = `Ritmo ${fmtInt(rate)} l/h (${rateModeLabel})`;
    ui.timelineFutureValue.textContent = `+${fmtInt(projectedAdd)} linhas`;
    ui.timelineFutureSub.textContent = `${fmtPct(projectedPct)} projetado ate ${formatSimulatedClock(end)}`;

    if (remaining <= 0) {
        ui.timelineEtaValue.textContent = "Concluído";
        ui.timelineEtaSub.textContent = "Demanda totalmente finalizada";
    } else if (etaMinutes === null) {
        ui.timelineEtaValue.textContent = "Sem previsão";
        ui.timelineEtaSub.textContent = "Sem ritmo suficiente para projetar ETA";
    } else {
        ui.timelineEtaValue.textContent = formatSimulatedClock(etaMinutes);
        ui.timelineEtaSub.textContent = etaInsideWindow
        ? "Conclusão dentro da janela selecionada"
        : "Conclusão após a janela selecionada";
    }

    ui.timelineStartLabel.textContent = `Inicio: ${formatSimulatedClock(start)}`;
    ui.timelineCurrentLabel.textContent = `Agora: ${formatSimulatedClock(now)}`;
    ui.timelineEndLabel.textContent = `Fim da janela: ${formatSimulatedClock(end)}`;

    renderTimelineHistory(start, now, shiftEnd, separated, projectedTotal, total);
    }

    function getLunchSegmentsInWindow(start, end) {
    const breaks = getTimelineBreakLabels();
    const segments = [];

    breaks.forEach((item) => {
        const firstMinute = Math.floor(start);
        const lastMinute = Math.ceil(end);
        let activeStart = null;

        for (let minute = firstMinute; minute <= lastMinute; minute++) {
        const minuteOfDay = ((minute % (24 * 60)) + (24 * 60)) % (24 * 60);
        const inBreak = isTimeInRange(minuteOfDay, item.start, item.end);
        const inWork = isTimeInRange(minuteOfDay, state.config.workStartMin, state.config.workEndMin);
        const active = inBreak && inWork;

        if (active && activeStart === null) activeStart = minute;
        if (!active && activeStart !== null) {
            segments.push({ start: activeStart, end: minute, label: item.label });
            activeStart = null;
        }
        }

        if (activeStart !== null) {
        segments.push({ start: activeStart, end: lastMinute, label: item.label });
        }
    });

    return segments.filter((segment) => segment.end > segment.start);
    }

    function buildTimelineSamplingMinutes(history, shiftStart, nowMinute, shiftEnd) {
    const result = new Set();
    const addMinute = (minute) => {
        if (!Number.isFinite(minute)) return;
        if (minute < shiftStart || minute > shiftEnd) return;
        result.add(Math.round(minute * 1000) / 1000);
    };

    addMinute(shiftStart);
    addMinute(nowMinute);
    addMinute(shiftEnd);

    history.forEach((point) => addMinute(point.minute));
    getLunchSegmentsInWindow(shiftStart, shiftEnd).forEach((segment) => {
        addMinute(segment.start);
        addMinute(segment.end);
    });

    const step = 10;
    const firstStep = Math.ceil(shiftStart / step) * step;
    for (let minute = firstStep; minute < shiftEnd; minute += step) {
        addMinute(minute);
    }

    return Array.from(result).sort((a, b) => a - b);
    }

    function computeMetaAccumValue(minute, context) {
    if (!Number.isFinite(context.requiredLPHNow)) return null;
    if (context.targetTotal <= 0) return null;

    if (minute <= context.nowMinute) {
        const workedHoursBack = getWorkingMinutesBetween(minute, context.nowMinute) / 60;
        return clamp(context.producedNow - (context.requiredLPHNow * workedHoursBack), 0, context.targetTotal);
    }

    const workedHoursForward = getWorkingMinutesBetween(context.nowMinute, minute) / 60;
    return clamp(context.producedNow + (context.requiredLPHNow * workedHoursForward), 0, context.targetTotal);
    }

    function computeForecastAccumValue(minute, context) {
    if (minute < context.nowMinute) return null;
    if (Array.isArray(context.forecastSeries) && context.forecastSeries.length) {
        const projectedExtra = getProducedAtMinute(context.forecastSeries, minute);
        const projected = Math.max(0, context.producedNow + projectedExtra);
        if (context.targetTotal > 0) {
        return clamp(projected, 0, context.targetTotal);
        }
        return projected;
    }

    if (!Number.isFinite(context.avgLPHNow) || context.avgLPHNow <= 0) return null;
    const workedHours = getWorkingMinutesBetween(context.nowMinute, minute) / 60;
    const projected = Math.max(0, context.producedNow + (context.avgLPHNow * workedHours));
    if (context.targetTotal > 0) {
        return clamp(projected, 0, context.targetTotal);
    }
    return projected;
    }

    function computeRequiredLPHAtMinute(minute, producedReference, shiftEndMinute, targetTotal) {
    const remainingLines = Math.max(targetTotal - producedReference, 0);
    if (remainingLines <= 0) return 0;
    const remainingWorkHours = getWorkingMinutesBetween(minute, shiftEndMinute) / 60;
    if (remainingWorkHours <= 0) return null;
    return remainingLines / remainingWorkHours;
    }

    function resolveTimelineTooltipMetrics(minute) {
    const context = state.timelineTooltipContext;
    if (!context) return null;

    const safeMinute = clamp(minute, context.shiftStart, context.shiftEnd);
    const producedAt = safeMinute <= context.nowMinute
        ? getProducedAtMinute(context.history, safeMinute)
        : context.producedNow;
    const avgLPH = safeMinute <= context.nowMinute
        ? getMovingAverageLPH(context.history, safeMinute, context.windowMinutes)
        : context.avgLPHNow;
    const metaAccum = computeMetaAccumValue(safeMinute, context);
    const forecastAccum = computeForecastAccumValue(safeMinute, context);
    const comparisonReal = safeMinute <= context.nowMinute
        ? producedAt
        : (Number.isFinite(forecastAccum) ? forecastAccum : context.producedNow);
    const requiredLPH = computeRequiredLPHAtMinute(
        safeMinute,
        comparisonReal,
        context.shiftEnd,
        context.targetTotal
    );
    const diff = Number.isFinite(metaAccum) ? comparisonReal - metaAccum : null;

    return {
        minute: safeMinute,
        producedAt,
        avgLPH,
        requiredLPH,
        metaAccum,
        forecastAccum,
        diff,
        comparisonReal
    };
    }

    function applyTimelineKpiTone(valueEl, subEl, tone) {
    KPI_TONE_CLASSES.forEach((className) => {
        valueEl.classList.remove(className);
        subEl.classList.remove(className);
    });

    const nextClass = KPI_TONE_CLASSES.includes(tone) ? tone : "kpi-tone-off";
    valueEl.classList.add(nextClass);
    subEl.classList.add(nextClass);
    }

    function renderTimelineHistoryKpis(summary) {
    const hasTarget = summary.targetTotal > 0;
    const hasForecast = Number.isFinite(summary.forecastEndTotal);
    const hasAvg = Number.isFinite(summary.avgLPHNow) && summary.avgLPHNow > 0;
    const hasRequired = Number.isFinite(summary.requiredLPHNow);

    if (!hasTarget) {
        ui.timelineKpiDeltaValue.textContent = "Sem meta";
        ui.timelineKpiDeltaSub.textContent = `Produzido: ${fmtInt(summary.producedNow)} linhas`;
        applyTimelineKpiTone(ui.timelineKpiDeltaValue, ui.timelineKpiDeltaSub, "kpi-tone-off");
    } else if (!hasForecast && summary.requiredLines > 0) {
        ui.timelineKpiDeltaValue.textContent = "--";
        ui.timelineKpiDeltaSub.textContent = "Sem previsão para calcular diferença.";
        applyTimelineKpiTone(ui.timelineKpiDeltaValue, ui.timelineKpiDeltaSub, "kpi-tone-warn");
    } else {
        const forecastBase = hasForecast ? summary.forecastEndTotal : summary.producedNow;
        const deltaToFinish = forecastBase - summary.targetTotal;
        const deltaPct = Math.abs(deltaToFinish) / Math.max(summary.targetTotal, 1);
        const gapTone = deltaToFinish >= 0
        ? "kpi-tone-ok"
        : (deltaPct <= state.timelineStatusTolerancePct ? "kpi-tone-warn" : "kpi-tone-critical");

        ui.timelineKpiDeltaValue.textContent = `${deltaToFinish >= 0 ? "+" : "-"}${fmtInt(Math.abs(deltaToFinish))} linhas`;
        ui.timelineKpiDeltaSub.textContent = deltaToFinish >= 0
        ? "Adiantado na previsão final."
        : "Atraso previsto no fechamento.";
        applyTimelineKpiTone(ui.timelineKpiDeltaValue, ui.timelineKpiDeltaSub, gapTone);
    }

    const avgText = hasAvg ? `${fmtInt(summary.avgLPHNow)} LPH` : "--";
    let reqText = "--";
    if (hasTarget && summary.requiredLines <= 0) {
        reqText = "0 LPH";
    } else if (hasRequired) {
        reqText = `${fmtInt(summary.requiredLPHNow)} LPH`;
    }

    ui.timelineKpiRatesValue.textContent = `${avgText} / ${reqText}`;
    if (!hasTarget) {
        ui.timelineKpiRatesSub.textContent = "Sem meta para comparar ritmo necessário.";
        applyTimelineKpiTone(ui.timelineKpiRatesValue, ui.timelineKpiRatesSub, "kpi-tone-off");
    } else if (summary.requiredLines <= 0) {
        ui.timelineKpiRatesSub.textContent = "Meta ja atingida.";
        applyTimelineKpiTone(ui.timelineKpiRatesValue, ui.timelineKpiRatesSub, "kpi-tone-ok");
    } else if (!hasAvg || !hasRequired) {
        ui.timelineKpiRatesSub.textContent = "Dados insuficientes para comparar ritmo.";
        applyTimelineKpiTone(ui.timelineKpiRatesValue, ui.timelineKpiRatesSub, "kpi-tone-warn");
    } else if (summary.avgLPHNow >= summary.requiredLPHNow) {
        ui.timelineKpiRatesSub.textContent = "Ritmo atual suficiente para fechar no prazo.";
        applyTimelineKpiTone(ui.timelineKpiRatesValue, ui.timelineKpiRatesSub, "kpi-tone-ok");
    } else {
        ui.timelineKpiRatesSub.textContent = "Ritmo atual abaixo do necessário.";
        applyTimelineKpiTone(ui.timelineKpiRatesValue, ui.timelineKpiRatesSub, "kpi-tone-critical");
    }

    if (!hasForecast && summary.requiredLines > 0) {
        ui.timelineKpiForecastValue.textContent = "Sem previsão";
        ui.timelineKpiForecastSub.textContent = "Ritmo insuficiente para estimar fechamento.";
        applyTimelineKpiTone(ui.timelineKpiForecastValue, ui.timelineKpiForecastSub, "kpi-tone-warn");
        return;
    }

    ui.timelineKpiForecastValue.textContent = hasForecast
        ? `${fmtInt(summary.forecastEndTotal)} linhas`
        : `${fmtInt(summary.producedNow)} linhas`;

    if (!hasTarget) {
        ui.timelineKpiForecastSub.textContent = "Escopo sem meta definida.";
        applyTimelineKpiTone(ui.timelineKpiForecastValue, ui.timelineKpiForecastSub, "kpi-tone-off");
        return;
    }

    if (summary.requiredLines <= 0) {
        ui.timelineKpiForecastSub.textContent = "Meta ja concluida no escopo selecionado.";
        applyTimelineKpiTone(ui.timelineKpiForecastValue, ui.timelineKpiForecastSub, "kpi-tone-ok");
        return;
    }

    const finishInShift = summary.finishMinute !== null && summary.finishMinute <= summary.shiftEnd;
    const remainingForMeta = Math.max(summary.targetTotal - (summary.forecastEndTotal || 0), 0);
    if (finishInShift || remainingForMeta <= 0) {
        ui.timelineKpiForecastSub.textContent = summary.finishMinute !== null
        ? `Entrega prevista ate ${formatSimulatedClock(summary.finishMinute)}.`
        : "Mantendo o ritmo, meta no prazo.";
        applyTimelineKpiTone(ui.timelineKpiForecastValue, ui.timelineKpiForecastSub, "kpi-tone-ok");
    } else {
        ui.timelineKpiForecastSub.textContent = `Falta prevista: ${fmtInt(remainingForMeta)} linhas.`;
        applyTimelineKpiTone(ui.timelineKpiForecastValue, ui.timelineKpiForecastSub, "kpi-tone-critical");
    }
    }

    function renderTimelineCompactSummary(summary) {
    ui.timelineSummaryStatus.textContent = summary.status.label;
    ui.timelineSummaryStatus.classList.remove("ok", "warn", "critical", "off");
    ui.timelineSummaryStatus.classList.add(summary.status.key);
    ui.timelineSummaryStatusSub.textContent = `${summary.scopeLabel}: ${summary.status.detail}`;

    ui.timelineSummaryAvg.textContent = Number.isFinite(summary.avgLPHNow)
        ? `${fmtInt(summary.avgLPHNow)} l/h`
        : "-- l/h";
    ui.timelineSummaryAvgSub.textContent = `Janela movel: ${summary.windowMinutes} min`;

    if (summary.requiredLines <= 0) {
        ui.timelineSummaryEta.textContent = "Meta atingida";
        ui.timelineSummaryEtaSub.textContent = `Fechou em ${formatSimulatedClock(summary.nowMinute)}.`;
        return;
    }

    if (!summary.hasForecastNow) {
        ui.timelineSummaryEta.textContent = "Sem previsão";
        ui.timelineSummaryEtaSub.textContent = "Ritmo insuficiente para estimar fechamento.";
        return;
    }

    if (summary.finishMinute === null) {
        ui.timelineSummaryEta.textContent = "Apos jornada";
        ui.timelineSummaryEtaSub.textContent = `Projeção final: ${fmtInt(summary.forecastEndTotal)} / ${fmtInt(summary.targetTotal)} linhas`;
        return;
    }

    ui.timelineSummaryEta.textContent = formatSimulatedClock(summary.finishMinute);
    ui.timelineSummaryEtaSub.textContent = summary.finishMinute <= summary.shiftEnd
        ? "Previsão de fechamento dentro do turno."
        : "Previsão de fechamento após o turno.";
    }

    function renderTimelineHistory(shiftStart, nowMinute, shiftEnd, _separated, _projectedTotal, _total) {
    ensureTimelineHistoryChart();
    if (!state.timelineHistoryChart) return;

    const chart = state.timelineHistoryChart;
    const scope = getTimelineScopeMeta(state.timelineHistorySector);
    const history = buildScopeHistory(
        state.timelineHistorySector,
        shiftStart,
        nowMinute,
        scope.producedNow
    );

    const remainingWorkMinutes = getWorkingMinutesBetween(nowMinute, shiftEnd);
    const remainingWorkHours = remainingWorkMinutes / 60;
    const remainingBreakMinutes = getBreakMinutesBetween(nowMinute, shiftEnd);
    const requiredLines = Math.max(scope.targetTotal - scope.producedNow, 0);
    const avgLPHNow = getMovingAverageLPH(history, nowMinute, state.timelineHistoryWindowMinutes);
    const scopeForecast = buildScopeForecastSeries(state.timelineHistorySector, nowMinute, shiftEnd);
    const hasForecastNow = requiredLines <= 0 || (scopeForecast.projectedLines > 0);
    let forecastEndTotal = hasForecastNow ? scope.producedNow + scopeForecast.projectedLines : null;
    if (Number.isFinite(forecastEndTotal) && scope.targetTotal > 0) {
        forecastEndTotal = clamp(forecastEndTotal, 0, scope.targetTotal);
    }
    const forecastForStatus = Number.isFinite(forecastEndTotal)
        ? forecastEndTotal
        : scope.producedNow;
    const requiredLPHNow = requiredLines <= 0
        ? 0
        : (remainingWorkHours > 0 ? requiredLines / remainingWorkHours : null);
    const finishMinute = requiredLines <= 0 ? nowMinute : scopeForecast.finishMinute;
    const workedSinceShiftStart = getWorkingMinutesBetween(shiftStart, nowMinute);
    const hasMinimumData = workedSinceShiftStart >= 5 || scope.producedNow > 0;
    const status = hasMinimumData
        ? getTimelineStatus(requiredLines, scope.targetTotal, forecastForStatus)
        : {
            key: "off",
            label: "Sem dados",
            detail: "Aguardando dados iniciais para classificar o ritmo.",
            gap: 0
        };

    renderTimelineCompactSummary({
        status,
        scopeLabel: scope.label,
        avgLPHNow,
        windowMinutes: state.timelineHistoryWindowMinutes,
        finishMinute,
        requiredLines,
        forecastEndTotal: forecastForStatus,
        hasForecastNow,
        targetTotal: scope.targetTotal,
        nowMinute,
        shiftEnd
    });

    renderTimelineHistoryKpis({
        targetTotal: scope.targetTotal,
        producedNow: scope.producedNow,
        requiredLines,
        avgLPHNow,
        requiredLPHNow,
        forecastEndTotal,
        hasForecastNow,
        remainingWorkHours,
        remainingBreakMinutes,
        finishMinute,
        shiftEnd
    });

    state.timelineTooltipContext = {
        scopeLabel: scope.label,
        shiftStart,
        shiftEnd,
        nowMinute,
        history,
        targetTotal: scope.targetTotal,
        producedNow: scope.producedNow,
        avgLPHNow,
        requiredLPHNow,
        forecastEndTotal,
        forecastSeries: scopeForecast.series,
        remainingWorkHoursNow: remainingWorkHours,
        remainingBreakMinutesNow: remainingBreakMinutes,
        hasForecastNow,
        windowMinutes: state.timelineHistoryWindowMinutes
    };

    if (!state.timelineHistoryExpanded) return;

    const sampleMinutes = buildTimelineSamplingMinutes(history, shiftStart, nowMinute, shiftEnd);
    const realAccumData = [];
    const metaAccumData = [];
    const forecastAccumData = [];
    const realIntervalData = [];
    const requiredIntervalData = [];
    const forecastIntervalData = [];

    sampleMinutes.forEach((minute) => {
        const metrics = resolveTimelineTooltipMetrics(minute);
        if (!metrics) return;

        const realAccum = minute <= nowMinute ? metrics.producedAt : null;
        const metaAccum = metrics.metaAccum;
        const forecastAccum = metrics.forecastAccum;

        realAccumData.push({ x: minute, y: Number.isFinite(realAccum) ? realAccum : null });
        metaAccumData.push({ x: minute, y: Number.isFinite(metaAccum) ? metaAccum : null });
        forecastAccumData.push({ x: minute, y: Number.isFinite(forecastAccum) ? forecastAccum : null });

        const intervalReal = minute <= nowMinute ? metrics.avgLPH : null;
        const intervalRequired = metrics.requiredLPH;
        const intervalForecast = minute >= nowMinute ? avgLPHNow : null;
        realIntervalData.push({ x: minute, y: Number.isFinite(intervalReal) ? intervalReal : null });
        requiredIntervalData.push({ x: minute, y: Number.isFinite(intervalRequired) ? intervalRequired : null });
        forecastIntervalData.push({ x: minute, y: Number.isFinite(intervalForecast) ? intervalForecast : null });
    });

    const isIntervalMode = state.timelineHistoryMode === "interval";
    const realData = isIntervalMode ? realIntervalData : realAccumData;
    const requiredData = isIntervalMode ? requiredIntervalData : metaAccumData;
    const forecastData = isIntervalMode ? forecastIntervalData : forecastAccumData;
    const nowPointY = isIntervalMode
        ? (Number.isFinite(avgLPHNow) ? avgLPHNow : requiredLPHNow)
        : scope.producedNow;

    chart.data.datasets[0].label = isIntervalMode ? "LPH Médio" : "Produção Real";
    chart.data.datasets[1].label = isIntervalMode ? "LPH Necessário" : "Meta Dinâmica";
    chart.data.datasets[2].label = isIntervalMode ? "LPH Previsto" : "Previsão";
    chart.data.datasets[0].fill = !isIntervalMode;
    chart.data.datasets[0].data = realData;
    chart.data.datasets[1].data = requiredData;
    chart.data.datasets[2].data = forecastData;
    chart.data.datasets[3].data = Number.isFinite(nowPointY)
        ? [{ x: nowMinute, y: Math.max(nowPointY, 0) }]
        : [];

    const combinedValues = [
        ...realData.map((item) => item.y),
        ...requiredData.map((item) => item.y),
        ...forecastData.map((item) => item.y),
        nowPointY
    ].filter((value) => Number.isFinite(value) && value >= 0);

    const maxY = combinedValues.length ? Math.max(...combinedValues) : 1;

    chart.options.scales.x.min = shiftStart;
    chart.options.scales.x.max = shiftEnd;
    chart.options.scales.y.suggestedMax = Math.max(1, maxY * 1.1);
    chart.options.scales.y.title = {
        display: true,
        text: isIntervalMode ? "Linhas por Hora (LPH)" : "Linhas Acumuladas",
        color: "#64748b",
        font: {
        size: 11,
        weight: "700"
        }
    };
    chart.options.plugins.timelineLunchBands.segments = getLunchSegmentsInWindow(shiftStart, shiftEnd);
    chart.options.plugins.timelineNowMarker.nowMinute = nowMinute;
    chart.update("none");
    }

    function requestRender() {
    if (renderFrameId !== null) return;
    renderFrameId = requestAnimationFrame(() => {
        renderFrameId = null;
        renderAll();
    });
    }

    function renderAll() {
    const visible = getVisibleSectors();
    renderKPIs(visible);
    renderOperationTimeline();
    renderMainTable(visible);
    renderTimestamp();
    renderClock();
    renderSortStates();

    if (ui.chartModal.classList.contains("show")) renderChart();
    if (ui.detailModal.classList.contains("show") && ui.detailModal.dataset.mode) {
        openDetailModal(ui.detailModal.dataset.mode, true);
    }
    }

    function renderKPIs(visible) {
    const totalSetores = visible.length;
    const linhasSeparadas = visible.reduce((sum, item) => sum + item.linhasSeparadas, 0);
    const linhasRestantes = visible.reduce((sum, item) => sum + item.linhasRestantes, 0);
    const total = linhasSeparadas + linhasRestantes;
    const pct = total > 0 ? (linhasSeparadas / total) * 100 : 0;

    ui.kpiSetores.textContent = fmtInt(totalSetores);
    ui.kpiSeparadas.textContent = fmtInt(linhasSeparadas);
    ui.kpiRestantes.textContent = fmtInt(linhasRestantes);
    ui.kpiPct.textContent = fmtPct(pct);
    ui.ring.style.setProperty("--pct", String(clamp(pct, 0, 100)));
    ui.ringText.textContent = `${Math.round(pct)}%`;
    }

    function renderMainTable(visible) {
    if (!visible.length) {
        ui.tableBody.innerHTML = `
        <tr class="empty-row">
            <td colspan="8" class="empty">Nenhum setor encontrado para o filtro aplicado.</td>
        </tr>
        `;
        return;
    }

    const emptyRow = ui.tableBody.querySelector(".empty-row");
    if (emptyRow) emptyRow.remove();

    const visibleKeys = new Set(visible.map((sector) => sector.setor));

    Array.from(ui.tableBody.querySelectorAll("tr[data-sector-key]")).forEach((row) => {
        if (!visibleKeys.has(row.dataset.sectorKey)) row.remove();
    });

    const deliveryContext = buildDeliveryContext();
    visible.forEach((sector, index) => {
        let row = tableRowsBySector.get(sector.setor);
        if (!row) {
        row = createMainTableRow(sector.setor);
        tableRowsBySector.set(sector.setor, row);
        }

        updateMainTableRow(row, sector, deliveryContext);

        const currentRowAtIndex = ui.tableBody.children[index];
        if (currentRowAtIndex !== row) {
        ui.tableBody.insertBefore(row, currentRowAtIndex || null);
        }
    });
    }

    function createMainTableRow(sectorKey) {
    const row = document.createElement("tr");
    row.dataset.sectorKey = sectorKey;
    row.innerHTML = `
        <td class="sector-cell">
        <div class="sector-cell-container">
            <div class="sector-avatar" data-role="avatar"></div>
            <div>
            <div class="sector-name" data-role="sector-name"></div>
            <div class="sector-code" data-role="sector-code"></div>
            </div>
        </div>
        </td>
        <td class="description-cell" data-role="description"></td>
        <td class="number-cell text-success">
        <div class="cell-inline">
            <span data-role="separadas"></span>
            <span class="status-badge status-high"><span class="status-indicator"></span></span>
        </div>
        </td>
        <td class="number-cell text-danger">
        <div class="cell-inline">
            <span data-role="restantes"></span>
            <span class="status-badge" data-role="restantes-badge"><span class="status-indicator"></span></span>
        </div>
        </td>
        <td class="number-cell text-warning">
        <div class="cell-inline">
            <span data-role="containers"></span>
            <span class="status-badge" data-role="containers-badge"><span class="status-indicator"></span></span>
        </div>
        </td>
        <td class="number-cell" data-role="totais"></td>
        <td>
        <div class="progress-cell">
            <div class="progress-container">
            <div class="progress-bar" data-role="progress-bar"></div>
            <span class="progress-label" data-role="progress-label"></span>
            </div>
            <span class="status-badge" data-role="progress-status-badge">
            <span class="status-indicator"></span><span data-role="progress-status-text"></span>
            </span>
        </div>
        </td>
        <td class="number-cell">
        <div class="cell-inline end">
            <span data-role="linhas-h"></span>
            <span class="status-indicator" data-role="linhas-h-dot"></span>
        </div>
        </td>
    `;

    row._refs = {
        avatar: row.querySelector("[data-role='avatar']"),
        sectorName: row.querySelector("[data-role='sector-name']"),
        sectorCode: row.querySelector("[data-role='sector-code']"),
        description: row.querySelector("[data-role='description']"),
        separadas: row.querySelector("[data-role='separadas']"),
        restantes: row.querySelector("[data-role='restantes']"),
        restantesBadge: row.querySelector("[data-role='restantes-badge']"),
        containers: row.querySelector("[data-role='containers']"),
        containersBadge: row.querySelector("[data-role='containers-badge']"),
        totais: row.querySelector("[data-role='totais']"),
        progressBar: row.querySelector("[data-role='progress-bar']"),
        progressLabel: row.querySelector("[data-role='progress-label']"),
        progressStatusBadge: row.querySelector("[data-role='progress-status-badge']"),
        progressStatusText: row.querySelector("[data-role='progress-status-text']"),
        linhasHora: row.querySelector("[data-role='linhas-h']"),
        linhasHoraDot: row.querySelector("[data-role='linhas-h-dot']")
    };

    return row;
    }

    function updateMainTableRow(row, sector, context) {
    const refs = row._refs;
    const pct = clamp(sector.progresso, 0, 100);
    const statusMeta = classifyMeta(sector, context);
    sector.statusMeta = statusMeta;
    const linhasHoraMedia = statusMeta.effectiveRate;
    const avatar = sector.setor.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase() || "SR";

    refs.avatar.textContent = avatar;
    refs.sectorName.textContent = sector.setor;
    refs.sectorCode.textContent = `Setor ${sector.setor}`;
    refs.description.textContent = sector.descricao;
    refs.description.title = sector.descricao;
    refs.separadas.textContent = fmtInt(sector.linhasSeparadas);
    refs.restantes.textContent = fmtInt(sector.linhasRestantes);
    refs.containers.textContent = fmtInt(sector.containersRestantes);
    refs.totais.textContent = fmtInt(sector.linhasTotais);

    setStatusBadgeClass(refs.restantesBadge, sector.linhasRestantes > 0 ? "status-low" : "status-high");
    setStatusBadgeClass(refs.containersBadge, sector.containersRestantes > 0 ? "status-medium" : "status-high");
    setStatusBadgeClass(refs.progressStatusBadge, statusMeta.badgeClass || "status-meta");

    refs.progressBar.style.width = `${pct.toFixed(1)}%`;
    refs.progressBar.style.backgroundColor = statusMeta.barColor || "#64748b";
    refs.progressLabel.textContent = fmtPct(pct);
    refs.progressLabel.classList.toggle("light", pct >= 45);
    refs.progressLabel.classList.toggle("dark", pct < 45);
    refs.progressStatusText.textContent = statusMeta.label;

    refs.linhasHora.textContent = `${fmtInt(linhasHoraMedia)} l/h`;
    const rateNeeded = Number.isFinite(statusMeta.requiredRate) ? `${fmtInt(statusMeta.requiredRate)} l/h` : "--";
    const productiveRate = Number.isFinite(sector.lphProductiveEwma) && sector.lphProductiveEwma > 0
        ? `${fmtInt(sector.lphProductiveEwma)} l/h`
        : "--";
    refs.linhasHoraDot.title = `${statusMeta.label} | LPH operacional ${fmtInt(statusMeta.effectiveRate)} l/h | LPH produtivo ${productiveRate} | Necessário ${rateNeeded}`;
    setStatusDotClass(refs.linhasHoraDot, statusMeta.dotClass || "dot-meta");
    }

    function setStatusBadgeClass(element, statusClass) {
    element.classList.remove(...BADGE_STATUS_CLASSES);
    element.classList.add("status-badge", statusClass);
    }

    function setStatusDotClass(element, dotClass) {
    element.classList.remove(...DOT_STATUS_CLASSES);
    element.classList.add(dotClass);
    }

    function renderSortStates() {
    ui.sortHeaders.forEach((header) => {
        const isActive = header.dataset.sort === state.sortKey;
        header.classList.toggle("sort-active", isActive);
        header.classList.toggle("sorted", isActive);
        header.classList.remove("sorted-asc", "sorted-desc");
        if (isActive) {
        header.classList.add(state.sortDir === "asc" ? "sorted-asc" : "sorted-desc");
        }
    });
    }

    function renderTimestamp() {
    const now = new Date();
    const time = now.toLocaleTimeString("pt-BR");
    ui.timestamp.textContent =
        `Atualizado: ${time} | Simulação local com dados fictícios.`;
    }

    function renderClock() {
    ui.simClock.textContent = formatSimulatedClock(state.simulatedMinutes);
    ui.hourRef.textContent = `${pad2(Math.floor(state.simulatedMinutes / 60) % 24)}:00`;
    const minuteOfDay = Math.floor(state.simulatedMinutes % (24 * 60));
    const operation = getOperationState(minuteOfDay);
    ui.shiftStatus.textContent = operation.label;
    ui.shiftStatus.classList.remove("status-run", "status-break", "status-off");
    ui.shiftStatus.classList.add(operation.className);
    }

    function updateSpeedLabel() {
    const sec = state.secondsPerProdHour;
    ui.speedLabel.textContent = sec === 60 ? "1h = 1min" : `1h = ${sec}s`;
    }

    function openDetailModal(mode, keepOpen) {
    ui.detailModal.dataset.mode = mode;
    const list = [...state.sectors];

    let title = "Detalhes";
    let subtitle = "";
    let headers = [];
    let rows = [];
    let summary = [];

    if (mode === "setores") {
        title = "Detalhes dos Setores";
        subtitle = "Visao geral de totais por setor.";
        headers = ["Setor", "Descrição", "Linhas Totais", "Containers", "Itens", "Peso Previsto"];
        rows = list.map((sector) => [
        sector.setor,
        sector.descricao,
        fmtInt(sector.linhasTotais),
        fmtInt(sector.containersTotais),
        fmtInt(sector.itensTotais),
        fmtKg(sector.pesoPrevisto)
        ]);
        summary = [
        ["Total de Setores", fmtInt(list.length)],
        ["Total Linhas", fmtInt(sum(list, "linhasTotais"))],
        ["Total Containers", fmtInt(sum(list, "containersTotais"))],
        ["Peso Previsto", fmtKg(sum(list, "pesoPrevisto"))]
        ];
    } else if (mode === "separadas") {
        title = "Linhas Separadas por Setor";
        subtitle = "Produção já separada na simulação.";
        headers = ["Setor", "Descrição", "Linhas Separadas", "Peso Separado", "Containers Sep.", "Itens Sep."];
        rows = list.map((sector) => [
        sector.setor,
        sector.descricao,
        fmtInt(sector.linhasSeparadas),
        fmtKg(sector.pesoSeparado),
        fmtInt(sector.containersSeparados),
        fmtInt(sector.itensSeparados)
        ]);
        summary = [
        ["Linhas Separadas", fmtInt(sum(list, "linhasSeparadas"))],
        ["Peso Separado", fmtKg(sum(list, "pesoSeparado"))],
        ["Containers Sep.", fmtInt(sum(list, "containersSeparados"))],
        ["Itens Sep.", fmtInt(sum(list, "itensSeparados"))]
        ];
    } else if (mode === "restantes") {
        title = "Linhas Restantes por Setor";
        subtitle = "Volume pendente e prioridade de ataque.";
        headers = ["Setor", "Descrição", "Linhas Restantes", "Peso Restante", "Containers Rest.", "Itens Rest.", "Prioridade"];
        rows = list.map((sector) => [
        sector.setor,
        sector.descricao,
        fmtInt(sector.linhasRestantes),
        fmtKg(sector.pesoRestante),
        fmtInt(sector.containersRestantes),
        fmtInt(sector.itensRestantes),
        sector.prioridade
        ]);
        summary = [
        ["Setores Pendentes", fmtInt(list.filter((sector) => sector.linhasRestantes > 0).length)],
        ["Linhas Restantes", fmtInt(sum(list, "linhasRestantes"))],
        ["Containers Rest.", fmtInt(sum(list, "containersRestantes"))],
        ["Itens Rest.", fmtInt(sum(list, "itensRestantes"))]
        ];
    } else if (mode === "progresso") {
        const deliveryContext = buildDeliveryContext();
        title = "Progresso por Setor";
        subtitle = "Status calculado por chance de entregar ate o fim da jornada.";
        headers = ["Setor", "Descrição", "Progresso", "Linhas/h", "Necessário", "Status"];
        rows = list.map((sector) => {
        const status = classifyMeta(sector, deliveryContext);
        return [
            sector.setor,
            sector.descricao,
            fmtPct(sector.progresso),
            `${fmtInt(status.effectiveRate)} l/h`,
            Number.isFinite(status.requiredRate) ? `${fmtInt(status.requiredRate)} l/h` : "--",
            status.label
        ];
        });
        summary = [
        ["Progresso Geral", fmtPct((sum(list, "linhasSeparadas") / Math.max(1, sum(list, "linhasTotais"))) * 100)],
        ["Setores Concluídos", fmtInt(list.filter((sector) => sector.linhasRestantes <= 0).length)],
        ["Média Linhas/h", `${fmtInt(list.reduce((acc, sector) => acc + getAverageLinesPerHour(sector), 0) / Math.max(1, list.length))} l/h`],
        ["Média Últ. Hora", fmtInt(sum(list, "producaoHoraAnterior") / Math.max(1, list.length))],
        ["Horario Simulado", formatSimulatedClock(state.simulatedMinutes)]
        ];
    }

    ui.detailTitle.textContent = title;
    ui.detailSubtitle.textContent = subtitle;
    const primarySummaryIndex = mode === "setores" ? 0 : -1;

    ui.detailSummary.innerHTML = summary.map((item, index) => `
        <div class="sum-box modal-stat ${index === primarySummaryIndex ? "modal-stat-primary" : ""}">
        <span class="modal-stat-label">${escapeHtml(String(item[0]))}</span>
        <span class="modal-stat-value">${escapeHtml(String(item[1]))}</span>
        </div>
    `).join("");

    ui.detailThead.innerHTML = `<tr>${headers.map((item) => `<th>${item}</th>`).join("")}</tr>`;
    ui.detailTbody.innerHTML = rows.map((row) => `
        <tr>${row.map((cell) => `<td>${escapeHtml(String(cell))}</td>`).join("")}</tr>
    `).join("");

    if (!keepOpen) ui.detailModal.classList.add("show");
    }

    function renderChart() {
    let list = [...state.sectors];

    if (state.chartFilter !== "todos") {
        list = list.filter((sector) => categorizeSector(sector.setor) === state.chartFilter);
    }

    sortSectorsByProgress(list);
    if (!list.length) {
        ui.chartList.innerHTML = `<div class="empty">Nenhum setor para o filtro selecionado.</div>`;
        return;
    }

    ui.chartList.innerHTML = list.map((sector) => {
        const pct = clamp(sector.progresso, 0, 100);
        const linhasHora = getAverageLinesPerHour(sector);
        const groupLabel = getChartGroupLabel(categorizeSector(sector.setor));

        return `
        <div class="chart-row">
            <div class="chart-sector">
            <div class="chart-sector-top">
                <span class="chart-sector-code">${escapeHtml(sector.setor)}</span>
                <span class="chart-sector-tag">${escapeHtml(groupLabel)}</span>
            </div>
            <div class="chart-sector-desc">${escapeHtml(sector.descricao)}</div>
            </div>
            <div class="chart-progress">
            <div class="chart-progress-head">
                <span>${fmtInt(sector.linhasSeparadas)} / ${fmtInt(sector.linhasTotais)} linhas</span>
                <span>${fmtPct(pct)}</span>
            </div>
            <div class="chart-track"><i style="width:${pct.toFixed(2)}%"></i></div>
            </div>
            <div class="chart-kpi">
            <span class="chart-kpi-value">${fmtInt(linhasHora)}</span>
            <span class="chart-kpi-label">Linhas/h</span>
            </div>
        </div>
        `;
    }).join("");
    }

    function getChartGroupLabel(categoryKey) {
    if (categoryKey === "fracionado") return "Fracionado";
    if (categoryKey === "carga-grossa") return "Carga Grossa";
    if (categoryKey === "arm-20") return "ARM/20";
    return "Outros";
    }

    function sortSectorsByProgress(list) {
    list.sort((a, b) => b.progresso - a.progresso);
    }

    function categorizeSector(setor) {
    const arm = ["ARMI-2", "ARMI-3", "ARMFRAC", "SETOR24", "20"];
    const fracionado = ["10", "11", "12", "13", "14", "15"];
    const grossa = ["21", "39", "44", "50", "52", "53", "58", "60"];

    if (arm.includes(setor)) return "arm-20";
    if (fracionado.includes(setor)) return "fracionado";
    if (grossa.includes(setor)) return "carga-grossa";
    return "todos";
    }

    function sum(list, key) {
    return list.reduce((acc, item) => acc + Number(item[key] || 0), 0);
    }

    function rand(min, max) {
    return Math.random() * (max - min) + min;
    }

    function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
    }

    function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
    }

    function round2(value) {
    return Math.round(value * 100) / 100;
    }

    function fmtInt(value) {
    return Math.round(value).toLocaleString("pt-BR");
    }

    function fmtPct(value) {
    return `${value.toFixed(1).replace(".", ",")}%`;
    }

    function fmtKg(value) {
    return `${value.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })} kg`;
    }

    function pad2(value) {
    return String(value).padStart(2, "0");
    }

    function formatSimulatedClock(totalMinutes) {
    const day = Math.floor(totalMinutes / (24 * 60)) + 1;
    const hour = Math.floor(totalMinutes / 60) % 24;
    const minute = Math.floor(totalMinutes % 60);
    return `D${day} ${pad2(hour)}:${pad2(minute)}`;
    }

    function formatTimelineTick(totalMinutes) {
    const day = Math.floor(totalMinutes / (24 * 60)) + 1;
    const hour = Math.floor(totalMinutes / 60) % 24;
    const minute = Math.floor(totalMinutes % 60);
    if (day <= 1) return `${pad2(hour)}:${pad2(minute)}`;
    return `D${day} ${pad2(hour)}:${pad2(minute)}`;
    }

    function formatDurationFromMinutes(totalMinutes) {
    const safeMinutes = Math.max(0, Math.round(Number(totalMinutes) || 0));
    const hours = Math.floor(safeMinutes / 60);
    const minutes = safeMinutes % 60;
    return `${hours}:${pad2(minutes)}`;
    }

    function escapeHtml(raw) {
    return raw
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
    }
})();

