
    


        // Initialize app state
        const appState = {
            clients: [],
            agents: [],
            currentPage: 'dashboard',
            darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
            clientsPage: 1,
            clientsPerPage: 10,
            filters: {
                search: '',
                agent: '',
                status: '',
                dateFrom: '',
                dateTo: '',
                sort: 'name-asc'
            },
            agentFilters: {
                dateFrom: '',
                dateTo: ''
            },
            
            selectedClients: new Set()
        };
        
        // DOM Elements
        const sidebar = document.getElementById('sidebar');
        const toggleSidebarBtn = document.getElementById('toggle-sidebar');
        const mobileSidebarBtn = document.getElementById('mobile-menu-btn');
        const pageTitle = document.getElementById('page-title');
        const mainContent = document.getElementById('main-content');
        const themeToggle = document.getElementById('theme-toggle');
        const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        const navItems = document.querySelectorAll('.nav-item a');
        const pages = document.querySelectorAll('.page');
        
        // Modal elements
        const modals = document.querySelectorAll('.modal');
        const modalCloseButtons = document.querySelectorAll('.modal-close');
        const clientModal = document.getElementById('client-modal');
        const viewClientModal = document.getElementById('view-client-modal');
        const addClientBtn = document.getElementById('add-client-btn');
        const addOrderBtn = document.getElementById('add-order-btn');
        const addDepositBtn = document.getElementById('add-deposit-btn');
        const addWithdrawalBtn = document.getElementById('add-withdrawal-btn');
        const saveClientBtn = document.getElementById('save-client');
        const clientForm = document.getElementById('client-form');
        const ordersContainer = document.getElementById('orders-container');
        const depositsContainer = document.getElementById('deposits-container');
        const withdrawalsContainer = document.getElementById('withdrawals-container');
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        const deleteSelectedBtn = document.getElementById('delete-selected-btn');
        
        
        
        // Import/Export elements
        const exportBtn = document.getElementById('export-btn');
        const importFile = document.getElementById('import-file');

        // Agent date filter elements
        const agentDateFrom = document.getElementById('agent-date-from');
        const agentDateTo = document.getElementById('agent-date-to');
        const applyAgentFilter = document.getElementById('apply-agent-filter');
        
        // Initialize the application
        function init() {
            // Load saved data from localStorage if available
            loadData();
            
            // Set initial theme
            setTheme(appState.darkMode);
            
            
            
            
            // Setup event listeners
            setupEventListeners();
            
            // Initialize UI components
            initUI();
            
            // Initial navigation to dashboard
            navigateTo('dashboard');
            
            // Update statistics and charts
            updateDashboard();
        }
        
        // Set up event listeners
        function setupEventListeners() {
            // Sidebar toggle
            toggleSidebarBtn.addEventListener('click', toggleSidebar);
            mobileSidebarBtn.addEventListener('click', toggleSidebar);
            
            // Navigation
            navItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const page = e.currentTarget.getAttribute('data-page');
                    navigateTo(page);
                    if (window.innerWidth < 768) {
                        toggleSidebar();
                    }
                });
            });
            
            // Theme toggle
            themeToggle.addEventListener('click', () => {
                appState.darkMode = !appState.darkMode;
                setTheme(appState.darkMode);
                saveData();
            });
            
            mobileThemeToggle.addEventListener('click', () => {
                appState.darkMode = !appState.darkMode;
                setTheme(appState.darkMode);
                saveData();
            });
            
            darkModeToggle.addEventListener('change', (e) => {
                appState.darkMode = e.target.checked;
                setTheme(appState.darkMode);
                saveData();
            });
            
           
            
            // Modal close buttons
            modalCloseButtons.forEach(button => {
                button.addEventListener('click', () => {
                    closeAllModals();
                });
            });
            
            // Close modal when clicking outside
            modals.forEach(modal => {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        closeAllModals();
                    }
                });
            });
            
            // Add client button
            addClientBtn.addEventListener('click', () => {
                // Reset form
                clientForm.reset();
                document.getElementById('client-id').value = '';
                document.getElementById('client-modal-title').textContent = getTranslation('addClient');
                
                // Clear dynamic fields
                ordersContainer.innerHTML = '';
                depositsContainer.innerHTML = '';
                withdrawalsContainer.innerHTML = '';
                
                // Hide error message
                document.getElementById('shopid-error').classList.add('hidden');
                
                // Show modal
                clientModal.style.display = 'flex';
            });
            
            // Add order, deposit, withdrawal buttons
            addOrderBtn.addEventListener('click', addOrderField);
            addDepositBtn.addEventListener('click', addDepositField);
            addWithdrawalBtn.addEventListener('click', addWithdrawalField);
            
            // Shop ID validation
            document.getElementById('shop-id').addEventListener('input', function() {
                validateShopId(this.value);
            });
            
            // Save client
            clientForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Check Shop ID validation
                const shopId = document.getElementById('shop-id').value;
                const clientId = document.getElementById('client-id').value;
                const shopIdError = document.getElementById('shopid-error');
                
                if (!validateShopId(shopId, clientId)) {
                    shopIdError.classList.remove('hidden');
                    return;
                }
                
                saveClient();
            });
            
            // Tab navigation in client view
            tabButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tab = e.currentTarget.getAttribute('data-tab');
                    activateTab(tab);
                });
            });
            
            // Direct Export
exportBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const data = {
        clients: appState.clients,
        settings: {
            darkMode: appState.darkMode,
            language: appState.language
        },
        exportedAt: new Date().toISOString()
    };
    
    const jsonStr = JSON.stringify(data, null, 2);
    const fileName = `hotel-management-data-${formatDateForFileName(new Date())}.json`;
    
    // Create blob and download link
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element for download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});








            
            // Apply dashboard filters
            document.getElementById('apply-filter').addEventListener('click', () => {
                appState.filters.dateFrom = document.getElementById('date-from').value;
                appState.filters.dateTo = document.getElementById('date-to').value;
                updateDashboard();
            });
            
            // Apply agent filters
            applyAgentFilter.addEventListener('click', () => {
                appState.agentFilters.dateFrom = agentDateFrom.value;
                appState.agentFilters.dateTo = agentDateTo.value;
                updateAgentsTable();
                updateAgentsCharts();
            });
            
            // Client search and filter
            document.getElementById('client-search').addEventListener('input', (e) => {
                appState.filters.search = e.target.value;
                appState.clientsPage = 1;
                updateClientsTable();
            });
            
            document.getElementById('agent-filter').addEventListener('change', (e) => {
                appState.filters.agent = e.target.value;
                appState.clientsPage = 1;
                updateClientsTable();
            });
            
            document.getElementById('status-filter').addEventListener('change', (e) => {
                appState.filters.status = e.target.value;
                appState.clientsPage = 1;
                updateClientsTable();
            });
            
            document.getElementById('sort-option').addEventListener('change', (e) => {
                appState.filters.sort = e.target.value;
                updateClientsTable();
            });
            
            // Select all clients checkbox
            document.getElementById('select-all-clients').addEventListener('change', function() {
                const isChecked = this.checked;
                const checkboxes = document.querySelectorAll('.client-checkbox');
                
                appState.selectedClients.clear();
                
                checkboxes.forEach(checkbox => {
                    checkbox.checked = isChecked;
                    if (isChecked) {
                        appState.selectedClients.add(checkbox.value);
                    }
                });
                
                toggleDeleteSelectedButton();
            });
            
            // Delete selected button
            deleteSelectedBtn.addEventListener('click', deleteSelectedClients);
            
            // Pagination
            document.getElementById('prev-page').addEventListener('click', () => {
                if (appState.clientsPage > 1) {
                    appState.clientsPage--;
                    updateClientsTable();
                }
            });
            
            document.getElementById('next-page').addEventListener('click', () => {
                const filteredClients = filterClients();
                const totalPages = Math.ceil(filteredClients.length / appState.clientsPerPage);
                
                if (appState.clientsPage < totalPages) {
                    appState.clientsPage++;
                    updateClientsTable();
                }
            });
            
            // Data management buttons
            document.getElementById('clear-data').addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                    appState.clients = [];
                    saveData();
                    updateDashboard();
                    updateClientsTable();
                    updateAgentsTable();
                    updateAgentsCharts();
                    alert('All data has been cleared.');
                }
            });
            
            document.getElementById('backup-data').addEventListener('click', function() {
                exportBtn.click();
            });
            
            document.getElementById('restore-data').addEventListener('click', () => {
                importFile.click();
            });
            
            // Generate report button
            document.getElementById('generate-report').addEventListener('click', generateReport);
            document.getElementById('export-report').addEventListener('click', exportReport);
        }
        
        // Function for direct import without modal
        function importDirectly(file) {
    if (!file) return;
    
    if (file.type !== 'application/json') {
        alert('Please select a JSON file.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            
            if (!data.clients || !Array.isArray(data.clients)) {
                alert('Invalid data format. Missing clients array.');
                return;
            }
            
            // Check for duplicate Shop IDs
            const duplicates = findDuplicateShopIds(data.clients);
            if (duplicates.length > 0) {
                alert(`The import contains duplicate Shop IDs: ${duplicates.join(', ')}. Please fix the duplicates and try again.`);
                return;
            }
            
            // Confirm before overwriting
            if (confirm(`Are you sure you want to import ${data.clients.length} clients? This will replace all existing data.`)) {
                appState.clients = data.clients;
                
                // Import settings if available
                if (data.settings) {
                    if (data.settings.darkMode !== undefined) {
                        appState.darkMode = data.settings.darkMode;
                        setTheme(appState.darkMode);
                    }
                }
                
                saveData();
                updateDashboard();
                updateClientsTable();
                updateAgentsTable();
                updateAgentsCharts();
                updateAgentFilter();
                
                alert('Data imported successfully!');
            }
        } catch (err) {
            alert('Error parsing JSON data: ' + err.message);
        }
    };
    reader.onerror = function() {
        alert('Error reading file.');
    };
    reader.readAsText(file);
}
        
        // Initialize UI components
        function initUI() {
            // Initialize charts
            initializeCharts();
            
            // Update clients table
            updateClientsTable();
            
            // Update agents table
            updateAgentsTable();
            
            // Update agent filter dropdown
            updateAgentFilter();
            
          
        }
        
        // Update agent filter dropdown
        function updateAgentFilter() {
            const agentFilter = document.getElementById('agent-filter');
            const uniqueAgents = getUniqueAgents();
            
            // Clear existing options except the first one
            while (agentFilter.options.length > 1) {
                agentFilter.remove(1);
            }
            
            // Add agent options
            uniqueAgents.forEach(agent => {
                const option = document.createElement('option');
                option.value = agent;
                option.textContent = agent;
                agentFilter.appendChild(option);
            });
        }
        
        // Get unique agents from clients data
        function getUniqueAgents() {
            const agents = new Set();
            
            appState.clients.forEach(client => {
                if (client.agent) {
                    agents.add(client.agent);
                }
            });
            
            return Array.from(agents).sort();
        }
        
       // Replace your existing toggleSidebar function with this:
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    
    if (window.innerWidth <= 768) {
        // Mobile behavior
        sidebar.classList.toggle('show');
    } else {
        // Desktop behavior
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('sidebar-collapsed');
    }
}
        // Navigate to a page
        function navigateTo(page) {
            appState.currentPage = page;
            
            // Update active navigation item
            navItems.forEach(item => {
                if (item.getAttribute('data-page') === page) {
                    item.classList.add('bg-primary-dark');
                } else {
                    item.classList.remove('bg-primary-dark');
                }
            });
            
            // Show only the active page
            pages.forEach(p => {
                if (p.id === `${page}-page`) {
                    p.classList.remove('hidden');
                    p.classList.add('active');
                } else {
                    p.classList.add('hidden');
                    p.classList.remove('active');
                }
            });
            
            // Update page title
            pageTitle.textContent = page.charAt(0).toUpperCase() + page.slice(1);
            
            // Perform page-specific updates
            if (page === 'dashboard') {
                updateDashboard();
            } else if (page === 'accounts') {
                updateClientsTable();
            } else if (page === 'agents') {
                updateAgentsCharts();
                updateAgentsTable();
            }
            
            // Save current page to app state
            saveData();
        }
        
        // Set theme (dark/light)
        function setTheme(isDark) {
            const body = document.body;
            
            if (isDark) {
                body.classList.remove('light');
                body.classList.add('dark');
                darkModeToggle.checked = true;
            } else {
                body.classList.remove('dark');
                body.classList.add('light');
                darkModeToggle.checked = false;
            }
        }
        
        
        
        // Get translation for a key
        function getTranslation(key) {
    // Direct English translations
    const translations = {
        'orders': 'Orders',
        'deposits': 'Deposits',
        'withdrawals': 'Withdrawals',
        'date': 'Date',
        'location': 'Location',
        'price': 'Price',
        'amount': 'Amount',
        'paymentMode': 'Payment Mode',
        'addClient': 'Add Client',
        'editClient': 'Edit Client',
        'shopIdExists': 'This Shop ID already exists',
        'noRecentActivity': 'No recent activity',
        'noClientsFound': 'No clients found',
        'deleteSelected': 'Delete Selected'
    };
    
    return translations[key] || key;
}
        
        // Close all modals
        function closeAllModals() {
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        }
        
        // Activate tab in client view
        function activateTab(tab) {
            tabButtons.forEach(button => {
                if (button.getAttribute('data-tab') === tab) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
            
            tabContents.forEach(content => {
                if (content.id === `${tab}-tab`) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        }
        
        // Add order field to client form
        function addOrderField() {
            const orderCount = ordersContainer.children.length + 1;
            
            const orderDiv = document.createElement('div');
            orderDiv.classList.add('card', 'p-3');
            orderDiv.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <span class="font-medium">${getTranslation('orders')} #${orderCount}</span>
                    <button type="button" class="remove-btn text-red-500 hover:text-red-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <label class="block text-sm font-medium mb-1">${getTranslation('date')}</label>
                        <input type="date" name="order-date-${orderCount}" class="w-full rounded-md px-3 py-2 text-base">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">${getTranslation('location')}</label>
                        <input type="text" name="order-location-${orderCount}" class="w-full rounded-md px-3 py-2 text-base">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">${getTranslation('price')}</label>
                        <input type="number" name="order-price-${orderCount}" step="0.01" class="w-full rounded-md px-3 py-2 text-base">
                    </div>
                </div>
            `;
            
            ordersContainer.appendChild(orderDiv);
            
            // Add remove button functionality
            orderDiv.querySelector('.remove-btn').addEventListener('click', function() {
                ordersContainer.removeChild(orderDiv);
                // Renumber remaining orders
                updateOrderNumbers();
            });
        }
        
        // Update order numbers after removal
        function updateOrderNumbers() {
            const orderDivs = ordersContainer.children;
            for (let i = 0; i < orderDivs.length; i++) {
                const orderTitle = orderDivs[i].querySelector('.font-medium');
                orderTitle.textContent = `${getTranslation('orders')} #${i + 1}`;
                
                // Update input names
                const inputs = orderDivs[i].querySelectorAll('input');
                inputs[0].name = `order-date-${i + 1}`;
                inputs[1].name = `order-location-${i + 1}`;
                inputs[2].name = `order-price-${i + 1}`;
            }
        }
        
        // Add deposit field to client form
        function addDepositField() {
            const depositCount = depositsContainer.children.length + 1;
            
            const depositDiv = document.createElement('div');
            depositDiv.classList.add('card', 'p-3');
            depositDiv.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <span class="font-medium">${getTranslation('deposits')} #${depositCount}</span>
                    <button type="button" class="remove-btn text-red-500 hover:text-red-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <label class="block text-sm font-medium mb-1">${getTranslation('date')}</label>
                        <input type="date" name="deposit-date-${depositCount}" class="w-full rounded-md px-3 py-2 text-base">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">${getTranslation('amount')}</label>
                        <input type="number" name="deposit-amount-${depositCount}" step="0.01" class="w-full rounded-md px-3 py-2 text-base">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">${getTranslation('paymentMode')}</label>
                        <select name="deposit-mode-${depositCount}" class="w-full rounded-md px-3 py-2 text-base">
                            <option value="Crypto">Crypto</option>
                            <option value="Online Banking">Online Banking</option>
                            <option value="Ewallet">Ewallet</option>
                        </select>
                    </div>
                </div>
            `;
            
            depositsContainer.appendChild(depositDiv);
            
            // Add remove button functionality
            depositDiv.querySelector('.remove-btn').addEventListener('click', function() {
                depositsContainer.removeChild(depositDiv);
                // Renumber remaining deposits
                updateDepositNumbers();
            });
        }
        
        // Update deposit numbers after removal
        function updateDepositNumbers() {
            const depositDivs = depositsContainer.children;
            for (let i = 0; i < depositDivs.length; i++) {
                const depositTitle = depositDivs[i].querySelector('.font-medium');
                depositTitle.textContent = `${getTranslation('deposits')} #${i + 1}`;
                
                // Update input names
                const inputs = depositDivs[i].querySelectorAll('input, select');
                inputs[0].name = `deposit-date-${i + 1}`;
                inputs[1].name = `deposit-amount-${i + 1}`;
                inputs[2].name = `deposit-mode-${i + 1}`;
            }
        }
        
        // Add withdrawal field to client form
        function addWithdrawalField() {
            const withdrawalCount = withdrawalsContainer.children.length + 1;
            
            const withdrawalDiv = document.createElement('div');
            withdrawalDiv.classList.add('card', 'p-3');
            withdrawalDiv.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <span class="font-medium">${getTranslation('withdrawals')} #${withdrawalCount}</span>
                    <button type="button" class="remove-btn text-red-500 hover:text-red-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium mb-1">${getTranslation('date')}</label>
                        <input type="date" name="withdrawal-date-${withdrawalCount}" class="w-full rounded-md px-3 py-2 text-base">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">${getTranslation('amount')}</label>
                        <input type="number" name="withdrawal-amount-${withdrawalCount}" step="0.01" class="w-full rounded-md px-3 py-2 text-base">
                    </div>
                </div>
            `;
            
            withdrawalsContainer.appendChild(withdrawalDiv);
            
            // Add remove button functionality
            withdrawalDiv.querySelector('.remove-btn').addEventListener('click', function() {
                withdrawalsContainer.removeChild(withdrawalDiv);
                // Renumber remaining withdrawals
                updateWithdrawalNumbers();
            });
        }
        
        // Update withdrawal numbers after removal
        function updateWithdrawalNumbers() {
            const withdrawalDivs = withdrawalsContainer.children;
            for (let i = 0; i < withdrawalDivs.length; i++) {
                const withdrawalTitle = withdrawalDivs[i].querySelector('.font-medium');
                withdrawalTitle.textContent = `${getTranslation('withdrawals')} #${i + 1}`;
                
                // Update input names
                const inputs = withdrawalDivs[i].querySelectorAll('input');
                inputs[0].name = `withdrawal-date-${i + 1}`;
                inputs[1].name = `withdrawal-amount-${i + 1}`;
            }
        }
        
        // Validate Shop ID (check for duplicates)
        function validateShopId(shopId, currentClientId = '') {
            // Hide error message by default
            const shopIdError = document.getElementById('shopid-error');
            shopIdError.classList.add('hidden');
            
            // Check if Shop ID already exists in any other client
            const exists = appState.clients.some(client => 
                client.shopId === shopId && client.id !== currentClientId
            );
            
            if (exists) {
                shopIdError.textContent = getTranslation('shopIdExists');
                shopIdError.classList.remove('hidden');
                return false;
            }
            
            return true;
        }
        
        // Save client data
        function saveClient() {
            // Get form data
            const clientId = document.getElementById('client-id').value;
            const shopId = document.getElementById('shop-id').value;
            const clientName = document.getElementById('client-name').value;
            const agent = document.getElementById('client-agent').value;
            const kycDate = document.getElementById('kyc-date').value;
            const productDate = document.getElementById('product-date').value;
            const status = document.getElementById('client-status').value;
            const customerDetails = document.getElementById('customer-details').value;
            
            // Get orders
            const orders = [];
            const orderDivs = ordersContainer.children;
            for (let i = 0; i < orderDivs.length; i++) {
                const inputs = orderDivs[i].querySelectorAll('input');
                orders.push({
                    date: inputs[0].value,
                    location: inputs[1].value,
                    price: parseFloat(inputs[2].value) || 0
                });
            }
            
            // Get deposits
            const deposits = [];
            const depositDivs = depositsContainer.children;
            for (let i = 0; i < depositDivs.length; i++) {
                const inputs = depositDivs[i].querySelectorAll('input, select');
                deposits.push({
                    date: inputs[0].value,
                    amount: parseFloat(inputs[1].value) || 0,
                    mode: inputs[2].value
                });
            }
            
            // Get withdrawals
            const withdrawals = [];
            const withdrawalDivs = withdrawalsContainer.children;
            for (let i = 0; i < withdrawalDivs.length; i++) {
                const inputs = withdrawalDivs[i].querySelectorAll('input');
                withdrawals.push({
                    date: inputs[0].value,
                    amount: parseFloat(inputs[1].value) || 0
                });
            }
            
            // Create client object
            const client = {
                id: clientId || generateId(),
                shopId,
                name: clientName,
                agent,
                kycDate,
                productDate,
                status,
                customerDetails,
                orders,
                deposits,
                withdrawals,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Add or update client
            if (clientId) {
                // Update existing client
                const index = appState.clients.findIndex(c => c.id === clientId);
                if (index !== -1) {
                    client.createdAt = appState.clients[index].createdAt;
                    appState.clients[index] = client;
                }
            } else {
                // Add new client
                appState.clients.push(client);
            }
            
            // Save data
            saveData();
            
            // Update UI
            updateDashboard();
            updateClientsTable();
            updateAgentsTable();
            updateAgentsCharts();
            
            // Update agent filter
            updateAgentFilter();
            
            // Close modal
            closeAllModals();
            
            // Show confirmation
            alert(`Client ${clientId ? 'updated' : 'added'} successfully!`);
        }
        
        // Generate unique ID
        function generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        }
        
        // View client details
        function viewClient(clientId) {
            const client = appState.clients.find(c => c.id === clientId);
            if (!client) return;
            
            // Populate client details
            document.getElementById('view-client-name').textContent = client.name;
            document.getElementById('view-shop-id').textContent = client.shopId;
            document.getElementById('view-agent').textContent = client.agent;
            document.getElementById('view-status').textContent = client.status;
            document.getElementById('view-kyc-date').textContent = formatDate(client.kycDate);
            document.getElementById('view-product-date').textContent = formatDate(client.productDate);
            document.getElementById('view-customer-details').textContent = client.customerDetails || 'No details available';
            
            // Populate orders
            const ordersBody = document.getElementById('view-orders-body');
            ordersBody.innerHTML = '';
            
            if (client.orders && client.orders.length > 0) {
                client.orders.forEach((order, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${formatDate(order.date)}</td>
                        <td>${order.location}</td>
                        <td>$${formatCurrency(order.price)}</td>
                    `;
                    ordersBody.appendChild(row);
                });
            } else {
                ordersBody.innerHTML = '<tr><td colspan="4" class="text-center py-4">No orders found</td></tr>';
            }
            
            // Populate deposits
            const depositsBody = document.getElementById('view-deposits-body');
            depositsBody.innerHTML = '';
            
            if (client.deposits && client.deposits.length > 0) {
                client.deposits.forEach(deposit => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${formatDate(deposit.date)}</td>
                        <td>$${formatCurrency(deposit.amount)}</td>
                        <td>${deposit.mode}</td>
                    `;
                    depositsBody.appendChild(row);
                });
            } else {
                depositsBody.innerHTML = '<tr><td colspan="3" class="text-center py-4">No deposits found</td></tr>';
            }
            
            // Populate withdrawals
            const withdrawalsBody = document.getElementById('view-withdrawals-body');
            withdrawalsBody.innerHTML = '';
            
            if (client.withdrawals && client.withdrawals.length > 0) {
                client.withdrawals.forEach(withdrawal => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${formatDate(withdrawal.date)}</td>
                        <td>$${formatCurrency(withdrawal.amount)}</td>
                    `;
                    withdrawalsBody.appendChild(row);
                });
            } else {
                withdrawalsBody.innerHTML = '<tr><td colspan="2" class="text-center py-4">No withdrawals found</td></tr>';
            }
            
            // Calculate totals
            const totalDeposits = client.deposits ? client.deposits.reduce((sum, deposit) => sum + (deposit.amount || 0), 0) : 0;
            const totalWithdrawals = client.withdrawals ? client.withdrawals.reduce((sum, withdrawal) => sum + (withdrawal.amount || 0), 0) : 0;
            const balance = totalDeposits - totalWithdrawals;
            
            document.getElementById('view-total-deposits').textContent = `$${formatCurrency(totalDeposits)}`;
            document.getElementById('view-total-withdrawals').textContent = `$${formatCurrency(totalWithdrawals)}`;
            document.getElementById('view-balance').textContent = `$${formatCurrency(balance)}`;
            
            // Summary statistics
            const totalOrders = client.orders ? client.orders.length : 0;
            const totalOrderValue = client.orders ? client.orders.reduce((sum, order) => sum + (order.price || 0), 0) : 0;
            const avgOrderValue = totalOrders > 0 ? totalOrderValue / totalOrders : 0;
            const firstOrderDate = client.orders && client.orders.length > 0 ? 
                client.orders.sort((a, b) => new Date(a.date) - new Date(b.date))[0].date : 'N/A';
            
            document.getElementById('view-total-orders').textContent = totalOrders;
            document.getElementById('view-total-order-value').textContent = `$${formatCurrency(totalOrderValue)}`;
            document.getElementById('view-avg-order-value').textContent = `$${formatCurrency(avgOrderValue)}`;
            document.getElementById('view-first-order-date').textContent = formatDate(firstOrderDate);
            
            // Financial summary
            const depositsCount = client.deposits ? client.deposits.length : 0;
            const withdrawalsCount = client.withdrawals ? client.withdrawals.length : 0;
            
            // Get the latest transaction date
            let lastTransactionDate = 'N/A';
            const allTransactions = [
                ...(client.orders || []).map(o => ({ date: o.date, type: 'order' })),
                ...(client.deposits || []).map(d => ({ date: d.date, type: 'deposit' })),
                ...(client.withdrawals || []).map(w => ({ date: w.date, type: 'withdrawal' }))
            ].filter(t => t.date);
            
            if (allTransactions.length > 0) {
                allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
                lastTransactionDate = formatDate(allTransactions[0].date);
            }
            
            document.getElementById('view-deposits-count').textContent = depositsCount;
            document.getElementById('view-withdrawals-count').textContent = withdrawalsCount;
            document.getElementById('view-last-transaction').textContent = lastTransactionDate;
            document.getElementById('view-current-balance').textContent = `$${formatCurrency(balance)}`;
            
            // Create timeline
            const timeline = document.getElementById('timeline');
            timeline.innerHTML = '';
            
            if (allTransactions.length > 0) {
                // Add client creation
                const creationItem = document.createElement('div');
                creationItem.classList.add('relative', 'pb-4');
                creationItem.innerHTML = `
                    <div class="absolute left-[-10px] top-0 h-4 w-4 rounded-full bg-primary"></div>
                    <div class="ml-4">
                        <p class="text-sm text-gray-500 dark:text-gray-400">${formatDate(client.createdAt)}</p>
                        <p class="font-medium">Client Created</p>
                        <p class="text-sm">Client added to the system</p>
                    </div>
                `;
                timeline.appendChild(creationItem);
                
                // Sort transactions by date (newest first)
                allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                // Add the last 5 transactions
                const recentTransactions = allTransactions.slice(0, 5);
                
                recentTransactions.forEach(transaction => {
                    const item = document.createElement('div');
                    item.classList.add('relative', 'pb-4');
                    
                    let icon, title, details;
                    
                    if (transaction.type === 'order') {
                        const order = client.orders.find(o => o.date === transaction.date);
                        icon = 'fa-shopping-bag';
                        title = 'New Order';
                        details = `Order placed for $${formatCurrency(order.price)} at ${order.location}`;
                    } else if (transaction.type === 'deposit') {
                        const deposit = client.deposits.find(d => d.date === transaction.date);
                        icon = 'fa-money-bill-wave';
                        title = 'Deposit Made';
                        details = `$${formatCurrency(deposit.amount)} deposited via ${deposit.mode}`;
                    } else {
                        const withdrawal = client.withdrawals.find(w => w.date === transaction.date);
                        icon = 'fa-hand-holding-usd';
                        title = 'Withdrawal Made';
                        details = `$${formatCurrency(withdrawal.amount)} withdrawn`;
                    }
                    
                    item.innerHTML = `
                        <div class="absolute left-[-10px] top-0 h-4 w-4 rounded-full bg-primary"></div>
                        <div class="ml-4">
                            <p class="text-sm text-gray-500 dark:text-gray-400">${formatDate(transaction.date)}</p>
                            <p class="font-medium"><i class="fas ${icon} mr-2"></i>${title}</p>
                            <p class="text-sm">${details}</p>
                        </div>
                    `;
                    
                    timeline.appendChild(item);
                });
            } else {
                timeline.innerHTML = '<p class="text-center py-4">No activity found</p>';
            }
            
            // Setup edit button
            document.getElementById('edit-client-btn').onclick = () => {
                editClient(clientId);
                closeAllModals();
            };
            
            // Activate first tab
            activateTab('orders');
            
            // Show modal
            viewClientModal.style.display = 'flex';
        }
        
        // Edit client
        function editClient(clientId) {
            const client = appState.clients.find(c => c.id === clientId);
            if (!client) return;
            
            // Populate form
            document.getElementById('client-id').value = client.id;
            document.getElementById('shop-id').value = client.shopId;
            document.getElementById('client-name').value = client.name;
            document.getElementById('client-agent').value = client.agent;
            document.getElementById('kyc-date').value = client.kycDate;
            document.getElementById('product-date').value = client.productDate;
            document.getElementById('client-status').value = client.status;
            document.getElementById('customer-details').value = client.customerDetails;
            
            // Clear existing fields
            ordersContainer.innerHTML = '';
            depositsContainer.innerHTML = '';
            withdrawalsContainer.innerHTML = '';
            
            // Hide error message
            document.getElementById('shopid-error').classList.add('hidden');
            
            // Populate orders
            if (client.orders && client.orders.length > 0) {
                client.orders.forEach((order, index) => {
                    const orderDiv = document.createElement('div');
                    orderDiv.classList.add('card', 'p-3');
                    orderDiv.innerHTML = `
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-medium">${getTranslation('orders')} #${index + 1}</span>
                            <button type="button" class="remove-btn text-red-500 hover:text-red-700">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label class="block text-sm font-medium mb-1">${getTranslation('date')}</label>
                                <input type="date" name="order-date-${index + 1}" value="${order.date}" class="w-full rounded-md px-3 py-2 text-base">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">${getTranslation('location')}</label>
                                <input type="text" name="order-location-${index + 1}" value="${order.location}" class="w-full rounded-md px-3 py-2 text-base">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">${getTranslation('price')}</label>
                                <input type="number" name="order-price-${index + 1}" value="${order.price}" step="0.01" class="w-full rounded-md px-3 py-2 text-base">
                            </div>
                        </div>
                    `;
                    
                    ordersContainer.appendChild(orderDiv);
                    
                    // Add remove button functionality
                    orderDiv.querySelector('.remove-btn').addEventListener('click', function() {
                        ordersContainer.removeChild(orderDiv);
                        updateOrderNumbers();
                    });
                });
            }
            
            // Populate deposits
            if (client.deposits && client.deposits.length > 0) {
                client.deposits.forEach((deposit, index) => {
                    const depositDiv = document.createElement('div');
                    depositDiv.classList.add('card', 'p-3');
                    depositDiv.innerHTML = `
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-medium">${getTranslation('deposits')} #${index + 1}</span>
                            <button type="button" class="remove-btn text-red-500 hover:text-red-700">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label class="block text-sm font-medium mb-1">${getTranslation('date')}</label>
                                <input type="date" name="deposit-date-${index + 1}" value="${deposit.date}" class="w-full rounded-md px-3 py-2 text-base">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">${getTranslation('amount')}</label>
                                <input type="number" name="deposit-amount-${index + 1}" value="${deposit.amount}" step="0.01" class="w-full rounded-md px-3 py-2 text-base">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">${getTranslation('paymentMode')}</label>
                                <select name="deposit-mode-${index + 1}" class="w-full rounded-md px-3 py-2 text-base">
                                    <option value="Crypto" ${deposit.mode === 'Crypto' ? 'selected' : ''}>Crypto</option>
                                    <option value="Online Banking" ${deposit.mode === 'Online Banking' ? 'selected' : ''}>Online Banking</option>
                                    <option value="Ewallet" ${deposit.mode === 'Ewallet' ? 'selected' : ''}>Ewallet</option>
                                </select>
                            </div>
                        </div>
                    `;
                    
                    depositsContainer.appendChild(depositDiv);
                    
                    // Add remove button functionality
                    depositDiv.querySelector('.remove-btn').addEventListener('click', function() {
                        depositsContainer.removeChild(depositDiv);
                        updateDepositNumbers();
                    });
                });
            }
            
            // Populate withdrawals
            if (client.withdrawals && client.withdrawals.length > 0) {
                client.withdrawals.forEach((withdrawal, index) => {
                    const withdrawalDiv = document.createElement('div');
                    withdrawalDiv.classList.add('card', 'p-3');
                    withdrawalDiv.innerHTML = `
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-medium">${getTranslation('withdrawals')} #${index + 1}</span>
                            <button type="button" class="remove-btn text-red-500 hover:text-red-700">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label class="block text-sm font-medium mb-1">${getTranslation('date')}</label>
                                <input type="date" name="withdrawal-date-${index + 1}" value="${withdrawal.date}" class="w-full rounded-md px-3 py-2 text-base">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">${getTranslation('amount')}</label>
                                <input type="number" name="withdrawal-amount-${index + 1}" value="${withdrawal.amount}" step="0.01" class="w-full rounded-md px-3 py-2 text-base">
                            </div>
                        </div>
                    `;
                    
                    withdrawalsContainer.appendChild(withdrawalDiv);
                    
                    // Add remove button functionality
                    withdrawalDiv.querySelector('.remove-btn').addEventListener('click', function() {
                        withdrawalsContainer.removeChild(withdrawalDiv);
                        updateWithdrawalNumbers();
                    });
                });
            }
            
            // Update modal title
            document.getElementById('client-modal-title').textContent = getTranslation('editClient');
            
            // Show modal
            clientModal.style.display = 'flex';
        }
        
        // Delete client
        function deleteClient(clientId) {
            if (confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
                const index = appState.clients.findIndex(c => c.id === clientId);
                if (index !== -1) {
                    appState.clients.splice(index, 1);
                    saveData();
                    updateDashboard();
                    updateClientsTable();
                    updateAgentsTable();
                    updateAgentsCharts();
                    updateAgentFilter();
                    alert('Client deleted successfully!');
                }
            }
        }
        
        // Delete multiple clients
        function deleteSelectedClients() {
            const selectedCount = appState.selectedClients.size;
            
            if (selectedCount === 0) {
                alert('No clients selected.');
                return;
            }
            
            if (confirm(`Are you sure you want to delete ${selectedCount} selected client(s)? This action cannot be undone.`)) {
                // Convert Set to Array for easier filtering
                const selectedIds = Array.from(appState.selectedClients);
                
                // Filter out selected clients
                appState.clients = appState.clients.filter(client => !selectedIds.includes(client.id));
                
                // Clear selection
                appState.selectedClients.clear();
                
                // Save data and update UI
                saveData();
                updateDashboard();
                updateClientsTable();
                updateAgentsTable();
                updateAgentsCharts();
                updateAgentFilter();
                
                // Hide delete button
                toggleDeleteSelectedButton();
                
                alert(`${selectedCount} client(s) deleted successfully!`);
            }
        }
        
        // Toggle visibility of Delete Selected button
        function toggleDeleteSelectedButton() {
            if (appState.selectedClients.size > 0) {
                deleteSelectedBtn.classList.remove('hidden');
                deleteSelectedBtn.textContent = `${getTranslation('deleteSelected')} (${appState.selectedClients.size})`;
            } else {
                deleteSelectedBtn.classList.add('hidden');
            }
        }
        
        // Handle client checkbox click
        function handleClientCheckboxChange(checkbox) {
            const clientId = checkbox.value;
            
            if (checkbox.checked) {
                appState.selectedClients.add(clientId);
            } else {
                appState.selectedClients.delete(clientId);
            }
            
            // Update "select all" checkbox
            const allCheckboxes = document.querySelectorAll('.client-checkbox');
            const selectAllCheckbox = document.getElementById('select-all-clients');
            
            if (allCheckboxes.length > 0) {
                selectAllCheckbox.checked = Array.from(allCheckboxes).every(cb => cb.checked);
            }
            
            toggleDeleteSelectedButton();
        }
        
        // Update dashboard statistics and charts
        function updateDashboard() {
            // Apply filters
            const dateFrom = appState.filters.dateFrom ? new Date(appState.filters.dateFrom) : null;
            const dateTo = appState.filters.dateTo ? new Date(appState.filters.dateTo) : null;
            
            let filteredClients = [...appState.clients];
            
            // Filter by date if both dates are provided
            if (dateFrom && dateTo) {
                filteredClients = filteredClients.filter(client => {
                    const clientDate = new Date(client.createdAt);
                    return clientDate >= dateFrom && clientDate <= dateTo;
                });
            }
            
            // Calculate statistics
            const totalClients = filteredClients.length;
            
            let totalOrders = 0;
            let totalActiveClients = 0;
            let totalInProcess = 0;
            let totalEliminated = 0;
            let totalOrderAmount = 0;
            let totalShopsOpen = 0;
            let totalDeposits = 0;
            let totalDepositAmount = 0;
            let totalWithdrawals = 0;
            let totalWithdrawalAmount = 0;
            
            filteredClients.forEach(client => {
                // Count orders
                if (client.orders) {
                    totalOrders += client.orders.length;
                    client.orders.forEach(order => {
                        totalOrderAmount += order.price || 0;
                    });
                }
                
                // Count by status
                if (client.status === 'active') totalActiveClients++;
                if (client.status === 'in-process') totalInProcess++;
                if (client.status === 'eliminated') totalEliminated++;
                
                // Count shops
                if (client.shopId) totalShopsOpen++;
                
                // Count deposits
                if (client.deposits) {
                    totalDeposits += client.deposits.length;
                    client.deposits.forEach(deposit => {
                        totalDepositAmount += deposit.amount || 0;
                    });
                }
                
                // Count withdrawals
                if (client.withdrawals) {
                    totalWithdrawals += client.withdrawals.length;
                    client.withdrawals.forEach(withdrawal => {
                        totalWithdrawalAmount += withdrawal.amount || 0;
                    });
                }
            });
            
            // Update statistics in the UI
            document.getElementById('total-clients').textContent = totalClients;
            document.getElementById('total-orders').textContent = totalOrders;
            document.getElementById('active-clients').textContent = totalActiveClients;
            document.getElementById('in-process').textContent = totalInProcess;
            document.getElementById('eliminated').textContent = totalEliminated;
            document.getElementById('shops-open').textContent = totalShopsOpen;
            document.getElementById('total-deposits').textContent = `$${formatCurrency(totalDepositAmount)}`;
            document.getElementById('total-withdrawals').textContent = `$${formatCurrency(totalWithdrawalAmount)}`;
            
            // Update charts
            updateDashboardCharts(filteredClients);
            
            // Update recent activity
            updateRecentActivity(filteredClients);
        }
        
        // Update dashboard charts
        function updateDashboardCharts(clients) {
            // Get all orders and sort by date
            const allOrders = [];
            clients.forEach(client => {
                if (client.orders) {
                    client.orders.forEach(order => {
                        if (order.date) {
                            allOrders.push({
                                date: new Date(order.date),
                                price: order.price || 0
                            });
                        }
                    });
                }
            });
            
            allOrders.sort((a, b) => a.date - b.date);
            
            // Prepare data for orders chart
            const orderMonths = {};
            allOrders.forEach(order => {
                const monthYear = order.date.toISOString().substring(0, 7);
                if (!orderMonths[monthYear]) {
                    orderMonths[monthYear] = {
                        count: 0,
                        amount: 0
                    };
                }
                orderMonths[monthYear].count++;
                orderMonths[monthYear].amount += order.price;
            });
            
            const orderLabels = Object.keys(orderMonths).map(monthYear => {
                const date = new Date(monthYear);
                return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            });
            
            const orderCounts = Object.values(orderMonths).map(month => month.count);
            const orderAmounts = Object.values(orderMonths).map(month => month.amount);
            
            // Update orders chart
            const ordersChart = Chart.getChart('orders-chart');
            if (ordersChart) {
                ordersChart.data.labels = orderLabels;
                ordersChart.data.datasets[0].data = orderCounts;
                ordersChart.data.datasets[1].data = orderAmounts;
                ordersChart.update();
            }
            
            // Get all financial transactions and sort by date
            const allTransactions = [];
            clients.forEach(client => {
                if (client.deposits) {
                    client.deposits.forEach(deposit => {
                        if (deposit.date) {
                            allTransactions.push({
                                date: new Date(deposit.date),
                                type: 'deposit',
                                amount: deposit.amount || 0
                            });
                        }
                    });
                }
                
                if (client.withdrawals) {
                    client.withdrawals.forEach(withdrawal => {
                        if (withdrawal.date) {
                            allTransactions.push({
                                date: new Date(withdrawal.date),
                                type: 'withdrawal',
                                amount: withdrawal.amount || 0
                            });
                        }
                    });
                }
            });
            
            allTransactions.sort((a, b) => a.date - b.date);
            
            // Prepare data for financial chart
            const financialMonths = {};
            allTransactions.forEach(transaction => {
                const monthYear = transaction.date.toISOString().substring(0, 7);
                if (!financialMonths[monthYear]) {
                    financialMonths[monthYear] = {
                        deposits: 0,
                        withdrawals: 0
                    };
                }
                
                if (transaction.type === 'deposit') {
                    financialMonths[monthYear].deposits += transaction.amount;
                } else {
                    financialMonths[monthYear].withdrawals += transaction.amount;
                }
            });
            
            const financialLabels = Object.keys(financialMonths).map(monthYear => {
                const date = new Date(monthYear);
                return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            });
            
            const depositAmounts = Object.values(financialMonths).map(month => month.deposits);
            const withdrawalAmounts = Object.values(financialMonths).map(month => month.withdrawals);
            
            // Update financial chart
            const financialChart = Chart.getChart('financial-chart');
            if (financialChart) {
                financialChart.data.labels = financialLabels;
                financialChart.data.datasets[0].data = depositAmounts;
                financialChart.data.datasets[1].data = withdrawalAmounts;
                financialChart.update();
            }
        }
        
        // Update recent activity table
        function updateRecentActivity(clients) {
            const recentActivityBody = document.getElementById('recent-activity-body');
            recentActivityBody.innerHTML = '';
            
            // Sort clients by update date (newest first)
            const sortedClients = [...clients].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            
            // Display the first 5 clients
            const recentClients = sortedClients.slice(0, 5);
            
            if (recentClients.length > 0) {
                recentClients.forEach(client => {
                    const row = document.createElement('tr');
                    
                    // Get the latest activity date
                    let latestDate = client.updatedAt;
                    
                    if (client.orders && client.orders.length > 0) {
                        const latestOrder = [...client.orders].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                        if (new Date(latestOrder.date) > new Date(latestDate)) {
                            latestDate = latestOrder.date;
                        }
                    }
                    
                    if (client.deposits && client.deposits.length > 0) {
                        const latestDeposit = [...client.deposits].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                        if (new Date(latestDeposit.date) > new Date(latestDate)) {
                            latestDate = latestDeposit.date;
                        }
                    }
                    
                    if (client.withdrawals && client.withdrawals.length > 0) {
                        const latestWithdrawal = [...client.withdrawals].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                        if (new Date(latestWithdrawal.date) > new Date(latestDate)) {
                            latestDate = latestWithdrawal.date;
                        }
                    }
                    
                    // Create status badge
                    let statusBadge;
                    if (client.status === 'active') {
                        statusBadge = '<span class="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</span>';
                    } else if (client.status === 'in-process') {
                        statusBadge = '<span class="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">In Process</span>';
                    } else if (client.status === 'eliminated') {
                        statusBadge = '<span class="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Eliminated</span>';
                    } else {
                        statusBadge = '<span class="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Inactive</span>';
                    }
                    
                    row.innerHTML = `
                        <td>${client.name}</td>
                        <td>${client.shopId || 'N/A'}</td>
                        <td>${client.agent}</td>
                        <td>${formatDate(latestDate)}</td>
                        <td>${statusBadge}</td>
                        <td>
                            <button class="view-client-btn text-blue-600 hover:text-blue-800 mr-2" data-id="${client.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="edit-client-btn text-green-600 hover:text-green-800 mr-2" data-id="${client.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-client-btn text-red-600 hover:text-red-800" data-id="${client.id}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </td>
                    `;
                    
                    recentActivityBody.appendChild(row);
                });
                
                // Add event listeners to buttons
                document.querySelectorAll('.view-client-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        const clientId = button.getAttribute('data-id');
                        viewClient(clientId);
                    });
                });
                
                document.querySelectorAll('.edit-client-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        const clientId = button.getAttribute('data-id');
                        editClient(clientId);
                    });
                });
                
                document.querySelectorAll('.delete-client-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        const clientId = button.getAttribute('data-id');
                        deleteClient(clientId);
                    });
                });
            } else {
                recentActivityBody.innerHTML = `<tr><td colspan="6" class="text-center py-4">${getTranslation('noRecentActivity')}</td></tr>`;
            }
        }
        
        // Filter clients based on search, agent, status, etc.
        function filterClients() {
            let filteredClients = [...appState.clients];
            
            // Apply search filter
            if (appState.filters.search) {
                const searchTerm = appState.filters.search.toLowerCase();
                filteredClients = filteredClients.filter(client => 
                    (client.name && client.name.toLowerCase().includes(searchTerm)) || 
                    (client.shopId && client.shopId.toLowerCase().includes(searchTerm))
                );
            }
            
            // Apply agent filter
            if (appState.filters.agent) {
                filteredClients = filteredClients.filter(client => 
                    client.agent === appState.filters.agent
                );
            }
            
            // Apply status filter
            if (appState.filters.status) {
                filteredClients = filteredClients.filter(client => 
                    client.status === appState.filters.status
                );
            }
            
            // Apply date filters if both are provided
            if (appState.filters.dateFrom && appState.filters.dateTo) {
                const dateFrom = new Date(appState.filters.dateFrom);
                const dateTo = new Date(appState.filters.dateTo);
                
                filteredClients = filteredClients.filter(client => {
                    const clientDate = new Date(client.createdAt);
                    return clientDate >= dateFrom && clientDate <= dateTo;
                });
            }
            
            // Apply sorting
            if (appState.filters.sort) {
                switch (appState.filters.sort) {
                    case 'name-asc':
                        filteredClients.sort((a, b) => a.name.localeCompare(b.name));
                        break;
                    case 'name-desc':
                        filteredClients.sort((a, b) => b.name.localeCompare(a.name));
                        break;
                    case 'date-asc':
                        filteredClients.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                        break;
                    case 'date-desc':
                        filteredClients.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        break;
                    case 'amount-asc':
                        filteredClients.sort((a, b) => calculateClientTotal(a) - calculateClientTotal(b));
                        break;
                    case 'amount-desc':
                        filteredClients.sort((a, b) => calculateClientTotal(b) - calculateClientTotal(a));
                        break;
                }
            }
            
            return filteredClients;
        }
        
        // Calculate total amount for a client (sum of order prices)
        function calculateClientTotal(client) {
            if (!client.orders) return 0;
            
            return client.orders.reduce((sum, order) => sum + (order.price || 0), 0);
        }
        
        // Update clients table based on filters and pagination
        function updateClientsTable() {
            const filteredClients = filterClients();
            const clientsBody = document.getElementById('clients-body');
            clientsBody.innerHTML = '';
            
            // Reset selected clients when table is updated
            appState.selectedClients.clear();
            toggleDeleteSelectedButton();
            
            // Calculate pagination
            const startIndex = (appState.clientsPage - 1) * appState.clientsPerPage;
            const endIndex = startIndex + appState.clientsPerPage;
            const paginatedClients = filteredClients.slice(startIndex, endIndex);
            
            // Update pagination UI
            document.getElementById('clients-showing').textContent = paginatedClients.length;
            document.getElementById('clients-total').textContent = filteredClients.length;
            document.getElementById('current-page').textContent = appState.clientsPage;
            
            document.getElementById('prev-page').disabled = appState.clientsPage <= 1;
            
            const totalPages = Math.ceil(filteredClients.length / appState.clientsPerPage);
            document.getElementById('next-page').disabled = appState.clientsPage >= totalPages;
            
            // Uncheck "select all" checkbox
            document.getElementById('select-all-clients').checked = false;
            
            // Display clients
            if (paginatedClients.length > 0) {
                paginatedClients.forEach(client => {
                    const row = document.createElement('tr');
                    
                    // Calculate total orders and amount
                    const totalOrders = client.orders ? client.orders.length : 0;
                    const totalAmount = calculateClientTotal(client);
                    
                    // Create status badge
                    let statusBadge;
                    if (client.status === 'active') {
                        statusBadge = '<span class="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</span>';
                    } else if (client.status === 'in-process') {
                        statusBadge = '<span class="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">In Process</span>';
                    } else if (client.status === 'eliminated') {
                        statusBadge = '<span class="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Eliminated</span>';
                    } else {
                        statusBadge = '<span class="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Inactive</span>';
                    }
                    
                    row.innerHTML = `
                        <td>
                            <input type="checkbox" class="client-checkbox rounded" value="${client.id}">
                        </td>
                        <td>${client.shopId || 'N/A'}</td>
                        <td>${client.name}</td>
                        <td>${client.agent}</td>
                        <td>${formatDate(client.kycDate)}</td>
                        <td>${totalOrders}</td>
                        <td>$${formatCurrency(totalAmount)}</td>
                        <td>${statusBadge}</td>
                        <td>
                            <button class="view-client-btn text-blue-600 hover:text-blue-800 mr-2" data-id="${client.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="edit-client-btn text-green-600 hover:text-green-800 mr-2" data-id="${client.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-client-btn text-red-600 hover:text-red-800" data-id="${client.id}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </td>
                    `;
                    
                    clientsBody.appendChild(row);
                });
                
                // Add event listeners to checkboxes
                document.querySelectorAll('.client-checkbox').forEach(checkbox => {
                    checkbox.addEventListener('change', function() {
                        handleClientCheckboxChange(this);
                    });
                });
                
                // Add event listeners to buttons
                document.querySelectorAll('.view-client-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        const clientId = button.getAttribute('data-id');
                        viewClient(clientId);
                    });
                });
                
                document.querySelectorAll('.edit-client-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        const clientId = button.getAttribute('data-id');
                        editClient(clientId);
                    });
                });
                
                document.querySelectorAll('.delete-client-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        const clientId = button.getAttribute('data-id');
                        deleteClient(clientId);
                    });
                });
            } else {
                clientsBody.innerHTML = `<tr><td colspan="9" class="text-center py-4">${getTranslation('noClientsFound')}</td></tr>`;
            }
        }
        
        // Calculate commission based on total deposits
        function calculateCommission(depositAmount) {
            if (depositAmount < 1000) {
                return 0;
            } else if (depositAmount < 10000) {
                return depositAmount * 0.04; // 4%
            } else if (depositAmount < 20000) {
                return depositAmount * 0.05; // 5%
            } else if (depositAmount < 50000) {
                return depositAmount * 0.07; // 7%
            } else if (depositAmount < 100000) {
                return depositAmount * 0.09; // 9%
            } else {
                return depositAmount * 0.10; // 10%
            }
        }
        
        // Filter clients for agents page based on date
        function filterClientsForAgents() {
            let filteredClients = [...appState.clients];
            
            // Apply date filters if both are provided
            if (appState.agentFilters.dateFrom && appState.agentFilters.dateTo) {
                const dateFrom = new Date(appState.agentFilters.dateFrom);
                const dateTo = new Date(appState.agentFilters.dateTo);
                
                filteredClients = filteredClients.filter(client => {
                    const clientDate = new Date(client.createdAt);
                    return clientDate >= dateFrom && clientDate <= dateTo;
                });
            }
            
            return filteredClients;
        }
        
        // Update agents table with statistics
        function updateAgentsTable() {
            const agentsBody = document.getElementById('agents-body');
            agentsBody.innerHTML = '';
            
            // Get filtered clients
            const filteredClients = filterClientsForAgents();
            
            // Get unique agents from clients
            const uniqueAgents = getUniqueAgents();
            
            // Calculate agent statistics
            const agentStats = {};
            
            // Initialize agent stats
            uniqueAgents.forEach(agentName => {
                agentStats[agentName] = {
                    totalClients: 0,
                    activeClients: 0,
                    totalOrders: 0,
                    totalDeposits: 0
                };
            });
            
            // Calculate statistics for each agent
            filteredClients.forEach(client => {
                if (client.agent && agentStats[client.agent]) {
                    agentStats[client.agent].totalClients++;
                    
                    if (client.status === 'active') {
                        agentStats[client.agent].activeClients++;
                    }
                    
                    if (client.orders) {
                        agentStats[client.agent].totalOrders += client.orders.length;
                    }
                    
                    if (client.deposits) {
                        client.deposits.forEach(deposit => {
                            agentStats[client.agent].totalDeposits += deposit.amount || 0;
                        });
                    }
                }
            });
            
            // Sort agents by total deposits (highest first)
            const sortedAgents = Object.keys(agentStats).sort((a, b) => 
                agentStats[b].totalDeposits - agentStats[a].totalDeposits
            );
            
            // Display agent statistics
            sortedAgents.forEach(agentName => {
                const agent = agentStats[agentName];
                
                // Calculate commission
                const commission = calculateCommission(agent.totalDeposits);
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${agentName}</td>
                    <td>${agent.totalClients}</td>
                    <td>${agent.activeClients}</td>
                    <td>${agent.totalOrders}</td>
                    <td>$${formatCurrency(agent.totalDeposits)}</td>
                    <td>$${formatCurrency(commission)}</td>
                `;
                
                agentsBody.appendChild(row);
            });
        }
        
        // Update agent-related charts
        function updateAgentsCharts() {
            // Get filtered clients
            const filteredClients = filterClientsForAgents();
            
            // Get unique agents
            const uniqueAgents = getUniqueAgents();
            
            // Calculate agent statistics
            const agentStats = {};
            
            // Initialize agent stats
            uniqueAgents.forEach(agentName => {
                agentStats[agentName] = {
                    totalClients: 0,
                    activeClients: 0,
                    totalOrders: 0,
                    totalDeposits: 0,
                    clientsByMonth: {}
                };
            });
            
            // Calculate statistics for each agent
            filteredClients.forEach(client => {
                if (client.agent && agentStats[client.agent]) {
                    agentStats[client.agent].totalClients++;
                    
                    if (client.status === 'active') {
                        agentStats[client.agent].activeClients++;
                    }
                    
                    if (client.orders) {
                        agentStats[client.agent].totalOrders += client.orders.length;
                    }
                    
                    if (client.deposits) {
                        client.deposits.forEach(deposit => {
                            agentStats[client.agent].totalDeposits += deposit.amount || 0;
                        });
                    }
                    
                    // Track client acquisition by month
                    if (client.createdAt) {
                        const monthYear = new Date(client.createdAt).toISOString().substring(0, 7);
                        if (!agentStats[client.agent].clientsByMonth[monthYear]) {
                            agentStats[client.agent].clientsByMonth[monthYear] = 0;
                        }
                        agentStats[client.agent].clientsByMonth[monthYear]++;
                    }
                }
            });
            
            // Update top agents chart
            const topAgentsChart = Chart.getChart('top-agents-chart');
            if (topAgentsChart) {
                // Sort agents by total deposits
                const sortedAgents = Object.keys(agentStats).sort((a, b) => 
                    agentStats[b].totalDeposits - agentStats[a].totalDeposits
                ).slice(0, 5); // Take top 5
                
                topAgentsChart.data.labels = sortedAgents;
                topAgentsChart.data.datasets[0].data = sortedAgents.map(agent => agentStats[agent].totalDeposits);
                topAgentsChart.update();
            }
            
            // Update client acquisition chart
            const clientAcquisitionChart = Chart.getChart('client-acquisition-chart');
            if (clientAcquisitionChart) {
                // Get all unique months
                const allMonths = new Set();
                Object.values(agentStats).forEach(agent => {
                    Object.keys(agent.clientsByMonth).forEach(month => allMonths.add(month));
                });
                
                const months = Array.from(allMonths).sort();
                const monthLabels = months.map(monthYear => {
                    const date = new Date(monthYear);
                    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                });
                
                // Top 5 agents by client count
                const topAgentsByClients = Object.keys(agentStats).sort((a, b) => 
                    agentStats[b].totalClients - agentStats[a].totalClients
                ).slice(0, 5);
                
                const datasets = topAgentsByClients.map((agent, index) => {
                    const data = months.map(month => agentStats[agent].clientsByMonth[month] || 0);
                    
                    return {
                        label: agent,
                        data: data,
                        borderColor: getChartColor(index),
                        backgroundColor: getChartColor(index, 0.2),
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1
                    };
                });
                
                clientAcquisitionChart.data.labels = monthLabels;
                clientAcquisitionChart.data.datasets = datasets;
                clientAcquisitionChart.update();
            }
            
            // Update revenue chart
            const revenueChart = Chart.getChart('revenue-chart');
            if (revenueChart) {
                // Top 5 agents by deposits
                const topAgentsByDeposits = Object.keys(agentStats).sort((a, b) => 
                    agentStats[b].totalDeposits - agentStats[a].totalDeposits
                ).slice(0, 5);
                
                revenueChart.data.labels = topAgentsByDeposits;
                revenueChart.data.datasets[0].data = topAgentsByDeposits.map(agent => agentStats[agent].totalDeposits);
                revenueChart.update();
            }
        }
        
        // Generate report based on selected type
        function generateReport() {
            const reportType = document.getElementById('report-type').value;
            const dateFrom = document.getElementById('report-date-from').value;
            const dateTo = document.getElementById('report-date-to').value;
            
            const reportOutput = document.getElementById('report-output');
            const reportContent = document.getElementById('report-content');
            const reportTitle = document.getElementById('report-title');
            
            // Filter clients by date if provided
            let filteredClients = [...appState.clients];
            
            if (dateFrom && dateTo) {
                const fromDate = new Date(dateFrom);
                const toDate = new Date(dateTo);
                
                filteredClients = filteredClients.filter(client => {
                    const clientDate = new Date(client.createdAt);
                    return clientDate >= fromDate && clientDate <= toDate;
                });
            }
            
            // Generate appropriate report
            let reportHtml = '';
            
            if (reportType === 'client-summary') {
                reportTitle.textContent = 'Client Summary Report';
                
                reportHtml = `
                    <div class="mb-6">
                        <h4 class="text-lg font-semibold mb-2">Client Statistics</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="card p-3">
                                <p class="text-gray-500 dark:text-gray-400 text-sm">Total Clients</p>
                                <p class="text-xl font-bold">${filteredClients.length}</p>
                            </div>
                            <div class="card p-3">
                                <p class="text-gray-500 dark:text-gray-400 text-sm">Active Clients</p>
                                <p class="text-xl font-bold">${filteredClients.filter(c => c.status === 'active').length}</p>
                            </div>
                            <div class="card p-3">
                                <p class="text-gray-500 dark:text-gray-400 text-sm">Inactive/Eliminated</p>
                                <p class="text-xl font-bold">${filteredClients.filter(c => c.status === 'inactive' || c.status === 'eliminated').length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <h4 class="text-lg font-semibold mb-2">Clients by Agent</h4>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Agent</th>
                                        <th>Total Clients</th>
                                        <th>Active Clients</th>
                                        <th>Completion Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                `;
                
                // Calculate clients by agent
                const agentStats = {};
                
                filteredClients.forEach(client => {
                    if (!client.agent) return;
                    
                    if (!agentStats[client.agent]) {
                        agentStats[client.agent] = {
                            total: 0,
                            active: 0
                        };
                    }
                    
                    agentStats[client.agent].total++;
                    
                    if (client.status === 'active') {
                        agentStats[client.agent].active++;
                    }
                });
                
                // Sort agents by total clients
                const sortedAgents = Object.keys(agentStats).sort((a, b) => 
                    agentStats[b].total - agentStats[a].total
                );
                
                sortedAgents.forEach(agent => {
                    const stats = agentStats[agent];
                    const completionRate = stats.total > 0 ? (stats.active / stats.total * 100).toFixed(1) : 0;
                    
                    reportHtml += `
                        <tr>
                            <td>${agent}</td>
                            <td>${stats.total}</td>
                            <td>${stats.active}</td>
                            <td>${completionRate}%</td>
                        </tr>
                    `;
                });
                
                reportHtml += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="text-lg font-semibold mb-2">Client Status Distribution</h4>
                        <div style="height: 300px;">
                            <canvas id="client-status-chart"></canvas>
                        </div>
                    </div>
                `;
                
            } else if (reportType === 'financial') {
                reportTitle.textContent = 'Financial Report';
                
                // Calculate financial statistics
                let totalDeposits = 0;
                let totalWithdrawals = 0;
                let totalOrders = 0;
                let totalOrderAmount = 0;
                
                filteredClients.forEach(client => {
                    if (client.deposits) {
                        client.deposits.forEach(deposit => {
                            totalDeposits += deposit.amount || 0;
                        });
                    }
                    
                    if (client.withdrawals) {
                        client.withdrawals.forEach(withdrawal => {
                            totalWithdrawals += withdrawal.amount || 0;
                        });
                    }
                    
                    if (client.orders) {
                        totalOrders += client.orders.length;
                        client.orders.forEach(order => {
                            totalOrderAmount += order.price || 0;
                        });
                    }
                });
                
                reportHtml = `
                    <div class="mb-6">
                        <h4 class="text-lg font-semibold mb-2">Financial Overview</h4>
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div class="card p-3">
                                <p class="text-gray-500 dark:text-gray-400 text-sm">Total Deposits</p>
                                <p class="text-xl font-bold">$${formatCurrency(totalDeposits)}</p>
                            </div>
                            <div class="card p-3">
                                <p class="text-gray-500 dark:text-gray-400 text-sm">Total Withdrawals</p>
                                <p class="text-xl font-bold">$${formatCurrency(totalWithdrawals)}</p>
                            </div>
                            <div class="card p-3">
                                <p class="text-gray-500 dark:text-gray-400 text-sm">Net Balance</p>
                                <p class="text-xl font-bold">$${formatCurrency(totalDeposits - totalWithdrawals)}</p>
                            </div>
                            <div class="card p-3">
                                <p class="text-gray-500 dark:text-gray-400 text-sm">Total Orders Value</p>
                                <p class="text-xl font-bold">$${formatCurrency(totalOrderAmount)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <h4 class="text-lg font-semibold mb-2">Monthly Financial Trends</h4>
                        <div style="height: 300px;">
                            <canvas id="monthly-financial-chart"></canvas>
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="text-lg font-semibold mb-2">Payment Method Distribution</h4>
                        <div style="height: 300px;">
                            <canvas id="payment-method-chart"></canvas>
                        </div>
                    </div>
                `;
                
            } else if (reportType === 'agent-performance') {
                reportTitle.textContent = 'Agent Performance Report';
                
                // Calculate agent performance metrics
                const agentPerformance = {};
                
                filteredClients.forEach(client => {
                    if (!client.agent) return;
                    
                    if (!agentPerformance[client.agent]) {
                        agentPerformance[client.agent] = {
                            totalClients: 0,
                            activeClients: 0,
                            totalOrders: 0,
                            totalDeposits: 0,
                            avgOrderValue: 0
                        };
                    }
                    
                    agentPerformance[client.agent].totalClients++;
                    
                    if (client.status === 'active') {
                        agentPerformance[client.agent].activeClients++;
                    }
                    
                    if (client.orders) {
                        agentPerformance[client.agent].totalOrders += client.orders.length;
                        
                        let clientRevenue = 0;
                        client.orders.forEach(order => {
                            clientRevenue += order.price || 0;
                        });
                    }
                    
                    if (client.deposits) {
                        client.deposits.forEach(deposit => {
                            agentPerformance[client.agent].totalDeposits += deposit.amount || 0;
                        });
                    }
                });
                
                // Calculate average order value
                Object.keys(agentPerformance).forEach(agent => {
                    const perf = agentPerformance[agent];
                    if (perf.totalOrders > 0) {
                        perf.avgOrderValue = perf.totalDeposits / perf.totalOrders;
                    }
                });
                
                // Sort agents by total deposits
                const sortedAgents = Object.keys(agentPerformance).sort((a, b) => 
                    agentPerformance[b].totalDeposits - agentPerformance[a].totalDeposits
                );
                
                reportHtml = `
                    <div class="mb-6">
                        <h4 class="text-lg font-semibold mb-2">Agent Performance Rankings</h4>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Agent</th>
                                        <th>Total Clients</th>
                                        <th>Active Rate</th>
                                        <th>Total Orders</th>
                                        <th>Total Deposits</th>
                                        <th>Commission</th>
                                    </tr>
                                </thead>
                                <tbody>
                `;
                
                sortedAgents.forEach((agent, index) => {
                    const perf = agentPerformance[agent];
                    const activeRate = perf.totalClients > 0 ? (perf.activeClients / perf.totalClients * 100).toFixed(1) : 0;
                    const commission = calculateCommission(perf.totalDeposits);
                    
                    reportHtml += `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${agent}</td>
                            <td>${perf.totalClients}</td>
                            <td>${activeRate}%</td>
                            <td>${perf.totalOrders}</td>
                            <td>$${formatCurrency(perf.totalDeposits)}</td>
                            <td>$${formatCurrency(commission)}</td>
                        </tr>
                    `;
                });
                
                reportHtml += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <h4 class="text-lg font-semibold mb-2">Top 5 Agents by Deposits</h4>
                        <div style="height: 300px;">
                            <canvas id="agent-revenue-chart"></canvas>
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="text-lg font-semibold mb-2">Client Conversion Rate by Agent</h4>
                        <div style="height: 300px;">
                            <canvas id="agent-conversion-chart"></canvas>
                        </div>
                    </div>
                `;
                
            } else if (reportType === 'order-analysis') {
                reportTitle.textContent = 'Order Analysis Report';
                
                // Gather all orders
                const allOrders = [];
                filteredClients.forEach(client => {
                    if (client.orders) {
                        client.orders.forEach(order => {
                            if (order.date) {
                                allOrders.push({
                                    clientName: client.name,
                                    agent: client.agent,
                                    date: new Date(order.date),
                                    location: order.location,
                                    price: order.price || 0
                                });
                            }
                        });
                    }
                });
                
                // Sort orders by date (newest first)
                allOrders.sort((a, b) => b.date - a.date);
                
                // Calculate order statistics
                const totalOrders = allOrders.length;
                const totalOrderValue = allOrders.reduce((sum, order) => sum + order.price, 0);
                const avgOrderValue = totalOrders > 0 ? totalOrderValue / totalOrders : 0;
                
                // Location statistics
                const locationStats = {};
                allOrders.forEach(order => {
                    if (!order.location) return;
                    
                    if (!locationStats[order.location]) {
                        locationStats[order.location] = {
                            count: 0,
                            totalValue: 0
                        };
                    }
                    
                    locationStats[order.location].count++;
                    locationStats[order.location].totalValue += order.price;
                });
                
                // Sort locations by order count
                const sortedLocations = Object.keys(locationStats).sort((a, b) => 
                    locationStats[b].count - locationStats[a].count
                );
                
                reportHtml = `
                    <div class="mb-6">
                        <h4 class="text-lg font-semibold mb-2">Order Statistics</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="card p-3">
                                <p class="text-gray-500 dark:text-gray-400 text-sm">Total Orders</p>
                                <p class="text-xl font-bold">${totalOrders}</p>
                            </div>
                            <div class="card p-3">
                                <p class="text-gray-500 dark:text-gray-400 text-sm">Total Order Value</p>
                                <p class="text-xl font-bold">$${formatCurrency(totalOrderValue)}</p>
                            </div>
                            <div class="card p-3">
                                <p class="text-gray-500 dark:text-gray-400 text-sm">Average Order Value</p>
                                <p class="text-xl font-bold">$${formatCurrency(avgOrderValue)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <h4 class="text-lg font-semibold mb-2">Top Order Locations</h4>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Location</th>
                                        <th>Order Count</th>
                                        <th>Total Value</th>
                                        <th>Average Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                `;
                
                // Show top 10 locations
                const topLocations = sortedLocations.slice(0, 10);
                
                topLocations.forEach(location => {
                    const stats = locationStats[location];
                    const avgValue = stats.count > 0 ? stats.totalValue / stats.count : 0;
                    
                    reportHtml += `
                        <tr>
                            <td>${location}</td>
                            <td>${stats.count}</td>
                            <td>$${formatCurrency(stats.totalValue)}</td>
                            <td>$${formatCurrency(avgValue)}</td>
                        </tr>
                    `;
                });
                
                reportHtml += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <h4 class="text-lg font-semibold mb-2">Order Trends</h4>
                        <div style="height: 300px;">
                            <canvas id="order-trends-chart"></canvas>
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="text-lg font-semibold mb-2">Recent Orders</h4>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Client</th>
                                        <th>Agent</th>
                                        <th>Location</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                `;
                
                // Show 15 most recent orders
                const recentOrders = allOrders.slice(0, 15);
                
                recentOrders.forEach(order => {
                    reportHtml += `
                        <tr>
                            <td>${formatDate(order.date)}</td>
                            <td>${order.clientName}</td>
                            <td>${order.agent}</td>
                            <td>${order.location}</td>
                            <td>$${formatCurrency(order.price)}</td>
                        </tr>
                    `;
                });
                
                reportHtml += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            }
            
            // Update report content and show
            reportContent.innerHTML = reportHtml;
            reportOutput.classList.remove('hidden');
            
            // Initialize report charts based on type
            if (reportType === 'client-summary') {
                initClientStatusChart(filteredClients);
            } else if (reportType === 'financial') {
                initMonthlyFinancialChart(filteredClients);
                initPaymentMethodChart(filteredClients);
            } else if (reportType === 'agent-performance') {
                initAgentRevenueChart(filteredClients);
                initAgentConversionChart(filteredClients);
            } else if (reportType === 'order-analysis') {
                initOrderTrendsChart(filteredClients);
            }
        }
        
        // Initialize report charts
        function initClientStatusChart(clients) {
            const statuses = ['active', 'inactive', 'in-process', 'eliminated'];
            const statusCounts = statuses.map(status => 
                clients.filter(client => client.status === status).length
            );
            
            new Chart(document.getElementById('client-status-chart'), {
                type: 'pie',
                data: {
                    labels: ['Active', 'Inactive', 'In Process', 'Eliminated'],
                    datasets: [{
                        data: statusCounts,
                        backgroundColor: [
                            'rgba(72, 187, 120, 0.7)',
                            'rgba(160, 174, 192, 0.7)',
                            'rgba(237, 137, 54, 0.7)',
                            'rgba(245, 101, 101, 0.7)'
                        ],
                        borderColor: [
                            'rgb(72, 187, 120)',
                            'rgb(160, 174, 192)',
                            'rgb(237, 137, 54)',
                            'rgb(245, 101, 101)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                        }
                    }
                }
            });
        }
        
        function initMonthlyFinancialChart(clients) {
            // Get all financial transactions
            const allTransactions = [];
            
            clients.forEach(client => {
                if (client.deposits) {
                    client.deposits.forEach(deposit => {
                        if (deposit.date) {
                            allTransactions.push({
                                date: new Date(deposit.date),
                                type: 'deposit',
                                amount: deposit.amount || 0
                            });
                        }
                    });
                }
                
                if (client.withdrawals) {
                    client.withdrawals.forEach(withdrawal => {
                        if (withdrawal.date) {
                            allTransactions.push({
                                date: new Date(withdrawal.date),
                                type: 'withdrawal',
                                amount: withdrawal.amount || 0
                            });
                        }
                    });
                }
                
                if (client.orders) {
                    client.orders.forEach(order => {
                        if (order.date) {
                            allTransactions.push({
                                date: new Date(order.date),
                                type: 'order',
                                amount: order.price || 0
                            });
                        }
                    });
                }
            });
            
            // Group by month
            const monthlyData = {};
            
            allTransactions.forEach(transaction => {
                const monthYear = transaction.date.toISOString().substring(0, 7);
                
                if (!monthlyData[monthYear]) {
                    monthlyData[monthYear] = {
                        deposits: 0,
                        withdrawals: 0,
                        orders: 0
                    };
                }
                
                monthlyData[monthYear][transaction.type + 's'] += transaction.amount;
            });
            
            // Prepare chart data
            const months = Object.keys(monthlyData).sort();
            const monthLabels = months.map(monthYear => {
                const date = new Date(monthYear);
                return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            });
            
            const depositData = months.map(month => monthlyData[month].deposits);
            const withdrawalData = months.map(month => monthlyData[month].withdrawals);
            const orderData = months.map(month => monthlyData[month].orders);
            
            new Chart(document.getElementById('monthly-financial-chart'), {
                type: 'bar',
                data: {
                    labels: monthLabels,
                    datasets: [
                        {
                            label: 'Deposits',
                            data: depositData,
                            backgroundColor: 'rgba(72, 187, 120, 0.7)',
                            borderColor: 'rgb(72, 187, 120)',
                            borderWidth: 1
                        },
                        {
                            label: 'Withdrawals',
                            data: withdrawalData,
                            backgroundColor: 'rgba(245, 101, 101, 0.7)',
                            borderColor: 'rgb(245, 101, 101)',
                            borderWidth: 1
                        },
                        {
                            label: 'Orders',
                            data: orderData,
                            backgroundColor: 'rgba(66, 153, 225, 0.7)',
                            borderColor: 'rgb(66, 153, 225)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            stacked: false
                        },
                        y: {
                            stacked: false,
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        
        function initPaymentMethodChart(clients) {
            // Count deposits by payment method
            const paymentMethods = {
                'Crypto': 0,
                'Online Banking': 0,
                'Ewallet': 0,
                'Other': 0
            };
            
            clients.forEach(client => {
                if (client.deposits) {
                    client.deposits.forEach(deposit => {
                        if (deposit.mode && paymentMethods.hasOwnProperty(deposit.mode)) {
                            paymentMethods[deposit.mode] += deposit.amount || 0;
                        } else {
                            paymentMethods['Other'] += deposit.amount || 0;
                        }
                    });
                }
            });
            
            new Chart(document.getElementById('payment-method-chart'), {
                type: 'doughnut',
                data: {
                    labels: Object.keys(paymentMethods),
                    datasets: [{
                        data: Object.values(paymentMethods),
                        backgroundColor: [
                            'rgba(66, 153, 225, 0.7)',
                            'rgba(72, 187, 120, 0.7)',
                            'rgba(237, 137, 54, 0.7)',
                            'rgba(160, 174, 192, 0.7)'
                        ],
                        borderColor: [
                            'rgb(66, 153, 225)',
                            'rgb(72, 187, 120)',
                            'rgb(237, 137, 54)',
                            'rgb(160, 174, 192)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                        }
                    }
                }
            });
        }
        
        function initAgentRevenueChart(clients) {
            // Calculate agent deposits
            const agentDeposits = {};
            
            clients.forEach(client => {
                if (!client.agent) return;
                
                if (!agentDeposits[client.agent]) {
                    agentDeposits[client.agent] = 0;
                }
                
                if (client.deposits) {
                    client.deposits.forEach(deposit => {
                        agentDeposits[client.agent] += deposit.amount || 0;
                    });
                }
            });
            
            // Sort agents by deposits and take top 5
            const topAgents = Object.keys(agentDeposits)
                .sort((a, b) => agentDeposits[b] - agentDeposits[a])
                .slice(0, 5);
            
            new Chart(document.getElementById('agent-revenue-chart'), {
                type: 'bar',
                data: {
                    labels: topAgents,
                    datasets: [{
                        label: 'Deposits',
                        data: topAgents.map(agent => agentDeposits[agent]),
                        backgroundColor: 'rgba(93, 92, 222, 0.7)',
                        borderColor: 'rgb(93, 92, 222)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        
        function initAgentConversionChart(clients) {
            // Calculate agent conversion rates
            const agentStats = {};
            
            clients.forEach(client => {
                if (!client.agent) return;
                
                if (!agentStats[client.agent]) {
                    agentStats[client.agent] = {
                        total: 0,
                        active: 0
                    };
                }
                
                agentStats[client.agent].total++;
                
                if (client.status === 'active') {
                    agentStats[client.agent].active++;
                }
            });
            
            // Calculate conversion rates and sort
            const agents = Object.keys(agentStats);
            const conversionRates = agents.map(agent => {
                const stats = agentStats[agent];
                return stats.total > 0 ? (stats.active / stats.total * 100) : 0;
            });
            
            // Sort agents by conversion rate
            const indices = Array.from(Array(agents.length).keys());
            indices.sort((a, b) => conversionRates[b] - conversionRates[a]);
            
            const sortedAgents = indices.map(i => agents[i]);
            const sortedRates = indices.map(i => conversionRates[i]);
            
            // Take top 10
            const topAgents = sortedAgents.slice(0, 10);
            const topRates = sortedRates.slice(0, 10);
            
            new Chart(document.getElementById('agent-conversion-chart'), {
                type: 'bar',
                data: {
                    labels: topAgents,
                    datasets: [{
                        label: 'Conversion Rate (%)',
                        data: topRates,
                        backgroundColor: 'rgba(72, 187, 120, 0.7)',
                        borderColor: 'rgb(72, 187, 120)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    scales: {
                        x: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
        
        function initOrderTrendsChart(clients) {
            // Gather all orders
            const allOrders = [];
            clients.forEach(client => {
                if (client.orders) {
                    client.orders.forEach(order => {
                        if (order.date) {
                            allOrders.push({
                                date: new Date(order.date),
                                price: order.price || 0
                            });
                        }
                    });
                }
            });
            
            // Group by month
            const monthlyOrders = {};
            
            allOrders.forEach(order => {
                const monthYear = order.date.toISOString().substring(0, 7);
                
                if (!monthlyOrders[monthYear]) {
                    monthlyOrders[monthYear] = {
                        count: 0,
                        totalValue: 0
                    };
                }
                
                monthlyOrders[monthYear].count++;
                monthlyOrders[monthYear].totalValue += order.price;
            });
            
            // Prepare chart data
            const months = Object.keys(monthlyOrders).sort();
            const monthLabels = months.map(monthYear => {
                const date = new Date(monthYear);
                return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            });
            
            const orderCounts = months.map(month => monthlyOrders[month].count);
            const orderValues = months.map(month => monthlyOrders[month].totalValue);
            
            new Chart(document.getElementById('order-trends-chart'), {
                type: 'line',
                data: {
                    labels: monthLabels,
                    datasets: [
                        {
                            label: 'Order Count',
                            data: orderCounts,
                            borderColor: 'rgb(66, 153, 225)',
                            backgroundColor: 'rgba(66, 153, 225, 0.1)',
                            borderWidth: 2,
                            yAxisID: 'y-count',
                            fill: true
                        },
                        {
                            label: 'Order Value',
                            data: orderValues,
                            borderColor: 'rgb(237, 137, 54)',
                            borderDash: [5, 5],
                            borderWidth: 2,
                            yAxisID: 'y-value',
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        'y-count': {
                            type: 'linear',
                            position: 'left',
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Order Count'
                            }
                        },
                        'y-value': {
                            type: 'linear',
                            position: 'right',
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Order Value ($)'
                            }
                        }
                    }
                }
            });
        }
        
        // Export current report
        function exportReport() {
            const reportTitle = document.getElementById('report-title').textContent;
            const reportType = document.getElementById('report-type').value;
            const dateFrom = document.getElementById('report-date-from').value;
            const dateTo = document.getElementById('report-date-to').value;
            
            // Create report data
            const reportData = {
                title: reportTitle,
                type: reportType,
                dateRange: {
                    from: dateFrom,
                    to: dateTo
                },
                generatedAt: new Date().toISOString(),
                data: filterClients() // Use currently filtered clients
            };
            
            // Convert to JSON and download
            const jsonStr = JSON.stringify(reportData, null, 2);
            const fileName = `${reportType}-report-${formatDateForFileName(new Date())}.json`;
            
            // Create download link
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        
        // Format date for file name
        function formatDateForFileName(date) {
            return date.toISOString().split('T')[0];
        }
        
        // Find duplicate Shop IDs in an array of clients
        function findDuplicateShopIds(clients) {
            const shopIds = {};
            const duplicates = [];
            
            clients.forEach(client => {
                if (!client.shopId) return;
                
                if (shopIds[client.shopId]) {
                    if (!duplicates.includes(client.shopId)) {
                        duplicates.push(client.shopId);
                    }
                } else {
                    shopIds[client.shopId] = true;
                }
            });
            
            return duplicates;
        }
        
        // Format date for display
        function formatDate(dateStr) {
            if (!dateStr) return 'N/A';
            
            try {
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) return 'N/A';
                
                return date.toLocaleDateString();
            } catch (err) {
                return 'N/A';
            }
        }
        
        // Format currency
        function formatCurrency(amount) {
            return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        }
        
        // Get chart color with opacity
        function getChartColor(index, alpha = 1) {
            const colors = [
                `rgba(93, 92, 222, ${alpha})`,   // Primary color
                `rgba(237, 137, 54, ${alpha})`,  // Orange
                `rgba(72, 187, 120, ${alpha})`,  // Green
                `rgba(66, 153, 225, ${alpha})`,  // Blue
                `rgba(245, 101, 101, ${alpha})`, // Red
                `rgba(159, 122, 234, ${alpha})`, // Purple
                `rgba(246, 173, 85, ${alpha})`,  // Light orange
                `rgba(79, 209, 197, ${alpha})`,  // Teal
                `rgba(232, 121, 249, ${alpha})`, // Pink
                `rgba(107, 114, 128, ${alpha})`  // Gray
            ];
            
            return colors[index % colors.length];
        }
        
        // Initialize charts
        function initializeCharts() {
            // Orders chart
            new Chart(document.getElementById('orders-chart'), {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Order Count',
                            data: [],
                            backgroundColor: 'rgba(93, 92, 222, 0.7)',
                            borderColor: 'rgb(93, 92, 222)',
                            borderWidth: 1,
                            yAxisID: 'y-count'
                        },
                        {
                            label: 'Order Amount',
                            data: [],
                            type: 'line',
                            borderColor: 'rgb(237, 137, 54)',
                            borderWidth: 2,
                            fill: false,
                            yAxisID: 'y-amount'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        'y-count': {
                            type: 'linear',
                            position: 'left',
                            beginAtZero: true
                        },
                        'y-amount': {
                            type: 'linear',
                            position: 'right',
                            beginAtZero: true
                        }
                    }
                }
            });
            
            // Financial chart
            new Chart(document.getElementById('financial-chart'), {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Deposits',
                            data: [],
                            backgroundColor: 'rgba(72, 187, 120, 0.7)',
                            borderColor: 'rgb(72, 187, 120)',
                            borderWidth: 1
                        },
                        {
                            label: 'Withdrawals',
                            data: [],
                            backgroundColor: 'rgba(245, 101, 101, 0.7)',
                            borderColor: 'rgb(245, 101, 101)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            
            // Agent charts
            new Chart(document.getElementById('top-agents-chart'), {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Deposits',
                        data: [],
                        backgroundColor: 'rgba(93, 92, 222, 0.7)',
                        borderColor: 'rgb(93, 92, 222)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            
            new Chart(document.getElementById('client-acquisition-chart'), {
                type: 'line',
                data: {
                    labels: [],
                    datasets: []
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            
            new Chart(document.getElementById('revenue-chart'), {
                type: 'pie',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            'rgba(93, 92, 222, 0.7)',
                            'rgba(237, 137, 54, 0.7)',
                            'rgba(72, 187, 120, 0.7)',
                            'rgba(66, 153, 225, 0.7)',
                            'rgba(245, 101, 101, 0.7)'
                        ],
                        borderColor: [
                            'rgb(93, 92, 222)',
                            'rgb(237, 137, 54)',
                            'rgb(72, 187, 120)',
                            'rgb(66, 153, 225)',
                            'rgb(245, 101, 101)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
        
        // Save data to localStorage
        function saveData() {
            try {
                localStorage.setItem('hotelManagementData', JSON.stringify({
                    clients: appState.clients,
                    darkMode: appState.darkMode,
                    currentPage: appState.currentPage,
                    
                    lastUpdated: new Date().toISOString()
                }));
            } catch (err) {
                console.error('Error saving data:', err);
            }
        }
        
        // Load data from localStorage
        function loadData() {
            try {
                const savedData = localStorage.getItem('hotelManagementData');
                
                if (savedData) {
                    const data = JSON.parse(savedData);
                    
                    if (data.clients && Array.isArray(data.clients)) {
                        appState.clients = data.clients;
                    }
                    
                    if (data.darkMode !== undefined) {
                        appState.darkMode = data.darkMode;
                    }
                    
                    if (data.currentPage) {
                        appState.currentPage = data.currentPage;
                    }
                    
                    
                }
            } catch (err) {
                console.error('Error loading data:', err);
            }
        }
        
        function logout() {
    // Clear authentication data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loginTime');
    
    // Clear application data (optional, remove if you want to persist data)
    localStorage.removeItem('hotelManagementData');
    
    // Redirect to login page
    window.location.replace('./index.html');
}
        
        // Initialize the application
        init();

