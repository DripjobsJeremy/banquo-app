(function(global) {
  const React = global.React;
  const { useRef, useEffect } = React;
  const Chart = global.Chart;

  // Chart 1: Budget Health Doughnut
  // Shows: Spent (crimson) / Remaining (gold) / Over-budget (warning red if applicable)
  // Props: { spent, remaining, isOverBudget, totalBudget }
  function BudgetHealthDoughnut({ spent, remaining, isOverBudget, totalBudget }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
      if (!Chart || !chartRef.current) return;
      if (chartInstance.current) chartInstance.current.destroy();

      const safeSpent = Math.max(spent || 0, 0);
      const safeRemaining = isOverBudget ? 0 : Math.max(remaining || 0, 0);
      const overAmount = isOverBudget ? Math.abs(remaining || 0) : 0;

      chartInstance.current = new Chart(chartRef.current.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: isOverBudget
            ? ['Spent', 'Over Budget']
            : ['Spent', 'Remaining'],
          datasets: [{
            data: isOverBudget
              ? [safeSpent, overAmount]
              : [safeSpent, safeRemaining],
            backgroundColor: isOverBudget
              ? ['rgba(139,26,43,0.8)', 'rgba(220,38,38,0.7)']
              : ['rgba(139,26,43,0.8)', 'rgba(201,161,74,0.7)'],
            borderColor: isOverBudget
              ? ['#8B1A2B', '#dc2626']
              : ['#8B1A2B', '#c9a14a'],
            borderWidth: 2,
            hoverOffset: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '68%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#cfc6b3',
                font: { size: 12 },
                padding: 16,
                boxWidth: 12,
              }
            },
            tooltip: {
              backgroundColor: '#1c1413',
              borderColor: 'rgba(201,161,74,0.3)',
              borderWidth: 1,
              titleColor: '#f4ede2',
              bodyColor: '#cfc6b3',
              callbacks: {
                label: (ctx) => ` $${ctx.parsed.toLocaleString()}`
              }
            }
          }
        }
      });
      return () => { if (chartInstance.current) chartInstance.current.destroy(); };
    }, [spent, remaining, isOverBudget, totalBudget]);

    return React.createElement('div', { style: { height: '200px', position: 'relative' } },
      React.createElement('canvas', { ref: chartRef })
    );
  }

  // Chart 2: Department Breakdown Horizontal Bar
  // Shows allocated vs spent per department
  // Props: { departments: [{ name, allocated, spent }] }
  function DepartmentBreakdownChart({ departments }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
      if (!Chart || !chartRef.current || !departments?.length) return;
      if (chartInstance.current) chartInstance.current.destroy();

      const labels = departments.map(d => d.name);
      const allocated = departments.map(d => d.allocated || 0);
      const spent = departments.map(d => d.spent || 0);

      chartInstance.current = new Chart(chartRef.current.getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Allocated',
              data: allocated,
              backgroundColor: 'rgba(201,161,74,0.4)',
              borderColor: '#c9a14a',
              borderWidth: 1,
              borderRadius: 4,
            },
            {
              label: 'Spent',
              data: spent,
              backgroundColor: 'rgba(139,26,43,0.75)',
              borderColor: '#8B1A2B',
              borderWidth: 1,
              borderRadius: 4,
            }
          ]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: '#cfc6b3',
                font: { size: 12 },
                padding: 16,
                boxWidth: 12,
              }
            },
            tooltip: {
              backgroundColor: '#1c1413',
              borderColor: 'rgba(201,161,74,0.3)',
              borderWidth: 1,
              titleColor: '#f4ede2',
              bodyColor: '#cfc6b3',
              callbacks: {
                label: (ctx) => ` $${ctx.parsed.x.toLocaleString()}`
              }
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255,255,255,0.06)' },
              ticks: {
                color: '#8e8778',
                callback: (v) => '$' + v.toLocaleString()
              },
              border: { color: 'rgba(255,255,255,0.1)' }
            },
            y: {
              grid: { display: false },
              ticks: { color: '#cfc6b3', font: { size: 12 } },
              border: { color: 'rgba(255,255,255,0.1)' }
            }
          }
        }
      });
      return () => { if (chartInstance.current) chartInstance.current.destroy(); };
    }, [departments]);

    const chartHeight = Math.max(160, (departments?.length || 1) * 48);
    return React.createElement('div', { style: { height: chartHeight + 'px', position: 'relative' } },
      React.createElement('canvas', { ref: chartRef })
    );
  }

  global.BudgetHealthDoughnut = BudgetHealthDoughnut;
  global.DepartmentBreakdownChart = DepartmentBreakdownChart;

})(window);
