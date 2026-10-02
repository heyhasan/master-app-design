/* ============================================================
   custom.js — MasterApp Statistics Page Charts
   All canvas charts drawn natively without external libraries
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     Helper: animate number count-up
  ---------------------------------------------------------- */
  function animateCount(el, target, duration = 1200) {
    const start = performance.now();
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(ease * target);
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  /* ----------------------------------------------------------
     KPI Count-up
  ---------------------------------------------------------- */
  const kpiTargets = {
    'kpi-company':  2,
    'kpi-employee': 248,
    'kpi-division': 12,
    'kpi-app':      8,
  };

  Object.entries(kpiTargets).forEach(([id, target]) => {
    const el = document.getElementById(id);
    if (el) animateCount(el, target);
  });

  /* ----------------------------------------------------------
     Period Selector
  ---------------------------------------------------------- */
  const periodBtns = document.querySelectorAll('.period-btn');
  periodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      periodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Re-render charts with slightly randomized data to show interactivity
      renderBarChart(btn.dataset.period);
      renderLineChart(btn.dataset.period);
    });
  });

  /* ----------------------------------------------------------
     Color palette (matches index.html card colors)
  ---------------------------------------------------------- */
  const COLORS = ['#6288ed', '#7898ef', '#778be1', '#6874d3', '#737fae', '#4da68a', '#5d70d2', '#626b9f'];

  /* ----------------------------------------------------------
     Utility: get device pixel ratio canvas
  ---------------------------------------------------------- */
  function setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, w: rect.width, h: rect.height };
  }

  /* ----------------------------------------------------------
     BAR CHART — Karyawan per Perusahaan
  ---------------------------------------------------------- */
  const barData = {
    week:  { labels: ['PT. Inspirasi Kode', 'PT. Lion Kids Indonesia'], values: [148, 100] },
    month: { labels: ['PT. Inspirasi Kode', 'PT. Lion Kids Indonesia'], values: [162, 86]  },
    year:  { labels: ['PT. Inspirasi Kode', 'PT. Lion Kids Indonesia'], values: [186, 124] },
  };

  function renderBarChart(period = 'week') {
    const canvas = document.getElementById('barChart');
    if (!canvas) return;

    const chartH = 200;
    canvas.style.height = chartH + 'px';
    const { ctx, w, h } = setupCanvas(canvas);

    const data = barData[period] || barData.week;
    const maxVal = Math.max(...data.values) * 1.2;
    const barW = Math.min(80, (w - 80) / data.labels.length - 20);
    const gap  = (w - 60) / data.labels.length;
    const padL = 30, padB = 36, padT = 16;
    const chartArea = h - padB - padT;

    // clear
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#eef1fb';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75, 1].forEach(frac => {
      const y = padT + chartArea * (1 - frac);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w - 10, y);
      ctx.stroke();
      ctx.fillStyle = '#a0a7c0';
      ctx.font = '10px Nunito, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxVal * frac), padL - 4, y + 3);
    });

    // Animate bars
    let progress = 0;
    const animSpeed = 0.035;

    function drawBars() {
      ctx.clearRect(0, 0, w, h);

      // Redraw grid
      ctx.strokeStyle = '#eef1fb';
      ctx.lineWidth = 1;
      [0.25, 0.5, 0.75, 1].forEach(frac => {
        const y = padT + chartArea * (1 - frac);
        ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - 10, y); ctx.stroke();
        ctx.fillStyle = '#a0a7c0';
        ctx.font = '10px Nunito, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxVal * frac), padL - 4, y + 3);
      });

      data.values.forEach((val, i) => {
        const barH  = (val / maxVal) * chartArea * Math.min(progress, 1);
        const x     = padL + gap * i + (gap - barW) / 2;
        const y     = padT + chartArea - barH;

        // Rounded bar
        const radius = 8;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barW - radius, y);
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
        ctx.lineTo(x + barW, y + barH);
        ctx.lineTo(x, y + barH);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fillStyle = COLORS[i % COLORS.length];
        ctx.fill();

        // Value label on top
        if (progress >= 1) {
          ctx.fillStyle = COLORS[i % COLORS.length];
          ctx.font = 'bold 12px Nunito, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(val, x + barW / 2, y - 6);
        }

        // X label
        ctx.fillStyle = '#6b7488';
        ctx.font = '10px Nunito, sans-serif';
        ctx.textAlign = 'center';
        // Wrap long labels
        const words = data.labels[i].split(' ');
        const half  = Math.ceil(words.length / 2);
        ctx.fillText(words.slice(0, half).join(' '), x + barW / 2, padT + chartArea + 14);
        ctx.fillText(words.slice(half).join(' '),    x + barW / 2, padT + chartArea + 26);
      });

      progress += animSpeed;
      if (progress < 1.05) requestAnimationFrame(drawBars);
    }

    progress = 0;
    drawBars();

    // Update total label
    const total = data.values.reduce((a, b) => a + b, 0);
    const label = document.getElementById('bar-total-label');
    if (label) label.textContent = total + ' Total';
  }

  /* ----------------------------------------------------------
     DONUT CHART — Distribusi Jabatan
  ---------------------------------------------------------- */
  const donutData = [
    { label: 'Manager',    value: 18, color: COLORS[0] },
    { label: 'Staf',       value: 82, color: COLORS[1] },
    { label: 'Supervisor', value: 24, color: COLORS[2] },
    { label: 'Direktur',   value:  6, color: COLORS[3] },
    { label: 'Lain-lain',  value: 18, color: COLORS[4] },
  ];

  function renderDonutChart() {
    const canvas = document.getElementById('donutChart');
    if (!canvas) return;

    canvas.style.width  = '180px';
    canvas.style.height = '180px';
    const { ctx, w, h } = setupCanvas(canvas);

    const cx = w / 2, cy = h / 2;
    const outerR = Math.min(w, h) / 2 - 4;
    const innerR = outerR * 0.6;
    const total  = donutData.reduce((a, d) => a + d.value, 0);

    let animProgress = 0;
    const animSpeed  = 0.04;

    function drawDonut() {
      ctx.clearRect(0, 0, w, h);
      let startAngle = -Math.PI / 2;
      const drawFrac = Math.min(animProgress, 1);

      donutData.forEach(seg => {
        const sweep = (seg.value / total) * Math.PI * 2 * drawFrac;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, outerR, startAngle, startAngle + sweep);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();
        startAngle += sweep;
      });

      // Punch hole
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      animProgress += animSpeed;
      if (animProgress < 1.05) requestAnimationFrame(drawDonut);
    }

    drawDonut();

    // Build legend
    const legend = document.getElementById('donutLegend');
    if (legend) {
      legend.innerHTML = donutData.map(seg => `
        <div class="donut-legend-item">
          <span class="donut-legend-dot" style="background:${seg.color}"></span>
          <span>${seg.label}</span>
          <span class="donut-legend-pct">${Math.round(seg.value / total * 100)}%</span>
        </div>
      `).join('');
    }
  }

  /* ----------------------------------------------------------
     LINE CHART — Pertumbuhan Karyawan
  ---------------------------------------------------------- */
  const lineData = {
    week:  { labels: ['Sen','Sel','Rab','Kam','Jum','Sab','Min'], values: [210, 212, 218, 220, 224, 224, 226] },
    month: { labels: ['Mg 1','Mg 2','Mg 3','Mg 4'],               values: [200, 214, 230, 248]               },
    year:  { labels: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],
             values: [120, 138, 150, 162, 170, 185, 196, 210, 224, 235, 244, 248] },
  };

  function renderLineChart(period = 'week') {
    const canvas = document.getElementById('lineChart');
    if (!canvas) return;

    const wrap = canvas.closest('.line-chart-wrap');
    const wrapH = wrap ? wrap.offsetHeight : 200;
    canvas.style.height = wrapH + 'px';

    const { ctx, w, h } = setupCanvas(canvas);

    const data = lineData[period] || lineData.week;
    const vals = data.values;
    const minV = Math.min(...vals) * 0.95;
    const maxV = Math.max(...vals) * 1.05;
    const padL = 36, padR = 16, padT = 16, padB = 28;
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;
    const stepX  = chartW / (vals.length - 1);

    function xAt(i)   { return padL + i * stepX; }
    function yAt(val) { return padT + chartH * (1 - (val - minV) / (maxV - minV)); }

    let progress = 0;
    const animSpeed = 0.04;

    function drawLine() {
      ctx.clearRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = '#eef1fb';
      ctx.lineWidth = 1;
      [0, 0.25, 0.5, 0.75, 1].forEach(frac => {
        const y = padT + chartH * frac;
        ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
        ctx.fillStyle = '#a0a7c0';
        ctx.font = '9px Nunito, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxV - frac * (maxV - minV)), padL - 4, y + 3);
      });

      // X labels
      data.labels.forEach((lbl, i) => {
        ctx.fillStyle = '#a0a7c0';
        ctx.font = '9px Nunito, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lbl, xAt(i), h - 6);
      });

      const drawUpto = Math.floor(progress * (vals.length - 1));

      if (drawUpto < 1) { progress += animSpeed; requestAnimationFrame(drawLine); return; }

      // Filled area gradient
      const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
      grad.addColorStop(0,   'rgba(98,136,237,0.22)');
      grad.addColorStop(1,   'rgba(98,136,237,0.00)');

      ctx.beginPath();
      ctx.moveTo(xAt(0), yAt(vals[0]));
      for (let i = 1; i <= drawUpto; i++) ctx.lineTo(xAt(i), yAt(vals[i]));
      // partial last segment
      if (drawUpto < vals.length - 1) {
        const frac = progress * (vals.length - 1) - drawUpto;
        const px = xAt(drawUpto) + frac * stepX;
        const pv = vals[drawUpto] + frac * (vals[drawUpto + 1] - vals[drawUpto]);
        ctx.lineTo(px, yAt(pv));
        ctx.lineTo(px, padT + chartH);
      } else {
        ctx.lineTo(xAt(drawUpto), padT + chartH);
      }
      ctx.lineTo(xAt(0), padT + chartH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Line
      ctx.beginPath();
      ctx.strokeStyle = '#6288ed';
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.moveTo(xAt(0), yAt(vals[0]));
      for (let i = 1; i <= drawUpto; i++) ctx.lineTo(xAt(i), yAt(vals[i]));
      if (drawUpto < vals.length - 1) {
        const frac = progress * (vals.length - 1) - drawUpto;
        const px = xAt(drawUpto) + frac * stepX;
        const pv = vals[drawUpto] + frac * (vals[drawUpto + 1] - vals[drawUpto]);
        ctx.lineTo(px, yAt(pv));
      }
      ctx.stroke();

      // Dots
      for (let i = 0; i <= drawUpto; i++) {
        ctx.beginPath();
        ctx.arc(xAt(i), yAt(vals[i]), 4, 0, Math.PI * 2);
        ctx.fillStyle = '#6288ed';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      progress += animSpeed;
      if (progress < vals.length - 1 + 0.05) requestAnimationFrame(drawLine);
    }

    progress = 0;
    drawLine();
  }

  /* ----------------------------------------------------------
     Initial Render
  ---------------------------------------------------------- */
  // Wait a tick so layout is ready before measuring canvas size
  requestAnimationFrame(() => {
    renderBarChart('week');
    renderDonutChart();
    renderLineChart('week');
  });

  /* ----------------------------------------------------------
     Re-render on resize (debounced)
  ---------------------------------------------------------- */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const activePeriod = document.querySelector('.period-btn.active')?.dataset.period || 'week';
      renderBarChart(activePeriod);
      renderDonutChart();
      renderLineChart(activePeriod);
    }, 200);
  });

});
