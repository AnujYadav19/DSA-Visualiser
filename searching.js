// --- Linear & Binary Search Visualizer JS ---
const linearBtn = document.getElementById('linearBtn');
const binaryBtn = document.getElementById('binaryBtn');
const arrayInput = document.getElementById('arrayInput');
const targetInput = document.getElementById('targetInput');
const setArrayBtn = document.getElementById('setArrayBtn');
const visualization = document.getElementById('visualization');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stepBtn = document.getElementById('stepBtn');
const resetBtn = document.getElementById('resetBtn');
const speedRange = document.getElementById('speedRange');
const stepExplanation = document.getElementById('stepExplanation');
const theoryBox = document.getElementById('theory');
const titleBox = document.querySelector('.searching-title');
const searchingContainer = document.querySelector('.searching-container');
const complexityBox = document.getElementById('complexityBox');
const bestCaseGen = document.getElementById('best-case-gen');
const bestCaseSpec = document.getElementById('best-case-spec');
const avgCaseGen = document.getElementById('avg-case-gen');
const avgCaseSpec = document.getElementById('avg-case-spec');
const worstCaseGen = document.getElementById('worst-case-gen');
const worstCaseSpec = document.getElementById('worst-case-spec');

let array = [4, 2, 7, 1, 9, 5];
let target = 7;
let algo = 'linear';
let currentStep = 0;
let running = false;
let paused = false;
let interval = null;
let speed = 700;
let steps = [];
let sortedArray = [];
let tooltipTimeout = null;

function showComplexityResult(stepsTaken, caseType, arrLength) {
  bestCaseSpec.textContent = '';
  avgCaseSpec.textContent = '';
  worstCaseSpec.textContent = '';

  const stepsText = `(${stepsTaken} step${stepsTaken > 1 ? 's' : ''} for n=${arrLength})`;

  if (caseType === 'best') {
    bestCaseSpec.textContent = stepsText;
  } else if (caseType === 'average') {
    avgCaseSpec.textContent = stepsText;
  } else if (caseType === 'worst') {
    worstCaseSpec.textContent = stepsText;
  }
}

function renderArray(activeIdx = -1, foundIdx = -1, checkedIdxs = [], popIn = false, l = null, r = null, m = null) {
  visualization.innerHTML = '';
  visualization.style.display = 'flex';
  visualization.style.justifyContent = 'center';
  visualization.style.alignItems = 'flex-end';
  visualization.style.gap = '0.7rem';
  const arr = (algo === 'binary') ? sortedArray : array;
  arr.forEach((num, i) => {
    const container = document.createElement('div');
    container.className = 'array-bar-container';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    // Bar
    const bar = document.createElement('div');
    bar.className = 'array-bar';
    bar.textContent = num;
    if (i === foundIdx) bar.classList.add('found');
    else if (i === activeIdx) bar.classList.add('active');
    else if (checkedIdxs.includes(i)) bar.classList.add('checked');
    if (popIn) bar.classList.add('pop-in');
    // Arrow above active
    if (algo === 'linear' && i === activeIdx) {
      const arrow = document.createElement('div');
      arrow.className = 'arrow';
      arrow.innerHTML = '↓';
      bar.appendChild(arrow);
    }
    // Binary search pointers
    if (algo === 'binary') {
      if (i === m) {
        const midArrow = document.createElement('div');
        midArrow.className = 'arrow';
        midArrow.innerHTML = '↓';
        midArrow.style.color = 'var(--accent)';
        bar.appendChild(midArrow);
      }
      if (i === l) {
        const lPtr = document.createElement('div');
        lPtr.textContent = 'L';
        lPtr.style.position = 'absolute';
        lPtr.style.top = '-22px';
        lPtr.style.left = '8px';
        lPtr.style.fontSize = '0.95em';
        lPtr.style.color = 'var(--primary)';
        bar.appendChild(lPtr);
      }
      if (i === r) {
        const rPtr = document.createElement('div');
        rPtr.textContent = 'R';
        rPtr.style.position = 'absolute';
        rPtr.style.top = '-22px';
        rPtr.style.right = '8px';
        rPtr.style.fontSize = '0.95em';
        rPtr.style.color = 'var(--primary)';
        bar.appendChild(rPtr);
      }
    }
    // Index
    const idx = document.createElement('span');
    idx.className = 'array-index';
    idx.textContent = i;
    container.appendChild(bar);
    container.appendChild(idx);
    visualization.appendChild(container);
  });
}

function parseInput() {
  const arr = arrayInput.value.split(/,|\s+/).map(s => s.trim()).filter(Boolean).map(Number);
  if (arr.length > 0 && arr.every(x => !isNaN(x))) array = arr;
  if (targetInput.value !== '') target = Number(targetInput.value);
}

function resetState() {
  currentStep = 0;
  running = false;
  paused = false;
  clearInterval(interval);
  steps = [];
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  stepBtn.disabled = false;
  stepExplanation.textContent = '';
  bestCaseSpec.textContent = '';
  avgCaseSpec.textContent = '';
  worstCaseSpec.textContent = '';
  renderArray();
}

function linearSearchSteps(arr, tgt) {
  const s = [];
  for (let i = 0; i < arr.length; i++) {
    s.push({active: i, found: arr[i] === tgt ? i : -1, checked: s.map(st => st.active)});
    if (arr[i] === tgt) break;
  }
  return s;
}

function binarySearchSteps(arr, tgt) {
  const s = [];
  let l = 0, r = arr.length - 1;
  let checked = [];
  while (l <= r) {
    let m = Math.floor((l + r) / 2);
    checked = checked.concat(Array.from({length: r-l+1}, (_,i)=>l+i));
    s.push({active: m, found: arr[m] === tgt ? m : -1, checked: checked.slice(), l, r, m});
    if (arr[m] === tgt) break;
    else if (arr[m] < tgt) l = m + 1;
    else r = m - 1;
  }
  return s;
}

function prepareSteps() {
  if (algo === 'linear') {
    steps = linearSearchSteps(array, target);
  } else {
    sortedArray = [...array].sort((a, b) => a - b);
    steps = binarySearchSteps(sortedArray, target);
  }
}

function runStep() {
  if (array.length === 0) {
    stepExplanation.innerHTML = '<span style="color:var(--accent)">Array is empty!</span>';
    renderArray();
    running = false;
    startBtn.disabled = true;
    pauseBtn.disabled = true;
    stepBtn.disabled = true;
    return;
  }
  if (isNaN(target)) {
    stepExplanation.innerHTML = '<span style="color:var(--accent)">Please enter a valid element to search.</span>';
    renderArray();
    running = false;
    startBtn.disabled = true;
    pauseBtn.disabled = true;
    stepBtn.disabled = true;
    return;
  }
  if (currentStep >= steps.length) {
    stepExplanation.innerHTML = `<span style="color:var(--accent)">Element not found in the array.</span>`;
    running = false;
    startBtn.disabled = true;
    pauseBtn.disabled = true;
    stepBtn.disabled = true;
    if (algo === 'linear') {
      showComplexityResult(currentStep, 'worst', array.length);
      renderArray(-1, -1, steps.length ? steps[steps.length-1].checked : []);
    } else {
      showComplexityResult(currentStep, 'worst', sortedArray.length);
      renderArray(-1, -1, steps.length ? steps[steps.length-1].checked : [], false, null, null, null);
    }
    return;
  }
  const st = steps[currentStep];
  if (algo === 'linear') {
    renderArray(st.active, st.found, st.checked);
    if (st.found !== -1) {
      stepExplanation.innerHTML = `<span style="color:var(--accent)">Element <b>${target}</b> found at index <b>${st.found}</b>!</span>`;
      running = false;
      startBtn.disabled = true;
      pauseBtn.disabled = true;
      stepBtn.disabled = true;
      const caseType = st.found === 0 ? 'best' : (currentStep + 1 < array.length ? 'average' : 'worst');
      showComplexityResult(currentStep + 1, caseType, array.length);
      return;
    } else {
      stepExplanation.innerHTML = `Checking index <b>${st.active}</b>: <b>${array[st.active]}</b> ${array[st.active] === target ? '==' : '≠'} <b>${target}</b>`;
    }
  } else {
    renderArray(st.active, st.found, st.checked, false, st.l, st.r, st.m);
    if (st.found !== -1) {
      stepExplanation.innerHTML = `<span style="color:var(--accent)">Element <b>${target}</b> found at index <b>${st.m}</b>!</span>`;
      running = false;
      startBtn.disabled = true;
      pauseBtn.disabled = true;
      stepBtn.disabled = true;
      const caseType = currentStep === 0 ? 'best' : 'average';
      showComplexityResult(currentStep + 1, caseType, sortedArray.length);
      return;
    } else {
      stepExplanation.innerHTML = `L=<b>${st.l}</b>, R=<b>${st.r}</b>, M=<b>${st.m}</b>: <b>${sortedArray[st.m]}</b> ${sortedArray[st.m] === target ? '==' : (sortedArray[st.m] < target ? '&lt;' : '&gt;')} <b>${target}</b>`;
    }
  }
  currentStep++;
}

function startAnimation() {
  if (running) return;
  running = true;
  paused = false;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  stepBtn.disabled = true;
  interval = setInterval(() => {
    if (!paused) runStep();
    if (!running) clearInterval(interval);
  }, speed);
}

function pauseAnimation() {
  paused = true;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  stepBtn.disabled = false;
  clearInterval(interval);
}

function stepAnimation() {
  if (!steps.length) prepareSteps();
  if (currentStep < steps.length) {
    runStep();
  }
}

function setArray() {
  parseInput();
  resetState();
  prepareSteps();
  // Animate array pop-in
  if (algo === 'linear') {
    renderArray(-1, -1, [], true);
    stepExplanation.innerHTML = `<span style="color:var(--primary)">Array set! Ready to search for <b>${target}</b>.</span>`;
  } else {
    renderArray(-1, -1, [], true, null, null, null);
    stepExplanation.innerHTML = `<span style="color:var(--primary)">Array set (sorted)! Ready to search for <b>${target}</b> using Binary Search.</span>`;
  }
  // Enable controls after setting array
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  stepBtn.disabled = false;
}

function updateSpeedSliderBg() {
  const slider = speedRange;
  const min = Number(slider.min);
  const max = Number(slider.max);
  const val = Number(slider.value);
  const percent = ((val - min) / (max - min)) * 100;
  slider.style.background = `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percent}%, #e3e8f0 ${percent}%, #e3e8f0 100%)`;
}
speedRange.addEventListener('input', updateSpeedSliderBg);
window.addEventListener('DOMContentLoaded', updateSpeedSliderBg);

// --- Event Listeners ---
setArrayBtn.onclick = setArray;
startBtn.onclick = () => {
  if (!steps.length) prepareSteps();
  startAnimation();
};
pauseBtn.onclick = pauseAnimation;
stepBtn.onclick = () => {
  if (!steps.length) prepareSteps();
  stepAnimation();
};
resetBtn.onclick = () => {
  resetState();
  prepareSteps();
  if (algo === 'linear') renderArray();
  else renderArray(-1, -1, [], false, null, null, null);
};
speedRange.oninput = (e) => {
  // Invert: right = fast (min delay), left = slow (max delay)
  const minDelay = 200, maxDelay = 2000;
  const val = Number(e.target.value);
  // Map: left (min) = maxDelay, right (max) = minDelay
  speed = maxDelay - (val - minDelay);
  if (running && interval) {
    clearInterval(interval);
    startAnimation();
  }
  updateSpeedSliderBg();
};

// --- Toggle logic ---
linearBtn.onclick = () => {
  algo = 'linear';
  linearBtn.classList.add('active');
  binaryBtn.classList.remove('active');
  titleBox.textContent = 'Linear Search Visualizer';
  theoryBox.innerHTML = '<b>Linear Search:</b> Checks elements sequentially.<br><br>Finds an element by checking each one from the start. Simple but can be slow for large datasets.';
  bestCaseGen.textContent = 'O(1)';
  avgCaseGen.textContent = 'O(n)';
  worstCaseGen.textContent = 'O(n)';
  setArray();
  searchingContainer.scrollIntoView({ behavior: 'smooth' });
};
binaryBtn.onclick = () => {
  algo = 'binary';
  binaryBtn.classList.add('active');
  linearBtn.classList.remove('active');
  titleBox.textContent = 'Binary Search Visualizer';
  theoryBox.innerHTML = '<b>Binary Search:</b> Efficiently finds an item on a <b>sorted</b> array by repeatedly dividing the search interval in half.<br><span style="color:var(--accent);font-size:0.98em;">(Array is sorted automatically for this visualisation)</span>';
  bestCaseGen.textContent = 'O(1)';
  avgCaseGen.textContent = 'O(log n)';
  worstCaseGen.textContent = 'O(log n)';
  setArray();
  searchingContainer.scrollIntoView({ behavior: 'smooth' });
};

// --- Initial Render ---
// setArray();
// updateSpeedSliderBg();
linearBtn.onclick();
updateSpeedSliderBg();

// --- Tooltips for homepage links (future use) ---
// (No tooltip logic) 