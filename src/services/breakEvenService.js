const BreakEvenService = (() => {
  const AVG_DAYS_PER_WEEK = 7;
  const OCCUPANCY_SCENARIOS = [60, 75, 85, 94, 100];

  const deriveWeeksFromDates = (startDate, endDate) => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end) || end <= start) return null;
    const days = (end - start) / (1000 * 60 * 60 * 24);
    return Math.max(1, Math.round(days / AVG_DAYS_PER_WEEK));
  };

  const getSettings = (production) => {
    const be = production?.breakEven || {};
    return {
      weeklyRunningCost: parseFloat(be.weeklyRunningCost) || 0,
      weeksInRunOverride: be.weeksInRunOverride != null ? parseFloat(be.weeksInRunOverride) : null,
      capitalizationOverride: be.capitalizationOverride != null ? parseFloat(be.capitalizationOverride) : null
    };
  };

  const saveSettings = (productionId, updates) => {
    try {
      const productions = JSON.parse(localStorage.getItem('showsuite_productions') || '[]');
      const idx = productions.findIndex(p => p.id === productionId);
      if (idx === -1) return null;
      const current = productions[idx].breakEven || {};
      const next = { ...current, ...updates };
      productions[idx] = { ...productions[idx], breakEven: next };
      localStorage.setItem('showsuite_productions', JSON.stringify(productions));
      return next;
    } catch (error) {
      console.error('BreakEvenService: Error saving settings:', error);
      return null;
    }
  };

  const compute = ({ seatingCapacity, numberOfPerformances, avgTicketPrice, attendancePct, weeklyRunningCost, weeksInRun, capitalization }) => {
    const seats = parseFloat(seatingCapacity) || 0;
    const perfs = parseFloat(numberOfPerformances) || 0;
    const price = parseFloat(avgTicketPrice) || 0;
    const weeks = parseFloat(weeksInRun) || 0;
    const cost = parseFloat(weeklyRunningCost) || 0;
    const cap = parseFloat(capitalization) || 0;

    const hasData = seats > 0 && perfs > 0 && price > 0 && weeks > 0 && cost > 0 && cap > 0;

    const calcForOccupancy = (occupancyPct) => {
      const grossTotal = seats * (occupancyPct / 100) * perfs * price;
      const weeklyGross = weeks > 0 ? grossTotal / weeks : 0;
      const weeklyMargin = weeklyGross - cost;
      const breakEvenWeeks = weeklyMargin > 0 ? cap / weeklyMargin : Infinity;
      return { occupancyPct, weeklyGross, weeklyMargin, breakEvenWeeks };
    };

    const current = calcForOccupancy(parseFloat(attendancePct) || 0);
    const scenarios = OCCUPANCY_SCENARIOS.map(calcForOccupancy);

    let status = 'unknown';
    if (hasData) {
      if (current.breakEvenWeeks === Infinity || current.breakEvenWeeks > weeks) {
        status = 'critical';
      } else if (current.breakEvenWeeks > weeks * 0.85) {
        status = 'caution';
      } else {
        status = 'healthy';
      }
    }

    return { hasData, weeksInRun: weeks, current, scenarios, status };
  };

  const getStatusForProduction = (productionId) => {
    try {
      const productions = JSON.parse(localStorage.getItem('showsuite_productions') || '[]');
      const production = productions.find(p => p.id === productionId);
      if (!production) return { hasData: false, status: 'unknown' };

      const royalties = production.royalties || {};
      const settings = getSettings(production);
      const weeksInRun = settings.weeksInRunOverride != null
        ? settings.weeksInRunOverride
        : (deriveWeeksFromDates(production.startDate, production.endDate) || 0);
      const budgetSummary = window.budgetService ? window.budgetService.calculateBudgetSummary(productionId) : { totalBudget: 0 };
      const capitalization = settings.capitalizationOverride != null
        ? settings.capitalizationOverride
        : (budgetSummary.totalBudget || 0);

      const result = compute({
        seatingCapacity: royalties.seatingCapacity,
        numberOfPerformances: royalties.numberOfPerformances,
        avgTicketPrice: royalties.avgTicketPrice,
        attendancePct: royalties.attendancePct,
        weeklyRunningCost: settings.weeklyRunningCost,
        weeksInRun,
        capitalization
      });

      return { ...result, productionId, productionTitle: production.title };
    } catch (error) {
      console.error('BreakEvenService: Error computing status:', error);
      return { hasData: false, status: 'unknown' };
    }
  };

  const getAllAtRisk = () => {
    try {
      const productions = JSON.parse(localStorage.getItem('showsuite_productions') || '[]');
      return productions
        .map(p => getStatusForProduction(p.id))
        .filter(r => r.hasData && r.status === 'critical');
    } catch (error) {
      console.error('BreakEvenService: Error getting at-risk productions:', error);
      return [];
    }
  };

  return {
    deriveWeeksFromDates,
    getSettings,
    saveSettings,
    compute,
    getStatusForProduction,
    getAllAtRisk,
    OCCUPANCY_SCENARIOS
  };
})();

window.breakEvenService = BreakEvenService;
