// --- Sorting Visualizer JS ---
const bubbleBtn = document.getElementById('bubbleBtn');
const selectionBtn = document.getElementById('selectionBtn');
const insertionBtn = document.getElementById('insertionBtn');
const mergeBtn = document.getElementById('mergeBtn');
const quickBtn = document.getElementById('quickBtn');
const heapBtn = document.getElementById('heapBtn');
const arrayInput = document.getElementById('arrayInput');
const setArrayBtn = document.getElementById('setArrayBtn');
const visualization = document.getElementById('visualization');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stepBtn = document.getElementById('stepBtn');
const resetBtn = document.getElementById('resetBtn');
const speedRange = document.getElementById('speedRange');
const stepExplanation = document.getElementById('stepExplanation');
const theoryBox = document.getElementById('theory');
const titleBox = document.querySelector('.sorting-title');
const sortingContainer = document.querySelector('.sorting-container');
const bestCaseGen = document.getElementById('best-case-gen');
const bestCaseSpec = document.getElementById('best-case-spec');
const avgCaseGen = document.getElementById('avg-case-gen');
const avgCaseSpec = document.getElementById('avg-case-spec');
const worstCaseGen = document.getElementById('worst-case-gen');
const worstCaseSpec = document.getElementById('worst-case-spec');

let array = [4, 2, 7, 1, 9, 5];
let algo = 'bubble';
let running = false;
let paused = false;
let interval = null;
let speed = 700;
let steps = [];
let currentStep = 0;
let sortedIndices = [];
let totalStepsTaken = 0;

function setAlgorithm(algoName) {
  algo = algoName;
  // Remove active from all
  [bubbleBtn, selectionBtn, insertionBtn, mergeBtn, quickBtn, heapBtn].forEach(btn => btn.classList.remove('active'));
  // Set active
  if (algoName === 'bubble') bubbleBtn.classList.add('active');
  if (algoName === 'selection') selectionBtn.classList.add('active');
  if (algoName === 'insertion') insertionBtn.classList.add('active');
  if (algoName === 'merge') mergeBtn.classList.add('active');
  if (algoName === 'quick') quickBtn.classList.add('active');
  if (algoName === 'heap') heapBtn.classList.add('active');
  // Update title, theory, and complexity
  if (algoName === 'bubble') {
    titleBox.textContent = 'Bubble Sort Visualizer';
    theoryBox.innerHTML = '<b>Bubble Sort:</b> Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.';
    bestCaseGen.textContent = 'O(n)';
    avgCaseGen.textContent = 'O(n²)';
    worstCaseGen.textContent = 'O(n²)';
  } else if (algoName === 'selection') {
    titleBox.textContent = 'Selection Sort Visualizer';
    theoryBox.innerHTML = '<b>Selection Sort:</b> Repeatedly selects the minimum element from the unsorted part and puts it at the beginning.';
    bestCaseGen.textContent = 'O(n²)';
    avgCaseGen.textContent = 'O(n²)';
    worstCaseGen.textContent = 'O(n²)';
  } else if (algoName === 'insertion') {
    titleBox.textContent = 'Insertion Sort Visualizer';
    theoryBox.innerHTML = '<b>Insertion Sort:</b> Builds the sorted array one item at a time by inserting elements into their correct position.';
    bestCaseGen.textContent = 'O(n)';
    avgCaseGen.textContent = 'O(n²)';
    worstCaseGen.textContent = 'O(n²)';
  } else if (algoName === 'merge') {
    titleBox.textContent = 'Merge Sort Visualizer';
    theoryBox.innerHTML = '<b>Merge Sort:</b> Divides the array into halves, sorts each half, and merges them.';
    bestCaseGen.textContent = 'O(n log n)';
    avgCaseGen.textContent = 'O(n log n)';
    worstCaseGen.textContent = 'O(n log n)';
  } else if (algoName === 'quick') {
    titleBox.textContent = 'Quick Sort Visualizer';
    theoryBox.innerHTML = '<b>Quick Sort:</b> Picks a pivot, partitions the array, and sorts the partitions recursively.';
    bestCaseGen.textContent = 'O(n log n)';
    avgCaseGen.textContent = 'O(n log n)';
    worstCaseGen.textContent = 'O(n²)';
  } else if (algoName === 'heap') {
    titleBox.textContent = 'Heap Sort Visualizer';
    theoryBox.innerHTML = '<b>Heap Sort:</b> Builds a heap and repeatedly extracts the maximum element to sort the array.';
    bestCaseGen.textContent = 'O(n log n)';
    avgCaseGen.textContent = 'O(n log n)';
    worstCaseGen.textContent = 'O(n log n)';
  }
  // Reset specific complexity
  bestCaseSpec.textContent = '';
  avgCaseSpec.textContent = '';
  worstCaseSpec.textContent = '';
  // Reset array and explanation
  resetState();
  sortingContainer.scrollIntoView({ behavior: 'smooth' });
}

function renderArray(active = [], compared = [], sorted = [], swap = [], minIdx = null, keyIdx = null, floatingKey = null) {
  visualization.innerHTML = '';
  visualization.style.display = 'flex';
  visualization.style.justifyContent = 'center';
  visualization.style.alignItems = 'flex-end';
  visualization.style.gap = '0.7rem';
  const minVal = Math.min(...array);
  const maxVal = Math.max(...array);
  const minHeight = 38;
  const maxHeight = 180;
  array.forEach((num, i) => {
    const container = document.createElement('div');
    container.className = 'array-bar-container';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'flex-end';
    container.style.position = 'relative';
    let showKey = false;
    if (floatingKey && i === floatingKey.index) {
      num = floatingKey.value;
      showKey = true;
    }
    const bar = document.createElement('div');
    bar.className = 'array-bar pop-in';
    bar.textContent = num;
    let height;
    if (maxVal === minVal) {
      height = (maxHeight + minHeight) / 2;
    } else {
      height = minHeight + ((num - minVal) / (maxVal - minVal)) * (maxHeight - minHeight);
    }
    bar.style.height = `${height}px`;
    bar.style.transition = 'height 0.4s var(--transition), background 0.3s, color 0.3s, border 0.3s, box-shadow 0.3s, transform 0.3s, left 0.45s cubic-bezier(.68,-0.55,.27,1.55)';
    if (active.includes(i) || compared.includes(i)) bar.classList.add('bar-glow');
    if (swap.includes(i)) bar.classList.add('bar-swap');
    if (active.includes(i)) bar.classList.add('active');
    if (compared.includes(i)) bar.classList.add('compared');
    if (minIdx !== null && i === minIdx) {
      bar.classList.add('active');
      bar.style.border = '2.5px solid var(--accent)';
      bar.style.background = 'var(--secondary)';
    }
    if (keyIdx !== null && i === keyIdx) {
      bar.classList.add('active');
      bar.style.border = '2.5px solid var(--primary)';
      bar.style.background = 'var(--accent)';
      bar.style.color = '#23283a';
    }
    if (showKey) {
      bar.classList.add('active');
      bar.style.border = '2.5px solid var(--primary)';
      bar.style.background = 'var(--accent)';
      bar.style.color = '#23283a';
    }
    if (sorted.includes(i)) {
      bar.classList.add('sorted');
      const check = document.createElement('span');
      check.className = 'bar-check';
      check.innerHTML = '&#10003;';
      container.appendChild(check);
    }
    bar.title = `Index: ${i} | Value: ${num}`;
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
}

function resetState() {
  running = false;
  paused = false;
  clearInterval(interval);
  steps = [];
  currentStep = 0;
  sortedIndices = [];
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  stepBtn.disabled = false;
  stepExplanation.textContent = '';
  bestCaseSpec.textContent = '';
  avgCaseSpec.textContent = '';
  worstCaseSpec.textContent = '';
  renderArray();
}

function bubbleSortSteps(arr) {
  const s = [];
  let n = arr.length;
  let a = arr.slice();
  let sorted = [];
  let totalSwaps = 0;
  for (let i = 0; i < n; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      s.push({
        type: 'compare',
        indices: [j, j + 1],
        arr: a.slice(),
        sorted: sorted.slice(),
        step: s.length
      });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
        totalSwaps++;
        s.push({
          type: 'swap',
          indices: [j, j + 1],
          arr: a.slice(),
          sorted: sorted.slice(),
          step: s.length
        });
      }
    }
    sorted.unshift(n - i - 1);
    s.push({
      type: 'markSorted',
      indices: [n - i - 1],
      arr: a.slice(),
      sorted: sorted.slice(),
      step: s.length
    });
    if (!swapped) break;
  }
  return s;
}

function selectionSortSteps(arr) {
  const s = [];
  let n = arr.length;
  let a = arr.slice();
  let sorted = [];
  for (let i = 0; i < n; i++) {
    let minIdx = i;
    // Highlight the current position
    s.push({
      type: 'selectMin',
      indices: [i],
      minIdx,
      arr: a.slice(),
      sorted: sorted.slice(),
      step: s.length
    });
    for (let j = i + 1; j < n; j++) {
      s.push({
        type: 'compare',
        indices: [minIdx, j],
        minIdx,
        arr: a.slice(),
        sorted: sorted.slice(),
        step: s.length
      });
      if (a[j] < a[minIdx]) {
        minIdx = j;
        s.push({
          type: 'selectMin',
          indices: [i],
          minIdx,
          arr: a.slice(),
          sorted: sorted.slice(),
          step: s.length
        });
      }
    }
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      s.push({
        type: 'swap',
        indices: [i, minIdx],
        minIdx,
        arr: a.slice(),
        sorted: sorted.slice(),
        step: s.length
      });
    }
    sorted.push(i);
    s.push({
      type: 'markSorted',
      indices: [i],
      minIdx: null,
      arr: a.slice(),
      sorted: sorted.slice(),
      step: s.length
    });
  }
  return s;
}

function insertionSortSteps(arr) {
  const s = [];
  let n = arr.length;
  let a = arr.slice();
  let sorted = [];
  for (let i = 1; i < n; i++) {
    let key = a[i];
    let j = i - 1;
    // Highlight the key
    s.push({
      type: 'selectKey',
      indices: [i],
      keyIdx: i,
      arr: a.slice(),
      sorted: sorted.slice(),
      step: s.length
    });
    while (j >= 0 && a[j] > key) {
      // Compare key with a[j]
      s.push({
        type: 'compare',
        indices: [j, j + 1],
        keyIdx: i,
        arr: a.slice(),
        sorted: sorted.slice(),
        step: s.length
      });
      // Shift a[j] to a[j+1]
      a[j + 1] = a[j];
      s.push({
        type: 'shift',
        indices: [j, j + 1],
        keyIdx: i,
        arr: a.slice(),
        sorted: sorted.slice(),
        step: s.length
      });
      j--;
    }
    // Insert key
    a[j + 1] = key;
    s.push({
      type: 'insert',
      indices: [j + 1],
      keyIdx: i,
      arr: a.slice(),
      sorted: sorted.slice(),
      step: s.length
    });
    // Mark sorted up to i
    sorted = [];
    for (let k = 0; k <= i; k++) sorted.push(k);
    s.push({
      type: 'markSorted',
      indices: [i],
      keyIdx: i,
      arr: a.slice(),
      sorted: sorted.slice(),
      step: s.length
    });
  }
  // Mark all sorted if n > 0
  if (n > 0) {
    s.push({
      type: 'markSorted',
      indices: [n - 1],
      keyIdx: n - 1,
      arr: a.slice(),
      sorted: Array.from({ length: n }, (_, i) => i),
      step: s.length
    });
  }
  return s;
}

function mergeSortSteps(arr) {
  const s = [];
  const n = arr.length;
  function mergeSortRecursive(a, l, r, depth, parentArr) {
    if (l >= r) {
      // Base case: single element
      s.push({
        type: 'split',
        arr: a.slice(),
        l, r, depth,
        subarrays: [[l, r]],
        parentArr: parentArr ? parentArr.slice() : a.slice(),
        step: s.length
      });
      return [a[l]];
    }
    const m = Math.floor((l + r) / 2);
    // Show split
    s.push({
      type: 'split',
      arr: a.slice(),
      l, r, m, depth,
      subarrays: [[l, m], [m + 1, r]],
      parentArr: parentArr ? parentArr.slice() : a.slice(),
      step: s.length
    });
    // Sort left and right
    const left = mergeSortRecursive(a, l, m, depth + 1, a);
    const right = mergeSortRecursive(a, m + 1, r, depth + 1, a);
    // Merge
    let i = 0, j = 0, k = l;
    const merged = [];
    while (i < left.length && j < right.length) {
      s.push({
        type: 'compare',
        arr: a.slice(),
        l, r, m, depth,
        left: left.slice(),
        right: right.slice(),
        i, j, k,
        indices: [l + i, m + 1 + j],
        merged: merged.slice(),
        subarrays: [[l, m], [m + 1, r]],
        step: s.length
      });
      if (left[i] <= right[j]) {
        a[k] = left[i];
        merged.push(left[i]);
        i++;
      } else {
        a[k] = right[j];
        merged.push(right[j]);
        j++;
      }
      s.push({
        type: 'merge',
        arr: a.slice(),
        l, r, m, depth,
        left: left.slice(),
        right: right.slice(),
        i, j, k,
        indices: [k],
        merged: merged.slice(),
        subarrays: [[l, m], [m + 1, r]],
        step: s.length
      });
      k++;
    }
    while (i < left.length) {
      a[k] = left[i];
      merged.push(left[i]);
      s.push({
        type: 'merge',
        arr: a.slice(),
        l, r, m, depth,
        left: left.slice(),
        right: right.slice(),
        i, j, k,
        indices: [k],
        merged: merged.slice(),
        subarrays: [[l, m], [m + 1, r]],
        step: s.length
      });
      i++;
      k++;
    }
    while (j < right.length) {
      a[k] = right[j];
      merged.push(right[j]);
      s.push({
        type: 'merge',
        arr: a.slice(),
        l, r, m, depth,
        left: left.slice(),
        right: right.slice(),
        i, j, k,
        indices: [k],
        merged: merged.slice(),
        subarrays: [[l, m], [m + 1, r]],
        step: s.length
      });
      j++;
      k++;
    }
    // Mark merged segment
    s.push({
      type: 'mergedSegment',
      arr: a.slice(),
      l, r, m, depth,
      merged: a.slice(l, r + 1),
      indices: Array.from({ length: r - l + 1 }, (_, idx) => l + idx),
      subarrays: [[l, r]],
      step: s.length
    });
    return a.slice(l, r + 1);
  }
  const a = arr.slice();
  mergeSortRecursive(a, 0, n - 1, 0, null);
  // Mark all sorted at the end
  s.push({
    type: 'markSorted',
    arr: a.slice(),
    sorted: Array.from({ length: n }, (_, i) => i),
    indices: Array.from({ length: n }, (_, i) => i),
    step: s.length
  });
  return s;
}

// Helper to render merge sort steps visually
function renderMergeStep(st) {
  visualization.innerHTML = '';
  visualization.style.display = 'flex';
  visualization.style.justifyContent = 'center';
  visualization.style.alignItems = 'flex-end';
  visualization.style.gap = '0.7rem';
  // Show subarrays as groups
  const arr = st.arr;
  const n = arr.length;
  const minVal = Math.min(...arr);
  const maxVal = Math.max(...arr);
  const minHeight = 38;
  const maxHeight = 180;
  // If split, show subarrays
  if (st.type === 'split') {
    st.subarrays.forEach(([start, end], idx) => {
      const group = document.createElement('div');
      group.style.display = 'flex';
      group.style.flexDirection = 'row';
      group.style.gap = '0.7rem';
      group.style.margin = '0 0.7rem';
      for (let i = start; i <= end; i++) {
        const container = document.createElement('div');
        container.className = 'array-bar-container';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'flex-end';
        container.style.position = 'relative';
        const bar = document.createElement('div');
        bar.className = 'array-bar pop-in';
        bar.textContent = arr[i];
        let height;
        if (maxVal === minVal) {
          height = (maxHeight + minHeight) / 2;
        } else {
          height = minHeight + ((arr[i] - minVal) / (maxVal - minVal)) * (maxHeight - minHeight);
        }
        bar.style.height = `${height}px`;
        bar.style.transition = 'height 0.4s var(--transition), background 0.3s, color 0.3s, border 0.3s, box-shadow 0.3s, transform 0.3s';
        bar.style.background = idx === 0 ? 'var(--primary)' : 'var(--accent)';
        bar.style.color = idx === 0 ? '#fff' : '#23283a';
        container.appendChild(bar);
        const idxSpan = document.createElement('span');
        idxSpan.className = 'array-index';
        idxSpan.textContent = i;
        container.appendChild(idxSpan);
        group.appendChild(container);
      }
      visualization.appendChild(group);
    });
  } else if (st.type === 'compare' || st.type === 'merge') {
    // Show left, right, and merged
    const leftGroup = document.createElement('div');
    leftGroup.style.display = 'flex';
    leftGroup.style.flexDirection = 'row';
    leftGroup.style.gap = '0.7rem';
    leftGroup.style.margin = '0 0.7rem';
    st.left.forEach((val, i) => {
      const container = document.createElement('div');
      container.className = 'array-bar-container';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.alignItems = 'center';
      container.style.justifyContent = 'flex-end';
      container.style.position = 'relative';
      const bar = document.createElement('div');
      bar.className = 'array-bar pop-in';
      bar.textContent = val;
      let height;
      if (maxVal === minVal) {
        height = (maxHeight + minHeight) / 2;
      } else {
        height = minHeight + ((val - minVal) / (maxVal - minVal)) * (maxHeight - minHeight);
      }
      bar.style.height = `${height}px`;
      bar.style.transition = 'height 0.4s var(--transition), background 0.3s, color 0.3s, border 0.3s, box-shadow 0.3s, transform 0.3s';
      bar.style.background = 'var(--primary)';
      bar.style.color = '#fff';
      if (st.type === 'compare' && i === st.i) bar.classList.add('active');
      container.appendChild(bar);
      leftGroup.appendChild(container);
    });
    visualization.appendChild(leftGroup);
    const rightGroup = document.createElement('div');
    rightGroup.style.display = 'flex';
    rightGroup.style.flexDirection = 'row';
    rightGroup.style.gap = '0.7rem';
    rightGroup.style.margin = '0 0.7rem';
    st.right.forEach((val, j) => {
      const container = document.createElement('div');
      container.className = 'array-bar-container';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.alignItems = 'center';
      container.style.justifyContent = 'flex-end';
      container.style.position = 'relative';
      const bar = document.createElement('div');
      bar.className = 'array-bar pop-in';
      bar.textContent = val;
      let height;
      if (maxVal === minVal) {
        height = (maxHeight + minHeight) / 2;
      } else {
        height = minHeight + ((val - minVal) / (maxVal - minVal)) * (maxHeight - minHeight);
      }
      bar.style.height = `${height}px`;
      bar.style.transition = 'height 0.4s var(--transition), background 0.3s, color 0.3s, border 0.3s, box-shadow 0.3s, transform 0.3s';
      bar.style.background = 'var(--accent)';
      bar.style.color = '#23283a';
      if (st.type === 'compare' && j === st.j) bar.classList.add('active');
      container.appendChild(bar);
      rightGroup.appendChild(container);
    });
    visualization.appendChild(rightGroup);
    // Merged so far
    if (st.merged && st.merged.length > 0) {
      const mergedGroup = document.createElement('div');
      mergedGroup.style.display = 'flex';
      mergedGroup.style.flexDirection = 'row';
      mergedGroup.style.gap = '0.7rem';
      mergedGroup.style.margin = '0 0.7rem';
      st.merged.forEach((val, idx) => {
        const container = document.createElement('div');
        container.className = 'array-bar-container';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'flex-end';
        container.style.position = 'relative';
        const bar = document.createElement('div');
        bar.className = 'array-bar pop-in';
        bar.textContent = val;
        let height;
        if (maxVal === minVal) {
          height = (maxHeight + minHeight) / 2;
        } else {
          height = minHeight + ((val - minVal) / (maxVal - minVal)) * (maxHeight - minHeight);
        }
        bar.style.height = `${height}px`;
        bar.style.transition = 'height 0.4s var(--transition), background 0.3s, color 0.3s, border 0.3s, box-shadow 0.3s, transform 0.3s';
        bar.style.background = 'var(--secondary)';
        bar.style.color = '#23283a';
        container.appendChild(bar);
        mergedGroup.appendChild(container);
      });
      visualization.appendChild(mergedGroup);
    }
  } else if (st.type === 'mergedSegment' || st.type === 'markSorted') {
    // Show the full array, highlight merged/sorted segment
    const arr = st.arr;
    const n = arr.length;
    const minVal = Math.min(...arr);
    const maxVal = Math.max(...arr);
    const minHeight = 38;
    const maxHeight = 180;
    for (let i = 0; i < n; i++) {
      const container = document.createElement('div');
      container.className = 'array-bar-container';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.alignItems = 'center';
      container.style.justifyContent = 'flex-end';
      container.style.position = 'relative';
      const bar = document.createElement('div');
      bar.className = 'array-bar pop-in';
      bar.textContent = arr[i];
      let height;
      if (maxVal === minVal) {
        height = (maxHeight + minHeight) / 2;
      } else {
        height = minHeight + ((arr[i] - minVal) / (maxVal - minVal)) * (maxHeight - minHeight);
      }
      bar.style.height = `${height}px`;
      bar.style.transition = 'height 0.4s var(--transition), background 0.3s, color 0.3s, border 0.3s, box-shadow 0.3s, transform 0.3s';
      if (st.indices && st.indices.includes(i)) {
        bar.classList.add('active');
        bar.style.background = 'var(--accent)';
        bar.style.color = '#23283a';
      }
      if (st.sorted && st.sorted.includes(i)) {
        bar.classList.add('sorted');
        const check = document.createElement('span');
        check.className = 'bar-check';
        check.innerHTML = '&#10003;';
        container.appendChild(check);
      }
      container.appendChild(bar);
      const idx = document.createElement('span');
      idx.className = 'array-index';
      idx.textContent = i;
      container.appendChild(idx);
      visualization.appendChild(container);
    }
  }
}

function showComplexityResult(stepsTaken, arrLength) {
  bestCaseSpec.textContent = '';
  avgCaseSpec.textContent = '';
  worstCaseSpec.textContent = '';
  // Determine which case to show the step count for
  let caseType = 'worst';
  if (algo === 'bubble') {
    if (stepsTaken === arrLength - 1) {
      caseType = 'best';
    } else if (stepsTaken > arrLength - 1 && stepsTaken < arrLength * (arrLength - 1) / 2) {
      caseType = 'avg';
    } else {
      caseType = 'worst';
    }
  } else if (algo === 'selection') {
    // Selection sort always O(n^2) for all cases
    caseType = 'worst';
  } else if (algo === 'insertion') {
    // Insertion sort has a linear time complexity for best case
    caseType = 'best';
  }
  const stepsText = `(${stepsTaken} steps)`;
  if (caseType === 'best') {
    bestCaseSpec.textContent = stepsText;
  } else if (caseType === 'avg') {
    avgCaseSpec.textContent = stepsText;
  } else {
    worstCaseSpec.textContent = stepsText;
  }
}

function prepareSteps() {
  if (algo === 'bubble') {
    steps = bubbleSortSteps(array);
  } else if (algo === 'selection') {
    steps = selectionSortSteps(array);
  } else if (algo === 'insertion') {
    steps = insertionSortSteps(array);
  } else if (algo === 'merge') {
    steps = mergeSortSteps(array);
  } else {
    steps = [];
  }
}

function runStep() {
  if (!steps.length) prepareSteps();
  if (currentStep >= steps.length) {
    stepExplanation.innerHTML = `<span style=\"color:var(--accent)\">Array is sorted! <span style='font-size:1.2em;'>&#10003;</span></span>`;
    running = false;
    startBtn.disabled = true;
    pauseBtn.disabled = true;
    stepBtn.disabled = true;
    totalStepsTaken = currentStep;
    setTimeout(() => {
      showComplexityResult(totalStepsTaken, array.length);
    }, 0);
    if (algo === 'merge') {
      renderMergeStep(steps[steps.length - 1]);
    } else {
      renderArray([], [], steps.length ? steps[steps.length - 1].sorted : []);
    }
    return;
  }
  const st = steps[currentStep];
  const stepPrefix = `<span style='color:var(--primary);font-size:0.98em;'>Step ${currentStep + 1} of ${steps.length}:</span> `;
  if (algo === 'merge') {
    // For merge sort, use custom renderer and explanations
    if (st.type === 'split') {
      renderMergeStep(st);
      stepExplanation.innerHTML = stepPrefix + `Splitting array segment <b>[${st.l}..${st.r}]</b> into subarrays.`;
      currentStep++;
      startBtn.disabled = running;
      pauseBtn.disabled = !running;
      stepBtn.disabled = false;
    } else if (st.type === 'compare') {
      renderMergeStep(st);
      stepExplanation.innerHTML = stepPrefix + `Comparing <b>${st.left[st.i]}</b> (left) and <b>${st.right[st.j]}</b> (right)`;
      currentStep++;
      startBtn.disabled = running;
      pauseBtn.disabled = !running;
      stepBtn.disabled = false;
    } else if (st.type === 'merge') {
      renderMergeStep(st);
      stepExplanation.innerHTML = stepPrefix + `Merging value <b>${st.arr[st.k]}</b> into position <b>${st.k}</b>`;
      currentStep++;
      startBtn.disabled = running;
      pauseBtn.disabled = !running;
      stepBtn.disabled = false;
    } else if (st.type === 'mergedSegment') {
      renderMergeStep(st);
      stepExplanation.innerHTML = stepPrefix + `Merged segment <b>[${st.l}..${st.r}]</b> is now sorted.`;
      currentStep++;
      startBtn.disabled = running;
      pauseBtn.disabled = !running;
      stepBtn.disabled = false;
    } else if (st.type === 'markSorted') {
      renderMergeStep(st);
      stepExplanation.innerHTML = `<span style=\"color:var(--accent)\">Array is sorted! <span style='font-size:1.2em;'>&#10003;</span></span>`;
      currentStep++;
      startBtn.disabled = true;
      pauseBtn.disabled = true;
      stepBtn.disabled = true;
    }
    return;
  }
  if (algo === 'insertion') {
    if (st.type === 'shift') {
      // For shift, update the array to the new state before rendering
      array = st.arr.slice();
      renderArray([], [], st.sorted, [], null, st.keyIdx);
      const [from, to] = st.indices;
      const barContainers = Array.from(visualization.children);
      if (barContainers[from] && barContainers[to]) {
        barContainers.forEach(c => c.style.position = 'relative');
        const dist = (to - from) * (barContainers[from].offsetWidth + 12);
        barContainers[from].style.zIndex = '10';
        barContainers[from].style.transition = 'left 0.45s cubic-bezier(.68,-0.55,.27,1.55)';
        barContainers[from].style.left = `${dist}px`;
        barContainers[from].querySelector('.array-bar').classList.add('bar-swap');
        stepExplanation.innerHTML = stepPrefix + `Shifting <b>${st.arr[from]}</b> from index ${from} to index ${to}`;
        startBtn.disabled = true;
        pauseBtn.disabled = true;
        stepBtn.disabled = true;
        setTimeout(() => {
          renderArray([], [], st.sorted, [], null, st.keyIdx);
          currentStep++;
          if (currentStep >= steps.length) {
            startBtn.disabled = true;
            pauseBtn.disabled = true;
            stepBtn.disabled = true;
          } else {
            startBtn.disabled = running;
            pauseBtn.disabled = !running;
            stepBtn.disabled = false;
          }
          if (running && !paused) runStep();
        }, 450);
      } else {
        renderArray([], [], st.sorted, [], null, st.keyIdx);
        setTimeout(() => {
          currentStep++;
          startBtn.disabled = running;
          pauseBtn.disabled = !running;
          stepBtn.disabled = false;
          if (running && !paused) runStep();
        }, 450);
      }
      return;
    }
    // For all other steps, sync the global array to the step's arr for correct visualization
    array = st.arr.slice();
    if (st.type === 'selectKey') {
      renderArray([], [], st.sorted, [], null, st.keyIdx);
      stepExplanation.innerHTML = stepPrefix + `Selecting key <b>${st.arr[st.keyIdx]}</b> at index <b>${st.keyIdx}</b>`;
      currentStep++;
      startBtn.disabled = running;
      pauseBtn.disabled = !running;
      stepBtn.disabled = false;
    } else if (st.type === 'compare') {
      renderArray([], st.indices, st.sorted, [], null, st.keyIdx);
      stepExplanation.innerHTML = stepPrefix + `Comparing key <b>${st.arr[st.keyIdx]}</b> with <b>${st.arr[st.indices[0]]}</b> (index ${st.indices[0]})`;
      currentStep++;
      startBtn.disabled = running;
      pauseBtn.disabled = !running;
      stepBtn.disabled = false;
    } else if (st.type === 'insert') {
      renderArray([st.indices[0]], [], st.sorted, [], null, st.keyIdx);
      stepExplanation.innerHTML = stepPrefix + `Inserting key <b>${st.arr[st.keyIdx]}</b> at index <b>${st.indices[0]}</b>`;
      currentStep++;
      startBtn.disabled = running;
      pauseBtn.disabled = !running;
      stepBtn.disabled = false;
    } else if (st.type === 'markSorted') {
      renderArray([], [], st.sorted, [], null, st.keyIdx);
      stepExplanation.innerHTML = stepPrefix + `Marked index <b>${st.indices[0]}</b> as sorted <span style='color:var(--accent);font-size:1.1em;'>&#10003;</span>`;
      currentStep++;
      startBtn.disabled = running;
      pauseBtn.disabled = !running;
      stepBtn.disabled = false;
    }
    return;
  }
  // Bubble sort
  if (st.type === 'compare') {
    renderArray([], st.indices, st.sorted);
    stepExplanation.innerHTML = stepPrefix + `Comparing <b>${st.arr[st.indices[0]]}</b> and <b>${st.arr[st.indices[1]]}</b> <span style='color:var(--accent);font-size:0.98em;'>(indices ${st.indices[0]}, ${st.indices[1]})</span>`;
    currentStep++;
    startBtn.disabled = running;
    pauseBtn.disabled = !running;
    stepBtn.disabled = false;
  } else if (st.type === 'swap') {
    const [i, j] = st.indices;
    const barContainers = Array.from(visualization.children);
    if (barContainers[i] && barContainers[j]) {
      barContainers.forEach(c => c.style.position = 'relative');
      const dist = (j - i) * (barContainers[i].offsetWidth + 12);
      barContainers[i].style.zIndex = '10';
      barContainers[j].style.zIndex = '10';
      barContainers[i].style.transition = 'left 0.45s cubic-bezier(.68,-0.55,.27,1.55)';
      barContainers[j].style.transition = 'left 0.45s cubic-bezier(.68,-0.55,.27,1.55)';
      barContainers[i].style.left = `${dist}px`;
      barContainers[j].style.left = `${-dist}px`;
      barContainers[i].querySelector('.array-bar').classList.add('bar-swap');
      barContainers[j].querySelector('.array-bar').classList.add('bar-swap');
      stepExplanation.innerHTML = stepPrefix + `Swapping <b>${st.arr[j]}</b> and <b>${st.arr[i]}</b> <span style='color:var(--accent);font-size:0.98em;'>(indices ${i}, ${j})</span>`;
      startBtn.disabled = true;
      pauseBtn.disabled = true;
      stepBtn.disabled = true;
      setTimeout(() => {
        [array[i], array[j]] = [array[j], array[i]];
        renderArray([], [], st.sorted);
        currentStep++;
        if (currentStep >= steps.length) {
          startBtn.disabled = true;
          pauseBtn.disabled = true;
          stepBtn.disabled = true;
        } else {
          startBtn.disabled = running;
          pauseBtn.disabled = !running;
          stepBtn.disabled = false;
        }
        if (running && !paused) runStep();
      }, 450);
    } else {
      [array[i], array[j]] = [array[j], array[i]];
      renderArray([], [], st.sorted);
      currentStep++;
      startBtn.disabled = running;
      pauseBtn.disabled = !running;
      stepBtn.disabled = false;
      if (running && !paused) runStep();
    }
  } else if (st.type === 'markSorted') {
    renderArray([], [], st.sorted);
    stepExplanation.innerHTML = stepPrefix + `Marked index <b>${st.indices[0]}</b> as sorted <span style='color:var(--accent);font-size:1.1em;'>&#10003;</span>`;
    currentStep++;
    startBtn.disabled = running;
    pauseBtn.disabled = !running;
    stepBtn.disabled = false;
  }
}

function startAnimation() {
  if (currentStep >= steps.length) return; // Don't start if sorting is finished
  running = true;
  paused = false;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  stepBtn.disabled = true;
  interval = setInterval(() => {
    if (!paused) {
      if (currentStep < steps.length) {
        runStep();
      } else {
        clearInterval(interval);
        running = false;
        startBtn.disabled = true;
        pauseBtn.disabled = true;
        stepBtn.disabled = true;
      }
    } else {
      clearInterval(interval);
    }
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

setArrayBtn.onclick = () => {
  parseInput();
  resetState();
  prepareSteps();
  renderArray();
  stepExplanation.innerHTML = `<span style="color:var(--primary)">Array set! Ready to sort.</span>`;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  stepBtn.disabled = false;
};

bubbleBtn.onclick = () => setAlgorithm('bubble');
selectionBtn.onclick = () => setAlgorithm('selection');
insertionBtn.onclick = () => setAlgorithm('insertion');
mergeBtn.onclick = () => setAlgorithm('merge');
quickBtn.onclick = () => setAlgorithm('quick');
heapBtn.onclick = () => setAlgorithm('heap');

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
  renderArray();
};
speedRange.oninput = (e) => {
  const minDelay = 200, maxDelay = 2000;
  const val = Number(e.target.value);
  speed = maxDelay - (val - minDelay);
  if (running && interval) {
    clearInterval(interval);
    startAnimation();
  }
};

window.addEventListener('DOMContentLoaded', () => {
  setAlgorithm('bubble');
}); 