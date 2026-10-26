const screen = document.getElementById("screen");

let current = "0";       // value currently being typed / shown
let previous = null;     // stored operand
let operator = null;     // pending operator
let overwrite = true;    // next digit press should replace the screen
let errored = false;

const MAX_DIGITS = 12;

function formatForDisplay(value) {
  if (Number.isNaN(value) || !Number.isFinite(value)) return "Error";
  let str = String(value);
  if (str.length > MAX_DIGITS && str.includes(".")) {
    str = Number(value).toPrecision(MAX_DIGITS - 2);
    str = String(Number(str));
  }
  return str;
}

function render() {
  screen.textContent = current;
  screen.classList.toggle("is-error", errored);
}

function clearOperatorHighlight() {
  document
    .querySelectorAll(".key--op")
    .forEach((btn) => btn.classList.remove("is-active"));
}

function inputDigit(d) {
  if (errored) resetAll();
  if (overwrite) {
    current = d === "." ? "0." : d;
    overwrite = false;
  } else {
    if (current.replace("-", "").replace(".", "").length >= MAX_DIGITS) return;
    current = current === "0" && d !== "." ? d : current + d;
  }
  render();
}

function inputDecimal() {
  if (errored) resetAll();
  if (overwrite) {
    current = "0.";
    overwrite = false;
    render();
    return;
  }
  if (!current.includes(".")) {
    current += ".";
    render();
  }
}

function compute(a, b, op) {
  const x = parseFloat(a);
  const y = parseFloat(b);
  switch (op) {
    case "+":
      return x + y;
    case "−":
      return x - y;
    case "×":
      return x * y;
    case "÷":
      if (y === 0) return NaN;
      return x / y;
    default:
      return y;
  }
}

function setOperator(op) {
  if (errored) return;

  if (operator && !overwrite) {
    // chain: resolve the pending operation first
    const result = compute(previous, current, operator);
    if (Number.isNaN(result)) {
      showError();
      return;
    }
    previous = String(result);
    current = formatForDisplay(result);
  } else {
    previous = current;
  }

  operator = op;
  overwrite = true;

  clearOperatorHighlight();
  const btn = document.querySelector(`.key--op[data-value="${op}"]`);
  if (btn) btn.classList.add("is-active");

  render();
}

function equals() {
  if (errored) return;
  if (operator === null || previous === null) return;

  const result = compute(previous, current, operator);
  clearOperatorHighlight();

  if (Number.isNaN(result)) {
    showError();
    return;
  }

  current = formatForDisplay(result);
  previous = null;
  operator = null;
  overwrite = true;
  render();
}

function showError() {
  errored = true;
  current = "Cannot divide by zero";
  previous = null;
  operator = null;
  overwrite = true;
  render();
}

function backspace() {
  if (errored) {
    resetAll();
    return;
  }
  if (overwrite) return;
  current = current.length > 1 ? current.slice(0, -1) : "0";
  if (current === "-" || current === "") current = "0";
  if (current === "0") overwrite = true;
  render();
}

function percent() {
  if (errored) resetAll();
  const value = parseFloat(current) / 100;
  current = formatForDisplay(value);
  overwrite = true;
  render();
}

function resetAll() {
  current = "0";
  previous = null;
  operator = null;
  overwrite = true;
  errored = false;
  clearOperatorHighlight();
  render();
}

document.querySelector(".calc__grid").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const { action, value } = btn.dataset;

  switch (action) {
    case "digit":
      inputDigit(value);
      break;
    case "decimal":
      inputDecimal();
      break;
    case "operator":
      setOperator(value);
      break;
    case "equals":
      equals();
      break;
    case "clear":
      resetAll();
      break;
    case "backspace":
      backspace();
      break;
    case "percent":
      percent();
      break;
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") inputDigit(e.key);
  else if (e.key === ".") inputDecimal();
  else if (e.key === "+") setOperator("+");
  else if (e.key === "-") setOperator("−");
  else if (e.key === "*") setOperator("×");
  else if (e.key === "/") {
    e.preventDefault();
    setOperator("÷");
  } else if (e.key === "Enter" || e.key === "=") equals();
  else if (e.key === "Backspace") backspace();
  else if (e.key === "Escape") resetAll();
});

render();
