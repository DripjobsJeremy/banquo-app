(function(global) {
  const React = global.React;
  const { useRef, useEffect } = React;
  const Chart = global.Chart;

  // Royalty Breakdown Horizontal Bar
  // Shows component contributions to the final royalty figure:
  // Base Rate, Per-Perf Subtotal, Gross Basis, minus Discount, minus Cap Adjustment
  // Props: { royaltyCalc: { base, perPerfSubtotal, grossBasis, discountAmount, capAdjustment, total } }
  function RoyaltyBreakdownChart({ royaltyCalc }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
      if (!Chart || !chartRef.current || !royaltyCalc) return;
      if (chartInstance.current) chartInstance.current.destroy();

      const {
        base = 0,
        perPerfSubtotal = 0,
        grossBasis = 0,
        discountAmount = 0,
        capAdjustment = 0,
        total = 0
      } = royaltyCalc;

      // Only show rows with non-zero values
      const rows = [
        { label: 'Base Rate',       value: base,            color: 'rgba(201,161,74,0.8)',  border: '#c9a14a' },
        { label: 'Per-Perf',        value: perPerfSubtotal, color: 'rgba(201,161,74,0.55)', border: '#c9a14a' },
        { label: 'Gross Basis',     value: grossBasis,      color: 'rgba(201,161,74,0.35)', border: '#c9a14a' },
        { label: 'Discount',        value: -discountAmount, color: 'rgba(139,26,43,0.6)',   border: '#8B1A2B' },
        { label: 'Cap Adjustment',  value: -capAdjustment,  color: 'rgba(139,26,43,0.4)',   border: '#8B1A2B' },
        { label: 'Final Total',     value: total,           color: 'rgba(201,161,74,1.0)',  border: '#c9a14a' },
      ].filter(r => r.value !== 0);

      chartInstance.current = new Chart(chartRef.current.getContext('2d'), {
        type: 'bar',
        data: {
          labels: rows.map(r => r.label),
          datasets: [{
            label: 'Amount',
            data: rows.map(r => r.value),
            backgroundColor: rows.map(r => r.color),
            borderColor: rows.map(r => r.border),
            borderWidth: 1,
            borderRadius: 4,
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1c1413',
              borderColor: 'rgba(201,161,74,0.3)',
              borderWidth: 1,
              titleColor: '#f4ede2',
              bodyColor: '#cfc6b3',
              callbacks: {
                label: (ctx) => {
                  const val = ctx.parsed.x;
                  return ` ${val < 0 ? '-' : ''}$${Math.abs(val).toLocaleString()}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255,255,255,0.06)' },
              ticks: {
                color: '#8e8778',
                callback: (v) => '$' + Math.abs(v).toLocaleString()
              },
              border: { color: 'rgba(255,255,255,0.1)' }
            },
            y: {
              grid: { display: false },
              ticks: { color: '#cfc6b3', font: { size: 11 } },
              border: { color: 'rgba(255,255,255,0.1)' }
            }
          }
        }
      });
      return () => { if (chartInstance.current) chartInstance.current.destroy(); };
    }, [royaltyCalc]);

    const visibleRows = royaltyCalc ? Object.values(royaltyCalc).filter(v => v !== 0).length : 3;
    const chartHeight = Math.max(140, visibleRows * 40);

    return React.createElement('div', {
      style: {
        marginTop: '20px',
        padding: '16px',
        background: 'rgba(201,161,74,0.05)',
        border: '1px solid rgba(201,161,74,0.15)',
        borderRadius: '8px'
      }
    },
      React.createElement('p', {
        style: {
          fontSize: '11px',
          fontWeight: '600',
          letterSpacing: '0.08em',
          color: '#8e8778',
          marginBottom: '12px',
          marginTop: 0,
          textTransform: 'uppercase'
        }
      }, 'COST BREAKDOWN'),
      React.createElement('div', { style: { height: chartHeight + 'px', position: 'relative' } },
        React.createElement('canvas', { ref: chartRef })
      )
    );
  }

  global.RoyaltyBreakdownChart = RoyaltyBreakdownChart;

})(window);
