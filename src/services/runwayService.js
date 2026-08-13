/**
 * Organization Runway Service
 * Tracks cash on hand and operating burn rate so Board Admins can see
 * how many weeks the organization could operate if ticket/donation
 * income stopped tomorrow.
 *
 * Storage key: 'showsuite_org_runway'
 */
const RunwayService = (() => {
    const STORAGE_KEY = 'showsuite_org_runway';

    const DEFAULT_SETTINGS = {
        cashOnHand: 0,
        monthlyOperatingExpense: 0,
        monthlyContributedIncome: 0,
        lastUpdated: null
    };

    const AVG_WEEKS_PER_MONTH = 4.345;

    const loadSettings = () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : { ...DEFAULT_SETTINGS };
        } catch (error) {
            console.error('RunwayService: Error loading settings:', error);
            return { ...DEFAULT_SETTINGS };
        }
    };

    const saveSettings = (updates) => {
        try {
            const current = loadSettings();
            const next = {
                ...current,
                ...updates,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        } catch (error) {
            console.error('RunwayService: Error saving settings:', error);
            return loadSettings();
        }
    };

    const computeRunway = (settings) => {
        const s = settings || loadSettings();
        const cashOnHand = parseFloat(s.cashOnHand) || 0;
        const monthlyOperatingExpense = parseFloat(s.monthlyOperatingExpense) || 0;
        const monthlyContributedIncome = parseFloat(s.monthlyContributedIncome) || 0;

        const hasData = monthlyOperatingExpense > 0;
        const monthlyNetBurn = monthlyOperatingExpense - monthlyContributedIncome;
        const weeklyBurn = monthlyNetBurn / AVG_WEEKS_PER_MONTH;

        let weeksOfRunway;
        if (!hasData) {
            weeksOfRunway = null;
        } else if (weeklyBurn <= 0) {
            weeksOfRunway = Infinity;
        } else {
            weeksOfRunway = cashOnHand / weeklyBurn;
        }

        let status = 'unknown';
        if (hasData) {
            if (weeksOfRunway === Infinity) status = 'healthy';
            else if (weeksOfRunway < 12) status = 'critical';
            else if (weeksOfRunway < 26) status = 'caution';
            else status = 'healthy';
        }

        return {
            cashOnHand,
            monthlyOperatingExpense,
            monthlyContributedIncome,
            weeklyBurn,
            weeksOfRunway,
            monthsOfRunway: (weeksOfRunway === Infinity || weeksOfRunway === null) ? weeksOfRunway : weeksOfRunway / AVG_WEEKS_PER_MONTH,
            hasData,
            status
        };
    };

    return {
        loadSettings,
        saveSettings,
        computeRunway,
        DEFAULT_SETTINGS
    };
})();

window.RunwayService = RunwayService;
window.runwayService = RunwayService;
