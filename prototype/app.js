const plans = {
  standard: {
    total: 1860,
    calls: 11,
    food: {
      title: "Paneer protein bowl",
      meta: "Green Bowl Co. - lunch delivery to Home",
      total: 420,
      items: [
        ["Paneer millet bowl", "Rs 320"],
        ["Curd side", "Rs 70"],
        ["Platform estimate", "Rs 30"],
      ],
    },
    grocery: {
      title: "Dinner groceries",
      meta: "High-protein vegetarian dinner for tonight",
      total: 790,
      items: [
        ["Tofu 200g", "Rs 160"],
        ["Moong dal 1kg", "Rs 180"],
        ["Greek yogurt", "Rs 210"],
        ["Spinach and vegetables", "Rs 240"],
      ],
    },
    dineout: {
      title: "Italian table for Saturday",
      meta: "Indiranagar - 4 guests - 8:00 PM",
      total: 650,
      items: [
        ["La Piazza", "4.4 rating"],
        ["Saturday slot", "8:00 PM"],
        ["Vegetarian mains", "Available"],
      ],
    },
  },
  lean: {
    total: 1680,
    calls: 14,
    food: {
      title: "Rajma protein thali",
      meta: "Homely Bowls - lunch delivery to Home",
      total: 340,
      items: [
        ["Rajma brown rice bowl", "Rs 260"],
        ["Curd side", "Rs 55"],
        ["Platform estimate", "Rs 25"],
      ],
    },
    grocery: {
      title: "Lean grocery basket",
      meta: "Budget-adjusted vegetarian dinner basket",
      total: 690,
      items: [
        ["Soya chunks 500g", "Rs 130"],
        ["Moong dal 1kg", "Rs 180"],
        ["Curd 500g", "Rs 80"],
        ["Vegetables and fruit", "Rs 300"],
      ],
    },
    dineout: {
      title: "Casual Italian table",
      meta: "Koramangala - 4 guests - 7:30 PM",
      total: 650,
      items: [
        ["Cafe Verona", "4.2 rating"],
        ["Saturday slot", "7:30 PM"],
        ["Budget-friendly mains", "Available"],
      ],
    },
  },
};

const auditEvents = [
  "Parsed diet=vegetarian, goal=high protein, budget=Rs 2,000.",
  "Prepared MCP clients: food, instamart, dineout.",
  "Searched restaurants, grocery items, and Dineout slots.",
  "No checkout or booking action completed without confirmation.",
];

const state = {
  confirmations: 0,
};

const elements = {
  budget: document.querySelector("#budgetInput"),
  planButton: document.querySelector("#planButton"),
  resetButton: document.querySelector("#resetButton"),
  totalEstimate: document.querySelector("#totalEstimate"),
  callCount: document.querySelector("#callCount"),
  riskCount: document.querySelector("#riskCount"),
  foodTitle: document.querySelector("#foodTitle"),
  foodMeta: document.querySelector("#foodMeta"),
  foodItems: document.querySelector("#foodItems"),
  foodTotal: document.querySelector("#foodTotal"),
  groceryTitle: document.querySelector("#groceryTitle"),
  groceryMeta: document.querySelector("#groceryMeta"),
  groceryItems: document.querySelector("#groceryItems"),
  groceryTotal: document.querySelector("#groceryTotal"),
  dineoutTitle: document.querySelector("#dineoutTitle"),
  dineoutMeta: document.querySelector("#dineoutMeta"),
  dineoutItems: document.querySelector("#dineoutItems"),
  dineoutTotal: document.querySelector("#dineoutTotal"),
  auditLog: document.querySelector("#auditLog"),
  dialog: document.querySelector("#confirmDialog"),
  dialogTitle: document.querySelector("#dialogTitle"),
  dialogBody: document.querySelector("#dialogBody"),
};

function money(value) {
  return `Rs ${value.toLocaleString("en-IN")}`;
}

function renderItems(target, items) {
  target.innerHTML = "";
  items.forEach(([name, value]) => {
    const item = document.createElement("li");
    item.innerHTML = `<span>${name}</span><span>${value}</span>`;
    target.appendChild(item);
  });
}

function addAuditEvent(message) {
  const item = document.createElement("li");
  item.textContent = message;
  elements.auditLog.prepend(item);
}

function renderPlan(plan) {
  elements.totalEstimate.textContent = money(plan.total);
  elements.callCount.textContent = String(plan.calls);
  elements.riskCount.textContent = `${state.confirmations} completed`;

  elements.foodTitle.textContent = plan.food.title;
  elements.foodMeta.textContent = plan.food.meta;
  elements.foodTotal.textContent = money(plan.food.total);
  renderItems(elements.foodItems, plan.food.items);

  elements.groceryTitle.textContent = plan.grocery.title;
  elements.groceryMeta.textContent = plan.grocery.meta;
  elements.groceryTotal.textContent = money(plan.grocery.total);
  renderItems(elements.groceryItems, plan.grocery.items);

  elements.dineoutTitle.textContent = plan.dineout.title;
  elements.dineoutMeta.textContent = plan.dineout.meta;
  elements.dineoutTotal.textContent = `${money(plan.dineout.total)} est.`;
  renderItems(elements.dineoutItems, plan.dineout.items);
}

function selectedPlan() {
  return Number(elements.budget.value) < 1800 ? plans.lean : plans.standard;
}

function resetAudit() {
  elements.auditLog.innerHTML = "";
  auditEvents.slice().reverse().forEach(addAuditEvent);
}

elements.planButton.addEventListener("click", () => {
  renderPlan(selectedPlan());
  addAuditEvent(`Replanned under budget=${money(Number(elements.budget.value))}; confirmation gates remain locked.`);
});

elements.resetButton.addEventListener("click", () => {
  state.confirmations = 0;
  elements.budget.value = 2000;
  renderPlan(plans.standard);
  resetAudit();
});

document.querySelectorAll("[data-confirm]").forEach((button) => {
  button.addEventListener("click", () => {
    const channel = button.dataset.confirm;
    const plan = selectedPlan();
    const copy = {
      food: `Place the food order from ${plan.food.meta} for ${money(plan.food.total)}?`,
      instamart: `Move the Instamart basket to checkout for ${money(plan.grocery.total)}?`,
      dineout: `Book ${plan.dineout.meta} with estimated spend ${money(plan.dineout.total)}?`,
    };

    elements.dialogTitle.textContent = `Confirm ${channel}`;
    elements.dialogBody.textContent = copy[channel];
    elements.dialog.showModal();

    elements.dialog.addEventListener(
      "close",
      () => {
        if (elements.dialog.returnValue === "confirm") {
          state.confirmations += 1;
          elements.riskCount.textContent = `${state.confirmations} completed`;
          addAuditEvent(`User explicitly confirmed ${channel}; trace_id=trace_${Date.now()}.`);
        }
      },
      { once: true },
    );
  });
});

renderPlan(plans.standard);
resetAudit();
