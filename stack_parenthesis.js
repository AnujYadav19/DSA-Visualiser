// --- Parenthesis Matching Visualizer JS ---

const exprInput = document.getElementById('exprInput');
const checkBtn = document.getElementById('checkBtn');
const exprVisualization = document.getElementById('exprVisualization');
const stackVisualization = document.getElementById('stackVisualization');
const stepExplanation = document.getElementById('stepExplanation');

const PAIRS = {
    '(': ')',
    '[': ']',
    '{': '}'
};
const OPEN = Object.keys(PAIRS);
const CLOSE = Object.values(PAIRS);

function visualizeExpression(expr, activeIdx = null, matchIdxs = [], errorIdxs = []) {
    exprVisualization.innerHTML = '';
    for (let i = 0; i < expr.length; i++) {
        const span = document.createElement('span');
        span.className = 'expr-char';
        span.textContent = expr[i];
        if (i === activeIdx) span.classList.add('active');
        if (matchIdxs.includes(i)) span.classList.add('match');
        if (errorIdxs.includes(i)) span.classList.add('error');
        exprVisualization.appendChild(span);
    }
}

function visualizeStack(stack, highlightIdx = null) {
    stackVisualization.innerHTML = '';
    const stackBox = document.createElement('div');
    stackBox.className = 'stack-box';
    const label = document.createElement('div');
    label.className = 'stack-label';
    label.textContent = 'Stack';
    stackVisualization.appendChild(label);
    // Render bottom to top: bottom (oldest) at bottom, top (most recent) at top
    for (let i = 0; i < stack.length; i++) {
        const el = document.createElement('div');
        el.className = 'stack-element';
        el.textContent = stack[i].char;
        if (i === stack.length - 1) el.classList.add('highlight'); // highlight top
        stackBox.appendChild(el); // append to bottom
    }
    stackVisualization.appendChild(stackBox);
}

function parenthesisMatchingSteps(expr) {
    const steps = [];
    const stack = [];
    const matchIdxs = [];
    const errorIdxs = [];
    for (let i = 0; i < expr.length; i++) {
        const ch = expr[i];
        let explanation = '';
        if (OPEN.includes(ch)) {
            stack.push({ char: ch, idx: i });
            explanation = `Pushed <b>${ch}</b> to stack.`;
            steps.push({
                expr, stack: stack.slice(), activeIdx: i, matchIdxs: matchIdxs.slice(), errorIdxs: errorIdxs.slice(), explanation
            });
        } else if (CLOSE.includes(ch)) {
            if (stack.length === 0) {
                explanation = `<span style='color:var(--accent)'>No opening for <b>${ch}</b> at index ${i}.</span>`;
                errorIdxs.push(i);
                steps.push({
                    expr, stack: stack.slice(), activeIdx: i, matchIdxs: matchIdxs.slice(), errorIdxs: errorIdxs.slice(), explanation
                });
                continue;
            }
            const top = stack[stack.length - 1];
            if (PAIRS[top.char] === ch) {
                stack.pop();
                explanation = `Matched <b>${top.char}</b> at index ${top.idx} with <b>${ch}</b> at index ${i}.`;
                matchIdxs.push(top.idx, i);
                steps.push({
                    expr, stack: stack.slice(), activeIdx: i, matchIdxs: matchIdxs.slice(), errorIdxs: errorIdxs.slice(), explanation
                });
            } else {
                explanation = `<span style='color:var(--accent)'>Mismatched <b>${top.char}</b> at index ${top.idx} with <b>${ch}</b> at index ${i}.</span>`;
                errorIdxs.push(top.idx, i);
                stack.pop();
                steps.push({
                    expr, stack: stack.slice(), activeIdx: i, matchIdxs: matchIdxs.slice(), errorIdxs: errorIdxs.slice(), explanation
                });
            }
        } else {
            // Not a bracket, just move on
            explanation = `Ignoring non-bracket character <b>${ch}</b>.`;
            steps.push({
                expr, stack: stack.slice(), activeIdx: i, matchIdxs: matchIdxs.slice(), errorIdxs: errorIdxs.slice(), explanation
            });
        }
    }
    // After processing, check for any unmatched opening
    if (stack.length > 0) {
        let explanation = `<span style='color:var(--accent)'>Unmatched opening bracket(s) left in stack.</span>`;
        for (const el of stack) errorIdxs.push(el.idx);
        steps.push({
            expr, stack: stack.slice(), activeIdx: null, matchIdxs: matchIdxs.slice(), errorIdxs: errorIdxs.slice(), explanation
        });
    }
    // Final result
    let finalExplanation = '';
    if (errorIdxs.length === 0 && stack.length === 0) {
        finalExplanation = `<span style='color:var(--primary)'>All parentheses/brackets are matched! <span style='font-size:1.2em;'>&#10003;</span></span>`;
    } else {
        finalExplanation = `<span style='color:var(--accent)'>There are unmatched or mismatched brackets.</span>`;
    }
    steps.push({
        expr, stack: [], activeIdx: null, matchIdxs: matchIdxs.slice(), errorIdxs: errorIdxs.slice(), explanation: finalExplanation
    });
    return steps;
}

function runParenthesisMatching(expr) {
    const steps = parenthesisMatchingSteps(expr);
    let currentStep = 0;
    function renderStep(idx) {
        const st = steps[idx];
        visualizeExpression(st.expr, st.activeIdx, st.matchIdxs, st.errorIdxs);
        visualizeStack(st.stack);
        stepExplanation.innerHTML = st.explanation;
    }
    renderStep(0);
    // Step through on click
    let interval = null;
    checkBtn.textContent = 'Step';
    checkBtn.disabled = false;
    checkBtn.onclick = () => {
        if (currentStep < steps.length - 1) {
            currentStep++;
            renderStep(currentStep);
            if (currentStep === steps.length - 1) {
                checkBtn.textContent = 'Check Parenthesis';
            }
        } else {
            // Reset
            checkBtn.textContent = 'Check Parenthesis';
            checkBtn.onclick = onCheck;
        }
    };
}

function onCheck() {
    const expr = exprInput.value;
    if (!expr) {
        stepExplanation.innerHTML = `<span style='color:var(--accent)'>Please enter an expression.</span>`;
        exprVisualization.innerHTML = '';
        stackVisualization.innerHTML = '';
        return;
    }
    runParenthesisMatching(expr);
}

checkBtn.onclick = onCheck; 