// --- Simple Queue Visualizer JS ---

const queueValue = document.getElementById('queueValue');
const queueAddBtn = document.getElementById('queueAddBtn');
const queueDeleteBtn = document.getElementById('queueDeleteBtn');
const queueVisualization = document.getElementById('queueVisualization');
const queueStepExplanation = document.getElementById('queueStepExplanation');

class SimpleQueue {
    constructor() {
        this.data = [];
    }
    enqueue(val) {
        this.data.push(val);
        return {
            success: true,
            explanation: `<b>${val}</b> added to the <b>rear</b> of the queue.`
        };
    }
    dequeue() {
        if (this.data.length === 0) {
            return {
                success: false,
                explanation: `<span style='color:var(--accent)'>Queue is empty. Cannot delete.</span>`
            };
        }
        const removed = this.data.shift();
        return {
            success: true,
            explanation: `<b>${removed}</b> removed from the <b>front</b> of the queue.`
        };
    }
    getQueue() {
        return this.data.slice();
    }
}

function renderQueue(queue, highlightIdx = null, highlightType = null) {
    queueVisualization.innerHTML = '';
    const arr = queue.getQueue();
    if (arr.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.style.color = 'var(--accent)';
        emptyDiv.style.fontWeight = '600';
        emptyDiv.textContent = 'Queue is empty';
        queueVisualization.appendChild(emptyDiv);
        return;
    }
    arr.forEach((val, idx) => {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'queue-node';
        if (idx === 0) nodeDiv.classList.add('front');
        if (highlightIdx === idx) {
            if (highlightType === 'add') nodeDiv.style.background = 'var(--primary)';
            if (highlightType === 'delete') nodeDiv.style.background = 'var(--accent)';
            nodeDiv.style.color = '#23283a';
            nodeDiv.style.border = '2.5px solid var(--accent)';
        }
        nodeDiv.textContent = val;
        // For front and rear, add pointer below
        if (idx === 0 || idx === arr.length - 1) {
            const pointer = document.createElement('div');
            pointer.className = 'queue-pointer';
            pointer.innerHTML = `<div style='height:6px'></div><div style='width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-top:16px solid var(--accent);margin-top:0.2rem;'></div><div class='queue-label' style='margin-top:0.2rem;'>${idx === 0 ? 'front' : 'rear'}</div>`;
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.alignItems = 'center';
            wrapper.appendChild(nodeDiv);
            wrapper.appendChild(pointer);
            queueVisualization.appendChild(wrapper);
        } else {
            queueVisualization.appendChild(nodeDiv);
        }
        // Arrow except for last node
        if (idx < arr.length - 1) {
            const arrow = document.createElement('span');
            arrow.className = 'queue-arrow';
            arrow.innerHTML = '&#8594;';
            queueVisualization.appendChild(arrow);
        }
    });
}

const queue = new SimpleQueue();
renderQueue(queue);

queueAddBtn.onclick = () => {
    const value = Number(queueValue.value);
    if (isNaN(value)) {
        queueStepExplanation.innerHTML = `<span style='color:var(--accent)'>Please enter a value.</span>`;
        return;
    }
    const { success, explanation } = queue.enqueue(value);
    renderQueue(queue, queue.getQueue().length - 1, success ? 'add' : null);
    queueStepExplanation.innerHTML = explanation;
};

queueDeleteBtn.onclick = () => {
    if (queue.getQueue().length === 0) {
        queueStepExplanation.innerHTML = `<span style='color:var(--accent)'>Queue is empty. Cannot delete.</span>`;
        renderQueue(queue);
        return;
    }
    const { success, explanation } = queue.dequeue();
    renderQueue(queue, 0, success ? 'delete' : null);
    queueStepExplanation.innerHTML = explanation;
}; 