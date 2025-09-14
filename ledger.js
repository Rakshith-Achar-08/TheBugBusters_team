// Sample store
const store = {
  budgets: [
    { id: "b1", name: "Operational Budget", amount: 100000 },
    { id: "b2", name: "Research Budget", amount: 75000 }
  ],
  transactions: [
    { id: "t1", budgetId: "b1", date: "2025-09-13", from: "Admin", to: "HR", project: "Recruitment", vendor: "ABC Services", amount: 15000 },
    { id: "t2", budgetId: "b1", date: "2025-09-14", from: "Admin", to: "IT", project: "Hardware Upgrade", vendor: "XYZ Tech", amount: 20000 },
    { id: "t3", budgetId: "b2", date: "2025-09-15", from: "Research", to: "Science Dept", project: "AI Lab", vendor: "TechLabs", amount: 30000 }
  ]
};

let fundChart;
const ledgerTbody = document.getElementById("ledgerTbody");
const selectBudgetEl = document.getElementById("selectBudget");

// Populate budget dropdown
function populateBudgets() {
  selectBudgetEl.innerHTML = "";
  store.budgets.forEach(b => {
    const option = document.createElement("option");
    option.value = b.id;
    option.textContent = b.name;
    selectBudgetEl.appendChild(option);
  });
}

// Delete transaction
function deleteTx(id) {
  const idx = store.transactions.findIndex(t => t.id === id);
  if (idx !== -1) store.transactions.splice(idx, 1);
  renderLedger();
}

// Render Ledger Table
function renderLedger() {
  ledgerTbody.innerHTML = "";
  const budgetId = selectBudgetEl.value || (store.budgets[0] && store.budgets[0].id);
  if (!budgetId) return;

  const txs = store.transactions.filter(t => t.budgetId === budgetId);

  txs.forEach(t => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.date}</td>
      <td>${t.from}</td>
      <td>${t.to}</td>
      <td>${t.project || '-'}</td>
      <td>${t.vendor || '-'}</td>
      <td>₹${t.amount.toLocaleString()}</td>
      <td><button onclick="deleteTx('${t.id}')">Delete</button></td>
    `;
    ledgerTbody.appendChild(tr);
  });

  renderBudgetSummary(budgetId);
  renderFundChart(budgetId);
  renderFlow(budgetId, txs);
}

// Render Budget Summary
function renderBudgetSummary(budgetId) {
  const budget = store.budgets.find(b => b.id === budgetId);
  if (!budget) return;

  const txs = store.transactions.filter(t => t.budgetId === budgetId);
  const spent = txs.reduce((sum, t) => sum + t.amount, 0);
  const remaining = budget.amount - spent;

  document.getElementById("budgetSummary").innerHTML = `
    <p><strong>Total Budget:</strong> ₹${budget.amount.toLocaleString()}</p>
    <p><strong>Spent:</strong> ₹${spent.toLocaleString()}</p>
    <p><strong>Remaining:</strong> ₹${remaining.toLocaleString()}</p>
  `;

  const progress = Math.min((spent / budget.amount) * 100, 100);
  document.getElementById("budgetProgress").style.width = progress + "%";
}

// Render Fund Chart
function renderFundChart(budgetId) {
  const ctx = document.getElementById("fundChart").getContext("2d");
  const txs = store.transactions.filter(t => t.budgetId === budgetId);

  const categories = {};
  txs.forEach(t => {
    const dept = t.to || "Unknown Dept";
    const project = t.project || "No Project";
    const vendor = t.vendor || "No Vendor";
    const key = `${dept} / ${project} / ${vendor}`;
    categories[key] = (categories[key] || 0) + t.amount;
  });

  const labels = Object.keys(categories);
  const data = Object.values(categories);

  if (fundChart) fundChart.destroy();

  fundChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        label: "Fund Distribution",
        data: data,
        backgroundColor: ["#5b21b6", "#007bff", "#22c55e", "#eab308", "#ef4444", "#14b8a6"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: function(context) {
              let value = context.raw.toLocaleString("en-IN", { style: "currency", currency: "INR" });
              return `${context.label}: ${value}`;
            }
          }
        }
      }
    }
  });
}

// Render Budget Flow (simple inflow/outflow summary)
function renderFlow(budgetId, txs) {
  // For demonstration, show total inflow vs spent
  const inflow = store.budgets.find(b => b.id === budgetId)?.amount || 0;
  const spent = txs.reduce((sum, t) => sum + t.amount, 0);
  console.log(`Budget Flow - Total: ₹${inflow}, Spent: ₹${spent}, Remaining: ₹${inflow - spent}`);
}

// Initialize
populateBudgets();
selectBudgetEl.addEventListener("change", renderLedger);
renderLedger();
