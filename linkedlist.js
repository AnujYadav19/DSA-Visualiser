// --- Singly Linked List Visualizer JS ---

const llValue = document.getElementById('llValue');
const llIndex = document.getElementById('llIndex');
const llInsertBtn = document.getElementById('llInsertBtn');
const llDeleteBtn = document.getElementById('llDeleteBtn');
const llVisualization = document.getElementById('llVisualization');
const llStepExplanation = document.getElementById('llStepExplanation');

// Node structure
class ListNode {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

// Linked List structure
class SinglyLinkedList {
    constructor() {
        this.head = null;
        this.length = 0;
    }

    insertAt(index, value) {
        let explanation = [];
        if (index < 0 || index > this.length) {
            explanation.push(`<span style='color:var(--accent)'>Invalid index for insertion.</span>`);
            return { success: false, explanation };
        }
        const newNode = new ListNode(value);
        if (index === 0) {
            explanation.push(`Inserting <b>${value}</b> at <b>head</b>.`);
            newNode.next = this.head;
            this.head = newNode;
        } else {
            let prev = this.head;
            explanation.push(`Traversing to index <b>${index - 1}</b> to insert <b>${value}</b>.`);
            for (let i = 0; i < index - 1; i++) {
                prev = prev.next;
            }
            newNode.next = prev.next;
            prev.next = newNode;
        }
        this.length++;
        explanation.push(`<span style='color:var(--primary)'>Node <b>${value}</b> inserted at index <b>${index}</b>.</span>`);
        return { success: true, explanation };
    }

    deleteAt(index) {
        let explanation = [];
        if (index < 0 || index >= this.length || !this.head) {
            explanation.push(`<span style='color:var(--accent)'>Invalid index for deletion.</span>`);
            return { success: false, explanation };
        }
        let deletedValue;
        if (index === 0) {
            deletedValue = this.head.value;
            explanation.push(`Deleting <b>head</b> node with value <b>${deletedValue}</b>.`);
            this.head = this.head.next;
        } else {
            let prev = this.head;
            explanation.push(`Traversing to index <b>${index - 1}</b> to delete node at index <b>${index}</b>.`);
            for (let i = 0; i < index - 1; i++) {
                prev = prev.next;
            }
            deletedValue = prev.next.value;
            prev.next = prev.next.next;
        }
        this.length--;
        explanation.push(`<span style='color:var(--primary)'>Node <b>${deletedValue}</b> deleted from index <b>${index}</b>.</span>`);
        return { success: true, explanation };
    }

    toArray() {
        let arr = [];
        let curr = this.head;
        while (curr) {
            arr.push(curr.value);
            curr = curr.next;
        }
        return arr;
    }

    getNodes() {
        // Returns array of nodes for visualization
        let nodes = [];
        let curr = this.head;
        while (curr) {
            nodes.push(curr);
            curr = curr.next;
        }
        return nodes;
    }
}

// --- Visualization ---
function renderLinkedList(list, highlightIdx = null, highlightType = null) {
    llVisualization.innerHTML = '';

    const nodes = list.getNodes();
    nodes.forEach((node, idx) => {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'll-node';
        if (idx === 0) nodeDiv.classList.add('head');
        if (highlightIdx === idx) {
            if (highlightType === 'insert') nodeDiv.style.background = 'var(--primary)';
            if (highlightType === 'delete') nodeDiv.style.background = 'var(--accent)';
            nodeDiv.style.color = '#23283a';
            nodeDiv.style.border = '2.5px solid var(--accent)';
        }
        nodeDiv.textContent = node.value;
        // For the head node, add a head pointer below
        if (idx === 0) {
            const headPointer = document.createElement('div');
            headPointer.className = 'll-head-pointer';
            headPointer.style.flexDirection = 'column';
            headPointer.style.alignItems = 'center';
            headPointer.style.margin = '0 auto';
            headPointer.innerHTML = `<div style='height:6px'></div><div style='width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-top:16px solid var(--accent);margin-top:0.2rem;'></div><div class='ll-head-label' style='margin-top:0.2rem;'>head</div>`;
            // Wrap node and pointer in a container
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.alignItems = 'center';
            wrapper.appendChild(nodeDiv);
            wrapper.appendChild(headPointer);
            llVisualization.appendChild(wrapper);
        } else {
            llVisualization.appendChild(nodeDiv);
        }
        // Arrow except for last node
        if (idx < nodes.length - 1) {
            const arrow = document.createElement('span');
            arrow.className = 'll-arrow';
            arrow.innerHTML = '&#8594;';
            llVisualization.appendChild(arrow);
        }
    });
    if (nodes.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.style.color = 'var(--accent)';
        emptyDiv.style.fontWeight = '600';
        emptyDiv.textContent = 'List is empty';
        llVisualization.appendChild(emptyDiv);
    }
}

// --- Main Logic ---
const list = new SinglyLinkedList();
renderLinkedList(list);

llInsertBtn.onclick = () => {
    const value = Number(llValue.value);
    const index = Number(llIndex.value);
    if (isNaN(value) || isNaN(index)) {
        llStepExplanation.innerHTML = `<span style='color:var(--accent)'>Please enter both value and index.</span>`;
        return;
    }
    const { success, explanation } = list.insertAt(index, value);
    renderLinkedList(list, index, success ? 'insert' : null);
    llStepExplanation.innerHTML = explanation.join('<br>');
};

llDeleteBtn.onclick = () => {
    const index = Number(llIndex.value);
    if (isNaN(index)) {
        llStepExplanation.innerHTML = `<span style='color:var(--accent)'>Please enter an index.</span>`;
        return;
    }
    const { success, explanation } = list.deleteAt(index);
    renderLinkedList(list, index, success ? 'delete' : null);
    llStepExplanation.innerHTML = explanation.join('<br>');
}; 