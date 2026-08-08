function BudgetOverview({ budget, summary, canEditBudget = true, onUpdateTotalBudget, onSyncCosts, royaltiesTotal = 0 }) {
    const [totalBudget, setTotalBudget] = React.useState(budget.totalBudget);

    const totalPlannedSpend = summary.totalAllocated + royaltiesTotal;
    const isOverPlannedBudget = budget.totalBudget > 0 && totalPlannedSpend > budget.totalBudget;
    const overBy = totalPlannedSpend - budget.totalBudget;
    const trueRemaining = budget.totalBudget - totalPlannedSpend;
    const truePercentUsed = budget.totalBudget > 0 ? (totalPlannedSpend / budget.totalBudget) * 100 : 0;

    return (
        <div className="space-y-6">
            {/* Total Budget */}
            <div className="rounded-lg p-6 border border-[var(--color-border)]" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Total Production Budget</h3>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label htmlFor="total-budget" className="block text-sm font-medium text-gray-700 mb-1">
                            Total Budget Amount
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <input
                                id="total-budget"
                                type="number"
                                value={totalBudget}
                                onChange={(e) => canEditBudget && setTotalBudget(e.target.value)}
                                onBlur={() => canEditBudget && onUpdateTotalBudget(totalBudget)}
                                readOnly={!canEditBudget}
                                className={`w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-2xl font-bold ${!canEditBudget ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`}
                                placeholder="0.00"
                                step="0.01"
                            />
                        </div>
                    </div>
                    {canEditBudget && <button
                        type="button"
                        onClick={onSyncCosts}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        title="Sync costs from scene-level department data"
                    >
                        🔄 Sync Costs
                    </button>}
                </div>
            </div>

            {/* Budget Breakdown */}
            <div className="grid grid-cols-2 gap-6">
                <div className="rounded-lg p-6 border border-[var(--color-border)]" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
                    <h4 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Expense Summary</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span style={{ color: 'var(--color-text-secondary)' }}>Total Allocated:</span>
                            <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>${summary.totalAllocated.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span style={{ color: 'var(--color-text-secondary)' }}>Total Spent:</span>
                            <span className={`font-semibold ${summary.isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                                ${summary.totalSpent.toLocaleString()}
                            </span>
                        </div>
                        {royaltiesTotal > 0 && (
                            <div className="flex justify-between items-center">
                                <span style={{ color: 'var(--color-text-secondary)' }}>Royalties &amp; Licensing:</span>
                                <span className="font-semibold text-yellow-600">
                                    ${royaltiesTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                            <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Remaining:</span>
                            <span className={`font-bold text-lg ${trueRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                ${trueRemaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        {royaltiesTotal > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Total incl. Royalties:</span>
                                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                    ${(summary.totalSpent + royaltiesTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        )}
                        <div className="budget-planned-row">
                            <span className="budget-planned-label">Total planned spend</span>
                            <span className={`budget-planned-amount ${isOverPlannedBudget ? 'budget-planned-amount--over' : ''}`}>
                                ${totalPlannedSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    {isOverPlannedBudget && (
                        <div className="budget-over-warning">
                            <div className="budget-over-warning-title">
                                ⚠ Over budget by ${overBy.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="budget-over-warning-detail">
                                Production budget: ${budget.totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })} · Total planned spend: ${totalPlannedSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    )}

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                            <span>Budget Used</span>
                            <span>{truePercentUsed.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ${
                                    truePercentUsed > 100 ? 'bg-red-500' :
                                    truePercentUsed > 90 ? 'bg-yellow-500' :
                                    'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(truePercentUsed, 100)}%` }}
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: '24px' }}>
                        {window.BudgetHealthDoughnut && (
                            <window.BudgetHealthDoughnut
                                spent={totalPlannedSpend}
                                remaining={trueRemaining}
                                isOverBudget={isOverPlannedBudget}
                                totalBudget={budget.totalBudget}
                            />
                        )}
                    </div>
                </div>

                <div className="rounded-lg p-6 border border-[var(--color-border)]" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
                    <h4 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Revenue Summary</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span style={{ color: 'var(--color-text-secondary)' }}>Total Revenue:</span>
                            <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>${summary.totalRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span style={{ color: 'var(--color-text-secondary)' }}>Total Expenses:</span>
                            <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>${summary.totalSpent.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                            <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Net Income:</span>
                            <span className={`font-bold text-lg ${summary.netIncome < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                ${summary.netIncome.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {summary.netIncome < 0 && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            ⚠️ Production is currently operating at a loss
                        </div>
                    )}

                    <div style={{ marginTop: '24px' }}>
                        {window.Chart && (() => {
                            const revenue = summary.totalRevenue || 0;
                            const goal = budget.totalBudget || 0;
                            const pct = goal > 0 ? Math.min((revenue / goal) * 100, 100) : 0;
                            return (
                                <div>
                                    <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                                        <span>Revenue vs. Budget Goal</span>
                                        <span>{pct.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-300 bg-blue-500"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Department Breakdown */}
            <div className="rounded-lg p-6 border border-[var(--color-border)]" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
                <h4 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Department Breakdown</h4>
                <div className="grid grid-cols-2 gap-4">
                    {summary.departments.map(dept => (
                        <div key={dept.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex-1">
                                <div className="font-medium text-gray-900 capitalize">{dept.name}</div>
                                <div className="text-sm text-gray-600">
                                    ${dept.spent.toLocaleString()} / ${dept.allocated.toLocaleString()}
                                </div>
                            </div>
                            <div className={`text-sm font-semibold ${dept.isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                                {dept.percentUsed.toFixed(0)}%
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: '24px' }}>
                    {window.DepartmentBreakdownChart && (
                        <window.DepartmentBreakdownChart
                            departments={summary.departments}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

window.BudgetOverview = BudgetOverview;

console.log('✅ BudgetOverview component loaded');
