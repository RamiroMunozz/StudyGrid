"use strict";

// Interfaz del mapa de calor: pinta la cuadrícula y gestiona el globo.
// No lee localStorage ni calcula fechas: consume HeatmapLogic y DateUtils.
(function () {
  // Abreviaturas fijas para no depender de la configuración regional del sistema.
  const MONTH_NAMES = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sept",
    "oct",
    "nov",
    "dic",
  ];

  const MARGIN = 8;

  const monthsRow = document.getElementById("mapa-meses");
  const grid = document.getElementById("mapa-cuadricula");
  const tooltip = document.getElementById("mapa-globo");

  // Fecha del globo abierto, para poder recolocarlo tras repintar.
  let openDate = null;

  grid.addEventListener("pointerover", handlePointerOver);
  grid.addEventListener("pointerout", handlePointerOut);
  grid.addEventListener("pointerdown", handlePointerDown);
  grid.addEventListener("focusin", handleFocusIn);
  grid.addEventListener("focusout", hideTooltip);
  document.addEventListener("pointerdown", handleDocumentPointerDown);
  document.addEventListener("keydown", handleKeyDown);
  window.addEventListener("scroll", hideTooltip, { passive: true });
  window.addEventListener("resize", hideTooltip);

  // Pinta las 12 semanas y, si el globo estaba abierto, lo deja en el mismo día.
  function renderHeatmap(sessions) {
    const today = DateUtils.toLocalDateString(new Date());
    const model = HeatmapLogic.buildHeatmap(sessions, today);
    const keepDate = openDate;

    hideTooltip();
    monthsRow.replaceChildren();
    grid.replaceChildren();

    for (const week of model.weeks) {
      const monthLabel = document.createElement("span");
      monthLabel.className = "mapa-mes";

      if (week.monthKey !== null) {
        monthLabel.textContent = MONTH_NAMES[Number(week.monthKey.slice(5, 7)) - 1];
      }

      monthsRow.append(monthLabel);

      for (const day of week.days) {
        if (day === null) {
          // Hueco de un día futuro: mantiene la alineación y no recibe foco.
          const gap = document.createElement("span");
          gap.className = "mapa-hueco";
          gap.setAttribute("aria-hidden", "true");
          grid.append(gap);
          continue;
        }

        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "mapa-celda nivel-" + day.level;
        cell.dataset.fecha = day.date;
        cell.dataset.minutos = String(day.minutes);
        cell.setAttribute("aria-label", HeatmapLogic.formatDaySummary(day.date, day.minutes));
        grid.append(cell);
      }
    }

    if (keepDate !== null) {
      const cell = grid.querySelector('[data-fecha="' + keepDate + '"]');
      if (cell !== null) {
        showTooltip(cell);
      }
    }
  }

  function cellFromEvent(event) {
    return event.target.closest(".mapa-celda");
  }

  function handlePointerOver(event) {
    if (event.pointerType === "touch") {
      return;
    }
    const cell = cellFromEvent(event);
    if (cell !== null) {
      showTooltip(cell);
    }
  }

  function handlePointerOut(event) {
    if (event.pointerType === "touch") {
      return;
    }
    if (cellFromEvent(event) !== null) {
      hideTooltip();
    }
  }

  function handlePointerDown(event) {
    if (event.pointerType !== "touch") {
      return;
    }
    const cell = cellFromEvent(event);
    if (cell !== null) {
      showTooltip(cell);
    }
  }

  function handleFocusIn(event) {
    const cell = cellFromEvent(event);
    if (cell !== null) {
      showTooltip(cell);
    }
  }

  function handleDocumentPointerDown(event) {
    if (!grid.contains(event.target)) {
      hideTooltip();
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      hideTooltip();
    }
  }

  function showTooltip(cell) {
    tooltip.textContent = HeatmapLogic.formatDaySummary(
      cell.dataset.fecha,
      Number(cell.dataset.minutos)
    );
    tooltip.hidden = false;
    placeTooltip(cell);
    openDate = cell.dataset.fecha;
  }

  // Coloca el globo encima de la celda; si no cabe, debajo, y siempre dentro
  // de la pantalla.
  function placeTooltip(cell) {
    const cellRect = cell.getBoundingClientRect();
    tooltip.style.left = "0px";
    tooltip.style.top = "0px";

    const box = tooltip.getBoundingClientRect();

    let left = cellRect.left + cellRect.width / 2 - box.width / 2;
    left = Math.min(Math.max(MARGIN, left), window.innerWidth - box.width - MARGIN);

    let top = cellRect.top - box.height - MARGIN;
    if (top < MARGIN) {
      top = cellRect.bottom + MARGIN;
    }
    top = Math.min(top, window.innerHeight - box.height - MARGIN);

    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
  }

  function hideTooltip() {
    tooltip.hidden = true;
    openDate = null;
  }

  // app.js la llama al cargar y al guardar una sesión.
  window.renderHeatmap = renderHeatmap;
})();
