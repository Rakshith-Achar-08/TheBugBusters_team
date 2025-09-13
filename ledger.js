// Example store with budgets and transactions
const store = {
  budgets: [
    { id: "b1", name: "General Fund" },
    { id: "b2", name: "Research Fund" }
  ],
  transactions: [
    { id: "t1", budgetId: "b1", date: "2025-09-01", from: "Admin", to: "IT Dept", project: "Network Upgrade", vendor: "TechCorp", amount: 50000 },
    { id: "t2", budgetId: "b1", date: "2025-09-05", from: "Admin", to: "Library", project: "Digital Archive", vendor: "BookSys", amount: 20000 },
    { id: "t3", budgetId: "b2", date: "2025-09-07", from: "Research", to: "Biology Dept", project: "Lab Expansion", vendor: "BioLabs Inc", amount: 75000 }
  ]
};

// Fake budget selector (since no <select> exists yet)
const selectBudgetEl = { value: "b1" };

// Start rendering once page loads
window.onload = function() {
  renderLedger();
};
