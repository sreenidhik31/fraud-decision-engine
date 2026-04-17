const FEATURE_NAMES = [
  "Time", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9",
  "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17", "V18", "V19",
  "V20", "V21", "V22", "V23", "V24", "V25", "V26", "V27", "V28", "Amount"
];

const DEFAULT_VALUES = {
  Time: 0.0,
  V1: 0.1, V2: -0.2, V3: 0.3, V4: -0.1, V5: 0.05,
  V6: -0.3, V7: 0.2, V8: -0.1, V9: 0.4, V10: -0.2,
  V11: 0.1, V12: -0.05, V13: 0.2, V14: -0.3, V15: 0.1,
  V16: -0.2, V17: 0.3, V18: -0.1, V19: 0.05, V20: 0.01,
  V21: -0.02, V22: 0.03, V23: -0.04, V24: 0.05, V25: -0.06,
  V26: 0.07, V27: -0.08, V28: 0.09, Amount: 100.0
};

let singleCsvRows = [];
let batchCsvRows = [];
let costCsvRows = [];

function showMessage(message, isError = false) {
  const box = document.getElementById("message-box");
  box.textContent = message;
  box.classList.remove("hidden");
  box.style.borderColor = isError ? "#ef4444" : "#60a5fa";
  setTimeout(() => box.classList.add("hidden"), 3500);
}

async function apiCall(method, endpoint, payload = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" }
  };

  if (payload) {
    options.body = JSON.stringify(payload);
  }

  const response = await fetch(endpoint, options);

  let data = {};
  try {
    data = await response.json();
  } catch (_) {}

  if (!response.ok) {
    throw new Error(`${response.status}: ${JSON.stringify(data)}`);
  }

  return data;
}

function pretty(data) {
  return JSON.stringify(data, null, 2);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = value ?? "—";
  }
}

function formatImprovementLabel(value) {
  if (value === "lower_cost_than_baseline") {
    return "Lower cost than baseline";
  }
  if (value === "higher_or_equal_cost_than_baseline") {
    return "Higher or equal cost than baseline";
  }
  return value ?? "—";
}

function setHealthStatus(statusText) {
  const el = document.getElementById("health-status");
  if (!el) return;

  const normalized = (statusText || "unknown").toLowerCase();
  el.textContent = statusText ?? "Unknown";

  if (normalized === "healthy") {
    el.style.background = "#14532d";
    el.style.color = "#dcfce7";
    el.style.borderColor = "#166534";
  } else if (normalized === "unavailable") {
    el.style.background = "#7f1d1d";
    el.style.color = "#fee2e2";
    el.style.borderColor = "#991b1b";
  } else {
    el.style.background = "#1f2937";
    el.style.color = "#d1d5db";
    el.style.borderColor = "#273449";
  }
}

function parseCsvText(text) {
  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length < 2) {
    throw new Error("CSV must contain a header and at least one data row.");
  }

  const headers = lines[0].split(",").map(h => h.trim());

  const missingHeaders = FEATURE_NAMES.filter(col => !headers.includes(col));
  const extraHeaders = headers.filter(col => !FEATURE_NAMES.includes(col));

  if (missingHeaders.length > 0) {
    throw new Error(`Missing CSV headers: ${missingHeaders.join(", ")}`);
  }

  if (extraHeaders.length > 0) {
    throw new Error(`Unexpected CSV headers: ${extraHeaders.join(", ")}`);
  }

  const rows = lines.slice(1).map((line, rowIndex) => {
    const values = line.split(",").map(v => v.trim());

    if (values.length !== FEATURE_NAMES.length) {
      throw new Error(
        `Row ${rowIndex + 2} has ${values.length} columns, expected ${FEATURE_NAMES.length}.`
      );
    }

    const row = {};

    FEATURE_NAMES.forEach((header, idx) => {
      const raw = values[idx];

      if (raw === "") {
        throw new Error(`Empty value at row ${rowIndex + 2}, column "${header}"`);
      }

      const parsed = Number(raw);

      if (!Number.isFinite(parsed)) {
        throw new Error(
          `Invalid numeric value at row ${rowIndex + 2}, column "${header}": "${raw}"`
        );
      }

      row[header] = parsed;
    });

    return row;
  });

  return rows;
}

function buildSingleForm() {
  const grid = document.getElementById("single-form-grid");
  grid.innerHTML = "";

  FEATURE_NAMES.forEach((feature) => {
    const wrapper = document.createElement("div");
    wrapper.className = "form-field";

    const label = document.createElement("label");
    label.setAttribute("for", `field-${feature}`);
    label.textContent = feature;

    const input = document.createElement("input");
    input.type = "number";
    input.step = "0.000001";
    input.id = `field-${feature}`;
    input.value = DEFAULT_VALUES[feature];

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    grid.appendChild(wrapper);
  });
}

function populateSingleForm(values) {
  FEATURE_NAMES.forEach((feature) => {
    const input = document.getElementById(`field-${feature}`);
    if (input) {
      input.value = values[feature] ?? 0;
    }
  });
}

function collectSingleFormValues() {
  const data = {};
  FEATURE_NAMES.forEach((feature) => {
    const input = document.getElementById(`field-${feature}`);
    data[feature] = Number(input.value);
  });
  return data;
}

function setupTabs() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab-button").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((tab) => tab.classList.remove("active"));
      button.classList.add("active");
      document.getElementById(button.dataset.tab).classList.add("active");
    });
  });
}

function setupSingleScore() {
  document.getElementById("load-sample-btn").addEventListener("click", () => {
    populateSingleForm(DEFAULT_VALUES);
    document.getElementById("single-json-input").value = pretty(DEFAULT_VALUES);
    showMessage("Sample transaction loaded.");
  });

  document.getElementById("apply-json-btn").addEventListener("click", () => {
    try {
      const parsed = JSON.parse(document.getElementById("single-json-input").value);
      populateSingleForm(parsed);
      showMessage("JSON applied to manual editor.");
    } catch (err) {
      showMessage("Invalid JSON input.", true);
    }
  });

  document.getElementById("single-csv-file").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      singleCsvRows = parseCsvText(text);
      showMessage(`Loaded ${singleCsvRows.length} row(s) for single scoring.`);
    } catch (err) {
      showMessage(err.message, true);
    }
  });

  document.getElementById("use-single-csv-btn").addEventListener("click", () => {
    if (!singleCsvRows.length) {
      showMessage("No CSV loaded for single score.", true);
      return;
    }
    populateSingleForm(singleCsvRows[0]);
    document.getElementById("single-json-input").value = pretty(singleCsvRows[0]);
    showMessage("First CSV row applied.");
  });

  document.getElementById("score-btn").addEventListener("click", async () => {
    try {
      const payload = { data: collectSingleFormValues() };
      const result = await apiCall("POST", "/score", payload);

      setText("single-decision", result.decision);
      setText("single-risk-tier", result.risk_tier);
      setText("single-probability", Number(result.fraud_probability).toFixed(4));
      setText("single-cost", result.decision_cost);
      setText("single-reason", result.reason);
      setText("single-action", result.business_impact?.expected_action);
      setText("single-risk-ignored", result.business_impact?.risk_if_ignored);
      setText("single-cost-note", result.business_impact?.cost_note);
      setText("single-json-result", pretty(result));

      showMessage("Transaction scored successfully.");
    } catch (err) {
      showMessage(err.message, true);
    }
  });
}

function setupBatchEvaluation() {
  document.getElementById("batch-custom-thresholds-check").addEventListener("change", (e) => {
    document.getElementById("batch-review-threshold").disabled = !e.target.checked;
    document.getElementById("batch-block-threshold").disabled = !e.target.checked;
  });

  document.getElementById("batch-csv-file").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      batchCsvRows = parseCsvText(text);
      showMessage(`Loaded ${batchCsvRows.length} row(s) for batch evaluation.`);
    } catch (err) {
      showMessage(err.message, true);
    }
  });

  document.getElementById("evaluate-batch-btn").addEventListener("click", async () => {
    if (!batchCsvRows.length) {
      showMessage("Please upload a CSV for batch evaluation.", true);
      return;
    }

    try {
      const payload = { transactions: batchCsvRows };
      const useCustom = document.getElementById("batch-custom-thresholds-check").checked;

      if (useCustom) {
        payload.review_threshold = Number(document.getElementById("batch-review-threshold").value);
        payload.block_threshold = Number(document.getElementById("batch-block-threshold").value);
      }

      const result = await apiCall("POST", "/evaluate-policy-batch", payload);

      setText("batch-size", result.batch_size);
      setText("batch-avg-prob", result.average_fraud_probability);
      setText("batch-cost", result.estimated_total_decision_cost);
      setText("batch-allow", result.decision_summary?.ALLOW);
      setText("batch-review", result.decision_summary?.REVIEW);
      setText("batch-block", result.decision_summary?.BLOCK);
      setText("batch-json-result", pretty(result));

      showMessage("Batch policy evaluation completed.");
    } catch (err) {
      showMessage(err.message, true);
    }
  });
}

function setupCostImpact() {
  document.getElementById("cost-csv-file").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      costCsvRows = parseCsvText(text);
      showMessage(`Loaded ${costCsvRows.length} row(s) for cost simulation.`);
    } catch (err) {
      showMessage(err.message, true);
    }
  });

  document.getElementById("simulate-cost-btn").addEventListener("click", async () => {
    if (!costCsvRows.length) {
      showMessage("Please upload a CSV for cost simulation.", true);
      return;
    }

    try {
      const payload = {
        transactions: costCsvRows,
        review_threshold: Number(document.getElementById("current-review-threshold").value),
        block_threshold: Number(document.getElementById("current-block-threshold").value),
        baseline_review_threshold: Number(document.getElementById("baseline-review-threshold").value),
        baseline_block_threshold: Number(document.getElementById("baseline-block-threshold").value)
      };

      const result = await apiCall("POST", "/simulate-cost-impact", payload);

      setText("current-policy-cost", result.current_policy?.estimated_total_decision_cost);
      setText("baseline-policy-cost", result.baseline_policy?.estimated_total_decision_cost);
      setText("cost-difference", result.comparison?.cost_difference_vs_baseline);
      setText("cost-improvement", formatImprovementLabel(result.comparison?.improvement));
      setText("current-policy-summary", pretty(result.current_policy?.decision_summary || {}));
      setText("baseline-policy-summary", pretty(result.baseline_policy?.decision_summary || {}));
      setText("cost-json-result", pretty(result));

      showMessage("Cost impact simulation completed.");
    } catch (err) {
      showMessage(err.message, true);
    }
  });
}

async function loadGovernance() {
  try {
    const policy = await apiCall("GET", "/policy");
    const modelInfo = await apiCall("GET", "/model-info");

    setText("gov-review-threshold", policy.thresholds?.review_threshold);
    setText("gov-block-threshold", policy.thresholds?.block_threshold);
    setText("gov-total-cost", policy.policy_summary?.estimated_total_cost);
    setText("gov-feature-count", modelInfo.feature_count);
    setText("cost-assumptions-box", pretty(policy.cost_assumptions || {}));
    setText("governance-box", pretty(policy.governance || {}));
    setText("governance-json-result", pretty(policy));
  } catch (err) {
    showMessage(err.message, true);
  }
}

function setupGovernance() {
  document.getElementById("refresh-governance-btn").addEventListener("click", loadGovernance);

  document.getElementById("check-health-btn").addEventListener("click", async () => {
    try {
      const result = await apiCall("GET", "/health");
      setHealthStatus(result.status || "healthy");
      showMessage("API is reachable.");
    } catch (err) {
      setHealthStatus("Unavailable");
      showMessage(err.message, true);
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  buildSingleForm();
  setupTabs();
  setupSingleScore();
  setupBatchEvaluation();
  setupCostImpact();
  setupGovernance();
  loadGovernance();
  document.getElementById("single-json-input").value = pretty(DEFAULT_VALUES);

  try {
    const result = await apiCall("GET", "/health");
    setHealthStatus(result.status || "healthy");
  } catch (err) {
    setHealthStatus("Unavailable");
  }
});