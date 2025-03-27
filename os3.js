function generateTable() {
    const numProcesses = parseInt(document.getElementById('processes').value);
    const numResources = parseInt(document.getElementById('resources').value);
    
    if (numProcesses < 1 || numResources < 1) {
        alert('Please enter valid numbers (greater than 0)');
        return;
    }

    let tablesHTML = `
        <h3>Allocation Matrix</h3>
        <table id="allocation">
            <thead>
                <tr>
                    <th>Process</th>
                    ${Array.from({length: numResources}, (_, i) => `<th>R${i}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${Array.from({length: numProcesses}, (_, i) => `
                    <tr>
                        <td>P${i}</td>
                        ${Array.from({length: numResources}, (_, j) => `
                            <td><input type="number" min="0" value="0" id="alloc-${i}-${j}"></td>
                        `).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <h3>Request Matrix</h3>
        <table id="request">
            <thead>
                <tr>
                    <th>Process</th>
                    ${Array.from({length: numResources}, (_, i) => `<th>R${i}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${Array.from({length: numProcesses}, (_, i) => `
                    <tr>
                        <td>P${i}</td>
                        ${Array.from({length: numResources}, (_, j) => `
                            <td><input type="number" min="0" value="0" id="request-${i}-${j}"></td>
                        `).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <h3>Available Resources</h3>
        <table id="available">
            <thead>
                <tr>
                    ${Array.from({length: numResources}, (_, i) => `<th>R${i}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                <tr>
                    ${Array.from({length: numResources}, (_, i) => `
                        <td><input type="number" min="0" value="1" id="avail-${i}"></td>
                    `).join('')}
                </tr>
            </tbody>
        </table>
    `;

    document.getElementById('tables-container').innerHTML = tablesHTML;
    document.getElementById('matrix-section').style.display = 'block';
    document.getElementById('result').textContent = 'Matrices generated. Please fill values and click "Detect Deadlock".';
    document.getElementById('result').className = '';
}

function detectDeadlock() {
    try {
        const numProcesses = parseInt(document.getElementById('processes').value);
        const numResources = parseInt(document.getElementById('resources').value);
        
        // Get allocation matrix
        const allocation = [];
        for (let i = 0; i < numProcesses; i++) {
            allocation[i] = [];
            for (let j = 0; j < numResources; j++) {
                allocation[i][j] = parseInt(document.getElementById(`alloc-${i}-${j}`).value);
            }
        }
        
        // Get request matrix
        const request = [];
        for (let i = 0; i < numProcesses; i++) {
            request[i] = [];
            for (let j = 0; j < numResources; j++) {
                request[i][j] = parseInt(document.getElementById(`request-${i}-${j}`).value);
            }
        }
        
        // Get available resources
        const available = [];
        for (let j = 0; j < numResources; j++) {
            available[j] = parseInt(document.getElementById(`avail-${j}`).value);
        }
        
        // Implement Banker's algorithm for deadlock detection
        const result = bankersAlgorithm(numProcesses, numResources, allocation, request, available);
        
        // Display results
        const resultElement = document.getElementById('result');
        const explanationElement = document.getElementById('explanation');
        
        if (result.isSafe) {
            resultElement.textContent = "No deadlock detected. System is in safe state.";
            resultElement.className = "no-deadlock";
            explanationElement.innerHTML = `
                <p><strong>Safe sequence:</strong> ${result.safeSequence.join(' → ')}</p>
                <p>All processes can complete execution without leading to a deadlock.</p>
            `;
        } else {
            resultElement.textContent = "Deadlock detected! System is in unsafe state.";
            resultElement.className = "deadlock";
            explanationElement.innerHTML = `
                <p>The following processes are deadlocked: ${result.deadlockedProcesses.join(', ')}</p>
                <p>Suggested actions:</p>
                <ul>
                    <li>Terminate one or more deadlocked processes</li>
                    <li>Preempt resources from some processes</li>
                    <li>Rollback processes to checkpoint</li>
                </ul>
            `;
        }
    } catch (error) {
        document.getElementById('result').textContent = "Error: " + error.message;
        document.getElementById('result').className = "deadlock";
    }
}

function bankersAlgorithm(numProcesses, numResources, allocation, request, available) {
    // Implementation of Banker's algorithm
    // This is a simplified version for demonstration
    
    const work = [...available];
    const finish = new Array(numProcesses).fill(false);
    const safeSequence = [];
    let count = 0;
    
    // Calculate need matrix
    const need = [];
    for (let i = 0; i < numProcesses; i++) {
        need[i] = [];
        for (let j = 0; j < numResources; j++) {
            need[i][j] = request[i][j] - allocation[i][j];
        }
    }
    
    // Find safe sequence
    while (count < numProcesses) {
        let found = false;
        
        for (let i = 0; i < numProcesses; i++) {
            if (!finish[i]) {
                let canExecute = true;
                
                for (let j = 0; j < numResources; j++) {
                    if (need[i][j] > work[j]) {
                        canExecute = false;
                        break;
                    }
                }
                
                if (canExecute) {
                    for (let j = 0; j < numResources; j++) {
                        work[j] += allocation[i][j];
                    }
                    
                    safeSequence.push(`P${i}`);
                    finish[i] = true;
                    found = true;
                    count++;
                }
            }
        }
        
        if (!found) {
            break; // No process found that can execute
        }
    }
    
    // Check if all processes finished
    if (count === numProcesses) {
        return {
            isSafe: true,
            safeSequence: safeSequence,
            deadlockedProcesses: []
        };
    } else {
        // Find deadlocked processes
        const deadlockedProcesses = [];
        for (let i = 0; i < numProcesses; i++) {
            if (!finish[i]) {
                deadlockedProcesses.push(`P${i}`);
            }
        }
        
        return {
            isSafe: false,
            safeSequence: [],
            deadlockedProcesses: deadlockedProcesses
        };
    }
}