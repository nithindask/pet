// Expense Tracker Application
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const homePage = document.getElementById('home-page');
    const historyPage = document.getElementById('history-page');
    const navLinks = document.querySelectorAll('.nav-links li');
    const amountInput = document.getElementById('amount');
    const typeSelect = document.getElementById('type');
    const addButton = document.getElementById('add-btn');
    
    // Table elements
    const tableBody = document.getElementById('table-body');
    const emptyRow = document.getElementById('empty-row');
    
    // Total displays
    const totalIncomeDisplay = document.getElementById('total-income');
    const totalExpenseDisplay = document.getElementById('total-expense');
    const totalAssetDisplay = document.getElementById('total-asset');
    const totalLiabilityDisplay = document.getElementById('total-liability');
    
    // Profit/Loss displays
    const profitDisplay = document.getElementById('profit-display');
    const lossDisplay = document.getElementById('loss-display');
    const profitAmount = document.getElementById('profit-amount');
    const lossAmount = document.getElementById('loss-amount');
    
    // History elements
    const historyList = document.getElementById('history-list');
    const historyDetail = document.getElementById('history-detail');
    const detailDate = document.getElementById('detail-date');
    const historyDetailContent = document.getElementById('history-detail-content');
    const clearHistoryButton = document.getElementById('clear-history');
    const closeDetailButton = document.getElementById('close-detail');
    
    // Date display
    const todayDate = document.getElementById('today-date');
    
    // Current day's data - organized by rows
    let currentData = {
        rows: [], // Each row: { id, income, expense, asset, liability }
        rowCount: 0
    };
    
    // Initialize the application
    function init() {
        // Set today's date
        const today = new Date();
        const formattedDate = formatDate(today);
        todayDate.textContent = formattedDate;
        
        // Check and handle daily reset
        checkDailyReset();
        
        // Load today's data
        loadTodayData();
        
        // Update all displays
        updateTotals();
        updateProfitLoss();
        
        // Load history
        loadHistory();
        
        // Set up event listeners
        setupEventListeners();
    }
    
    // Set up all event listeners
    function setupEventListeners() {
        // Navigation
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                const page = this.getAttribute('data-page');
                switchPage(page);
                
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Add entry button
        addButton.addEventListener('click', addEntry);
        
        // Enter key support for amount input
        amountInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addEntry();
            }
        });
        
        // Clear history button
        clearHistoryButton.addEventListener('click', clearAllHistory);
        
        // Close detail button
        closeDetailButton.addEventListener('click', closeHistoryDetail);
    }
    
    // Switch between home and history pages
    function switchPage(page) {
        if (page === 'home') {
            homePage.classList.add('active');
            historyPage.classList.remove('active');
            historyDetail.classList.remove('active');
        } else if (page === 'history') {
            homePage.classList.remove('active');
            historyPage.classList.add('active');
        }
    }
    
    // Format date as YYYY-MM-DD
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Format time as HH:MM:SS
    function formatTime(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
    
    // Check if we need to reset for a new day
    function checkDailyReset() {
        const today = new Date();
        const todayKey = formatDate(today);
        const lastSavedDate = localStorage.getItem('lastSavedDate');
        
        // If it's a new day, save yesterday's data and reset
        if (lastSavedDate && lastSavedDate !== todayKey) {
            // Save yesterday's data
            saveDayData(lastSavedDate);
            
            // Clear current data for new day
            currentData = {
                rows: [],
                rowCount: 0
            };
            
            // Clear table
            clearTable();
            
            // Update last saved date
            localStorage.setItem('lastSavedDate', todayKey);
            
            // Reload history to show new entry
            loadHistory();
            
            // Show notification
            showSaveMessage(`Data for ${lastSavedDate} saved. Starting new day.`);
        } else if (!lastSavedDate) {
            // First time user - set today as last saved date
            localStorage.setItem('lastSavedDate', todayKey);
        }
    }
    
    // Save current day's data to localStorage
    function saveDayData(dateKey) {
        // Only save if there's data
        if (currentData.rows.length > 0) {
            const dayData = {
                date: dateKey,
                data: { ...currentData },
                totals: calculateTotals(),
                profitLoss: calculateProfitLoss()
            };
            
            // Get existing history
            const history = JSON.parse(localStorage.getItem('expenseHistory') || '{}');
            
            // Add today's data
            history[dateKey] = dayData;
            
            // Save back to localStorage
            localStorage.setItem('expenseHistory', JSON.stringify(history));
            
            // Show save confirmation
            showSaveMessage(`Data saved for ${dateKey}`);
        }
    }
    
    // Load today's data from localStorage
    function loadTodayData() {
        const todayKey = formatDate(new Date());
        const history = JSON.parse(localStorage.getItem('expenseHistory') || '{}');
        
        if (history[todayKey]) {
            currentData = { ...history[todayKey].data };
            renderTable();
        }
    }
    
    // Add a new entry
    function addEntry() {
        // Get input values
        const amount = parseFloat(amountInput.value);
        const type = typeSelect.value;
        
        // Validate amount
        if (!amount || amount <= 0) {
            alert('Please enter a valid amount greater than 0');
            amountInput.focus();
            return;
        }
        
        // Create new row if needed
        if (currentData.rows.length === 0) {
            createNewRow();
        }
        
        // Get the last row
        const lastRowIndex = currentData.rows.length - 1;
        const lastRow = currentData.rows[lastRowIndex];
        
        // Check if the column in the last row is already filled
        if (lastRow[type] !== null) {
            // Create a new row
            createNewRow();
        }
        
        // Update the last row with the new entry
        const updatedLastRowIndex = currentData.rows.length - 1;
        const updatedLastRow = currentData.rows[updatedLastRowIndex];
        updatedLastRow[type] = {
            id: Date.now(),
            amount: amount,
            timestamp: new Date().getTime()
        };
        
        // Update the table
        updateRowInTable(updatedLastRowIndex, updatedLastRow);
        
        // Update totals
        updateTotals();
        updateProfitLoss();
        
        // Clear input field
        amountInput.value = '';
        amountInput.focus();
        
        // Auto-save after adding
        autoSave();
    }
    
    // Create a new empty row
    function createNewRow() {
        currentData.rowCount++;
        const newRow = {
            id: Date.now() + currentData.rowCount,
            income: null,
            expense: null,
            asset: null,
            liability: null
        };
        currentData.rows.push(newRow);
        
        // Add row to table
        addRowToTable(newRow, currentData.rows.length - 1);
    }
    
    // Add a row to the table
    function addRowToTable(row, index) {
        // Remove empty row message if it exists
        if (emptyRow && emptyRow.parentNode) {
            emptyRow.remove();
        }
        
        // Create new row element
        const tr = document.createElement('tr');
        tr.setAttribute('data-row-id', row.id);
        
        // Serial number cell
        const serialCell = document.createElement('td');
        serialCell.textContent = index + 1;
        
        // Income cell
        const incomeCell = document.createElement('td');
        if (row.income) {
            incomeCell.textContent = `₹${row.income.amount.toFixed(2)}`;
            incomeCell.style.backgroundColor = 'rgba(39, 174, 96, 0.1)';
        }
        
        // Expense cell
        const expenseCell = document.createElement('td');
        if (row.expense) {
            expenseCell.textContent = `₹${row.expense.amount.toFixed(2)}`;
            expenseCell.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
        }
        
        // Asset cell
        const assetCell = document.createElement('td');
        if (row.asset) {
            assetCell.textContent = `₹${row.asset.amount.toFixed(2)}`;
            assetCell.style.backgroundColor = 'rgba(155, 89, 182, 0.1)';
        }
        
        // Liability cell
        const liabilityCell = document.createElement('td');
        if (row.liability) {
            liabilityCell.textContent = `₹${row.liability.amount.toFixed(2)}`;
            liabilityCell.style.backgroundColor = 'rgba(230, 126, 34, 0.1)';
        }
        
        // Action cell
        const actionCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteButton.onclick = () => deleteRow(row.id);
        actionCell.appendChild(deleteButton);
        
        // Append all cells
        tr.appendChild(serialCell);
        tr.appendChild(incomeCell);
        tr.appendChild(expenseCell);
        tr.appendChild(assetCell);
        tr.appendChild(liabilityCell);
        tr.appendChild(actionCell);
        
        // Add to table
        tableBody.appendChild(tr);
    }
    
    // Update a row in the table
    function updateRowInTable(index, row) {
        const rowElement = tableBody.querySelector(`tr[data-row-id="${row.id}"]`);
        
        if (rowElement) {
            const cells = rowElement.cells;
            
            // Update serial number
            cells[0].textContent = index + 1;
            
            // Update income cell
            if (row.income) {
                cells[1].textContent = `₹${row.income.amount.toFixed(2)}`;
                cells[1].style.backgroundColor = 'rgba(39, 174, 96, 0.1)';
            } else {
                cells[1].textContent = '';
                cells[1].style.backgroundColor = '';
            }
            
            // Update expense cell
            if (row.expense) {
                cells[2].textContent = `₹${row.expense.amount.toFixed(2)}`;
                cells[2].style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
            } else {
                cells[2].textContent = '';
                cells[2].style.backgroundColor = '';
            }
            
            // Update asset cell
            if (row.asset) {
                cells[3].textContent = `₹${row.asset.amount.toFixed(2)}`;
                cells[3].style.backgroundColor = 'rgba(155, 89, 182, 0.1)';
            } else {
                cells[3].textContent = '';
                cells[3].style.backgroundColor = '';
            }
            
            // Update liability cell
            if (row.liability) {
                cells[4].textContent = `₹${row.liability.amount.toFixed(2)}`;
                cells[4].style.backgroundColor = 'rgba(230, 126, 34, 0.1)';
            } else {
                cells[4].textContent = '';
                cells[4].style.backgroundColor = '';
            }
        }
    }
    
    // Delete a row
    function deleteRow(rowId) {
        // Remove from data array
        const rowIndex = currentData.rows.findIndex(row => row.id === rowId);
        if (rowIndex !== -1) {
            currentData.rows.splice(rowIndex, 1);
        }
        
        // Remove from table
        const rowElement = tableBody.querySelector(`tr[data-row-id="${rowId}"]`);
        if (rowElement) {
            rowElement.remove();
        }
        
        // Re-render table with updated serial numbers
        renderTable();
        
        // Update totals
        updateTotals();
        updateProfitLoss();
        
        // Show empty message if no rows
        if (currentData.rows.length === 0) {
            showEmptyTableMessage();
        }
        
        // Auto-save
        autoSave();
    }
    
    // Render the entire table
    function renderTable() {
        // Clear table body
        tableBody.innerHTML = '';
        
        // Add all rows
        currentData.rows.forEach((row, index) => {
            addRowToTable(row, index);
        });
        
        // Show empty message if no data
        if (currentData.rows.length === 0) {
            showEmptyTableMessage();
        }
    }
    
    // Show empty table message
    function showEmptyTableMessage() {
        tableBody.innerHTML = '';
        tableBody.appendChild(emptyRow);
    }
    
    // Clear the table
    function clearTable() {
        currentData = {
            rows: [],
            rowCount: 0
        };
        showEmptyTableMessage();
    }
    
    // Calculate totals
    function calculateTotals() {
        let incomeTotal = 0;
        let expenseTotal = 0;
        let assetTotal = 0;
        let liabilityTotal = 0;
        
        currentData.rows.forEach(row => {
            if (row.income) incomeTotal += row.income.amount;
            if (row.expense) expenseTotal += row.expense.amount;
            if (row.asset) assetTotal += row.asset.amount;
            if (row.liability) liabilityTotal += row.liability.amount;
        });
        
        return {
            income: incomeTotal,
            expense: expenseTotal,
            asset: assetTotal,
            liability: liabilityTotal
        };
    }
    
    // Calculate profit/loss
    function calculateProfitLoss() {
        const totals = calculateTotals();
        return totals.income - totals.expense;
    }
    
    // Update total displays
    function updateTotals() {
        const totals = calculateTotals();
        
        totalIncomeDisplay.textContent = `₹${totals.income.toFixed(2)}`;
        totalExpenseDisplay.textContent = `₹${totals.expense.toFixed(2)}`;
        totalAssetDisplay.textContent = `₹${totals.asset.toFixed(2)}`;
        totalLiabilityDisplay.textContent = `₹${totals.liability.toFixed(2)}`;
    }
    
    // Update profit/loss display
    function updateProfitLoss() {
        const profitLoss = calculateProfitLoss();
        
        if (profitLoss > 0) {
            profitDisplay.classList.remove('hidden');
            profitDisplay.classList.add('show');
            lossDisplay.classList.add('hidden');
            profitAmount.textContent = `₹${profitLoss.toFixed(2)}`;
        } else if (profitLoss < 0) {
            lossDisplay.classList.remove('hidden');
            lossDisplay.classList.add('show');
            profitDisplay.classList.add('hidden');
            lossAmount.textContent = `₹${Math.abs(profitLoss).toFixed(2)}`;
        } else {
            profitDisplay.classList.add('hidden');
            lossDisplay.classList.add('hidden');
        }
    }
    
    // Auto-save current data
    function autoSave() {
        const todayKey = formatDate(new Date());
        saveDayData(todayKey);
    }
    
    // Show save message
    function showSaveMessage(message) {
        const saveMessage = document.getElementById('save-message');
        const originalText = saveMessage.innerHTML;
        
        saveMessage.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        saveMessage.style.color = 'var(--income-color)';
        
        // Reset after 3 seconds
        setTimeout(() => {
            saveMessage.innerHTML = originalText;
            saveMessage.style.color = '';
        }, 3000);
    }
    
    // Load and display history
    function loadHistory() {
        const history = JSON.parse(localStorage.getItem('expenseHistory') || '{}');
        const todayKey = formatDate(new Date());
        
        // Remove today's entry from history (it's shown separately)
        delete history[todayKey];
        
        // Get sorted dates (newest first)
        const dates = Object.keys(history).sort((a, b) => new Date(b) - new Date(a));
        
        // Clear history list
        historyList.innerHTML = '';
        
        if (dates.length === 0) {
            // Show empty state
            historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-inbox"></i>
                    <h3>No history yet</h3>
                    <p>Your daily records will appear here after each day</p>
                </div>
            `;
            return;
        }
        
        // Create history items
        dates.forEach(date => {
            const dayData = history[date];
            const totals = dayData.totals;
            const profitLoss = dayData.profitLoss;
            
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.setAttribute('data-date', date);
            
            historyItem.innerHTML = `
                <div class="history-item-header">
                    <div class="history-date">${date}</div>
                    <i class="fas fa-chevron-right"></i>
                </div>
                <div class="history-summary">
                    <div class="summary-item">
                        <span class="summary-label">Income</span>
                        <span class="summary-value income-summary">₹${totals.income.toFixed(2)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Expense</span>
                        <span class="summary-value expense-summary">₹${totals.expense.toFixed(2)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">${profitLoss >= 0 ? 'Profit' : 'Loss'}</span>
                        <span class="summary-value ${profitLoss >= 0 ? 'income-summary' : 'expense-summary'}">
                            ₹${Math.abs(profitLoss).toFixed(2)}
                        </span>
                    </div>
                </div>
            `;
            
            // Add click event to view details
            historyItem.addEventListener('click', () => viewHistoryDetail(date, dayData));
            
            historyList.appendChild(historyItem);
        });
    }
    
    // View detailed history for a specific date
    function viewHistoryDetail(date, dayData) {
        // Update detail header
        detailDate.textContent = `Records for ${date}`;
        
        // Clear previous content
        historyDetailContent.innerHTML = '';
        
        // Create table container
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        
        // Create table
        const table = document.createElement('table');
        table.className = 'history-table';
        
        // Create header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>#</th>
                <th>Income (INR)</th>
                <th>Expense (INR)</th>
                <th>Asset (INR)</th>
                <th>Liability (INR)</th>
            </tr>
        `;
        
        // Create body
        const tbody = document.createElement('tbody');
        
        if (dayData.data.rows && dayData.data.rows.length > 0) {
            dayData.data.rows.forEach((row, index) => {
                const tr = document.createElement('tr');
                
                const serialCell = document.createElement('td');
                serialCell.textContent = index + 1;
                
                const incomeCell = document.createElement('td');
                incomeCell.textContent = row.income ? `₹${row.income.amount.toFixed(2)}` : '';
                if (row.income) incomeCell.style.backgroundColor = 'rgba(39, 174, 96, 0.1)';
                
                const expenseCell = document.createElement('td');
                expenseCell.textContent = row.expense ? `₹${row.expense.amount.toFixed(2)}` : '';
                if (row.expense) expenseCell.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
                
                const assetCell = document.createElement('td');
                assetCell.textContent = row.asset ? `₹${row.asset.amount.toFixed(2)}` : '';
                if (row.asset) assetCell.style.backgroundColor = 'rgba(155, 89, 182, 0.1)';
                
                const liabilityCell = document.createElement('td');
                liabilityCell.textContent = row.liability ? `₹${row.liability.amount.toFixed(2)}` : '';
                if (row.liability) liabilityCell.style.backgroundColor = 'rgba(230, 126, 34, 0.1)';
                
                tr.appendChild(serialCell);
                tr.appendChild(incomeCell);
                tr.appendChild(expenseCell);
                tr.appendChild(assetCell);
                tr.appendChild(liabilityCell);
                
                tbody.appendChild(tr);
            });
            
            // Create footer
            const tfoot = document.createElement('tfoot');
            tfoot.innerHTML = `
                <tr class="totals-row">
                    <td><strong>Totals</strong></td>
                    <td><strong>₹${dayData.totals.income.toFixed(2)}</strong></td>
                    <td><strong>₹${dayData.totals.expense.toFixed(2)}</strong></td>
                    <td><strong>₹${dayData.totals.asset.toFixed(2)}</strong></td>
                    <td><strong>₹${dayData.totals.liability.toFixed(2)}</strong></td>
                </tr>
            `;
            
            table.appendChild(thead);
            table.appendChild(tbody);
            table.appendChild(tfoot);
            tableContainer.appendChild(table);
            
            // Add profit/loss display
            const profitLossDiv = document.createElement('div');
            profitLossDiv.className = 'profit-loss-section';
            
            if (dayData.profitLoss > 0) {
                profitLossDiv.innerHTML = `
                    <div class="profit-display show">
                        <i class="fas fa-chart-line"></i>
                        <div>
                            <h3>Profit</h3>
                            <p class="amount">₹${dayData.profitLoss.toFixed(2)}</p>
                        </div>
                    </div>
                `;
            } else if (dayData.profitLoss < 0) {
                profitLossDiv.innerHTML = `
                    <div class="loss-display show">
                        <i class="fas fa-chart-line-down"></i>
                        <div>
                            <h3>Loss</h3>
                            <p class="amount">₹${Math.abs(dayData.profitLoss).toFixed(2)}</p>
                        </div>
                    </div>
                `;
            }
            
            historyDetailContent.appendChild(tableContainer);
            historyDetailContent.appendChild(profitLossDiv);
        } else {
            historyDetailContent.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-inbox"></i>
                    <h3>No data for this day</h3>
                    <p>No records were saved for ${date}</p>
                </div>
            `;
        }
        
        // Show the detail view
        historyDetail.classList.add('active');
        
        // Scroll to detail view
        historyDetail.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Close history detail view
    function closeHistoryDetail() {
        historyDetail.classList.remove('active');
    }
    
    // Clear all history
    function clearAllHistory() {
        if (confirm('Are you sure you want to clear ALL history? This cannot be undone.')) {
            localStorage.removeItem('expenseHistory');
            loadHistory();
            showSaveMessage('All history cleared');
        }
    }
    
    // Initialize the app
    init();
    
    // Auto-save on page unload
    window.addEventListener('beforeunload', function() {
        const todayKey = formatDate(new Date());
        saveDayData(todayKey);
    });
});