// Utility to show only the selected section or main app view
function showSection(sectionId) {
    const appContainer = document.getElementById('app-container');
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const dashboardMain = document.getElementById('dashboard-main');
    const analyticsSection = document.getElementById('analytics-section'); // Assuming this ID for analytics content
    const sidebar = document.getElementById('main-sidebar');

    // Hide all main content sections initially
    if (dashboardMain) dashboardMain.style.display = 'none';
    if (analyticsSection) analyticsSection.style.display = 'none';

    // Determine which main view to show (login/register or app container)
    if (sectionId === 'login-section') {
        if (loginSection) loginSection.style.display = '';
        if (registerSection) registerSection.style.display = 'none';
        if (appContainer) appContainer.style.display = 'none';
         if (sidebar) sidebar.style.display = 'none'; // Hide sidebar on login/register
    } else if (sectionId === 'register-section') {
        if (loginSection) loginSection.style.display = 'none';
        if (registerSection) registerSection.style.display = '';
        if (appContainer) appContainer.style.display = 'none';
         if (sidebar) sidebar.style.display = 'none'; // Hide sidebar on login/register
    } else { // Assuming sectionId is for content within the app container (dashboard or analytics)
        if (loginSection) loginSection.style.display = 'none';
        if (registerSection) registerSection.style.display = 'none';
        if (appContainer) appContainer.style.display = 'flex'; // Show app container
         if (sidebar) sidebar.style.display = 'flex'; // Show sidebar

        // Show the specific section within the app container
        if (sectionId === 'dashboard-main' && dashboardMain) {
            dashboardMain.style.display = '';
        } else if (sectionId === 'analytics-section' && analyticsSection) { // Assuming this ID
            analyticsSection.style.display = '';
        }
         // Handle active link styling in sidebar
         document.querySelectorAll('.sidebar-nav a').forEach(link => {
             link.classList.remove('active');
         });
         const activeLink = document.getElementById(`nav-${sectionId.replace('-main', '')}`);
         if (activeLink) {
             activeLink.classList.add('active');
         }
    }
}

// Set student ID in sidebar and potentially other places
function setStudentId(sid) {
    const sidebarStudentIdElement = document.getElementById('sidebar-student-id');
    if (sidebarStudentIdElement) {
        sidebarStudentIdElement.textContent = `Student ID: ${sid}`;
    }
    // Keep existing elements that might show student ID if they exist
     const sid1 = document.getElementById('student-id');
     const sid2 = document.getElementById('transaction-student-id'); // This one might be removed later if transaction history is removed
     if (sid1) sid1.textContent = sid;
     if (sid2) sid2.textContent = sid;

}

// Theme toggle logic
function setTheme(isDark) {
    document.body.classList.toggle('dark-theme', isDark);
    const icon = document.getElementById('theme-icon');
    if (icon) {
        if (isDark) {
            // Moon icon
            icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79z"/>';
        } else {
            // Sun icon
            icon.innerHTML = '<circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/>';
        }
    }
    localStorage.setItem('piggybank-theme', isDark ? 'dark' : 'light');
}

// Navigation event listeners
window.addEventListener('DOMContentLoaded', function() {
    // Show/hide password logic for login and register forms
    function setupShowPassword(passwordInputId, checkboxId) {
        const passwordInput = document.getElementById(passwordInputId);
        const checkbox = document.getElementById(checkboxId);
        if (passwordInput && checkbox) {
            checkbox.addEventListener('change', function() {
                passwordInput.type = this.checked ? 'text' : 'password';
            });
        }
    }
    setupShowPassword('login-password', 'login-show-password');
    setupShowPassword('register-password', 'register-show-password');

    // Theme toggle
    // const themeToggle = document.getElementById('theme-toggle'); // Removed theme toggle button
    // let isDark = localStorage.getItem('piggybank-theme') === 'dark'; // Removed local storage check
    setTheme(true); // Always set dark theme
    // if (themeToggle) { // Removed theme toggle button event listener
    //     themeToggle.onclick = function() {
    //         isDark = !document.body.classList.contains('dark-theme');
    //         setTheme(isDark);
    //     };
    // }

    // Navigation event listeners for switching between login and register forms
    const toRegisterLink = document.getElementById('to-register');
    if (toRegisterLink) {
        toRegisterLink.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent the default link behavior
            showSection('register-section');
        });
    }

    const toLoginLink = document.getElementById('to-login');
    if (toLoginLink) {
        toLoginLink.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent the default link behavior
            showSection('login-section');
        });
    }

    // Session state
    let sessionUser = null;
    // Initialize with data from localStorage if available
    const savedUser = localStorage.getItem('piggybank_user');
    if (savedUser) {
        sessionUser = JSON.parse(savedUser);
        // Fetch data after setting session user
        fetchUserData(sessionUser.id);
        showSection('dashboard-main');
    }

    // Async function to fetch user data from the backend
    async function fetchUserData(userId) {
        try {
            const response = await fetch('http://localhost/piggybank/get_user_data.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId })
            });
            const data = await response.json();
            if (data.success) {
                // Update local data variables with fetched data
                totalSavings = parseFloat(data.totalSavings) || 0;
                expenses = data.expenses || []; // Assuming expenses are returned as an array
                
                // Update UI with fetched data
                updatePiggybankUI();
                updateAnalytics();
                renderExpenses(); // Re-render expense table with fetched data
            } else {
                console.error('Failed to fetch user data:', data.error);
                // Optionally clear local data if fetching fails
                totalSavings = 0;
                expenses = [];
                updatePiggybankUI();
                updateAnalytics();
                renderExpenses();
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
             // Optionally clear local data if fetching fails
             totalSavings = 0;
             expenses = [];
             updatePiggybankUI();
             updateAnalytics();
             renderExpenses();
        }
    }

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.onsubmit = async function(e) {
            e.preventDefault();
            const schoolId = document.getElementById('login-school-id').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch('http://localhost/piggybank/login.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        school_id: schoolId,
                        password: password
                    })
                });

                const data = await response.json();
                if (data.success) {
                    sessionUser = {
                        id: data.user_id,
                        school_id: schoolId
                    };
                    localStorage.setItem('piggybank_user', JSON.stringify(sessionUser));

                    // Set student ID using the updated function
                    setStudentId(sessionUser.school_id);

                    // Fetch data after successful login
                    await fetchUserData(sessionUser.id);

                    // Show the main app container and dashboard section
                    showSection('dashboard-main');

                    // updatePiggybankUI(); // These are now called inside fetchUserData
                    // updateAnalytics();
                } else {
                    alert(data.error || 'Login failed');
                }
            } catch (error) {
                alert('Error connecting to server');
            }
        };
    }
    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.onsubmit = async function(e) {
            e.preventDefault();
            const schoolId = document.getElementById('register-school-id').value;
            const password = document.getElementById('register-password').value;

            if (!schoolId || !password) {
                alert('Please fill in all fields');
                return;
            }

            try {
                const response = await fetch('http://localhost/piggybank/register.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        school_id: schoolId,
                        password: password
                    })
                });

                const data = await response.json();
                
                if (response.ok) {
                    if (data.success) {
                        alert('Registration successful! Please login.');
                        showSection('login-section');
                        registerForm.reset();
                    } else {
                        alert(data.error || 'Registration failed');
                    }
                } else {
                    alert(data.error || 'Registration failed');
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert('Error connecting to server. Please check if XAMPP is running.');
            }
        };
    }

    // Piggybank interactive deposit controls
    let totalSavings = 0;
    let depositCounts = {20: 0, 50: 0, 100: 0, 200: 0, 500: 0, 1000: 0};
    function updateDepositUI() {
        let total = 0;
        Object.keys(depositCounts).forEach(bill => {
            document.getElementById('count-' + bill).textContent = depositCounts[bill];
            total += depositCounts[bill] * parseInt(bill);
        });
        document.getElementById('deposit-total').textContent = `₱${total.toFixed(2)}`;
    }
    document.querySelectorAll('.deposit-row').forEach(row => {
        const bill = row.getAttribute('data-bill');
        row.querySelector('.deposit-minus').onclick = function() {
            if (depositCounts[bill] > 0) depositCounts[bill]--;
            updateDepositUI();
        };
        row.querySelector('.deposit-plus').onclick = function() {
            depositCounts[bill]++;
            updateDepositUI();
        };
    });
    document.getElementById('confirm-deposit').onclick = async function() {
        if (!sessionUser) {
            alert('Please login first');
            return;
        }

        let total = 0;
        Object.keys(depositCounts).forEach(bill => {
            total += depositCounts[bill] * parseInt(bill);
        });

        if (total > 0) {
            try {
                const response = await fetch('http://localhost/piggybank/deposit.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: sessionUser.id,
                        amount: total
                    })
                });

                const data = await response.json();
                if (data.success) {
                    // totalSavings += total; // This will be updated by fetching data
                    depositCounts = {20: 0, 50: 0, 100: 0, 200: 0, 500: 0, 1000: 0};
                    updateDepositUI();
                    // Fetch data to update all UI elements
                    await fetchUserData(sessionUser.id);
                    alert(`Deposit successful! Added ₱${total} to your piggy bank.`);
                } else {
                    alert(data.error || 'Deposit failed');
                }
            } catch (error) {
                alert('Error connecting to server');
            }
        } else {
            alert('Please select at least one bill to deposit.');
        }
    };
    updateDepositUI();

    // Savings goal/progress logic (now in analytics card)
    let goalAmount = parseFloat(document.getElementById('goal-amount').value) || 5000;
    function updatePiggybankUI() {
        document.getElementById('total-savings').textContent = totalSavings.toFixed(2);
        document.getElementById('analytics-savings').textContent = `₱${totalSavings.toFixed(2)}`;
        goalAmount = parseFloat(document.getElementById('goal-amount').value) || 1;
        document.getElementById('goal-label').textContent = goalAmount;
        let percent = Math.min(100, (totalSavings / goalAmount) * 100);
        document.getElementById('goal-progress').style.width = percent + '%';
        document.getElementById('savings-progress').textContent = Math.floor(percent);
    }
    document.getElementById('goal-amount').oninput = function() {
        updatePiggybankUI();
    };
    updatePiggybankUI();

    // Expense Tracker logic (quick-select category, auto timestamp)
    let expenses = [];
    let selectedCategory = null;
    // Category button logic
    document.querySelectorAll('.expense-cat-btn').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('.expense-cat-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedCategory = btn.getAttribute('data-cat');
        };
    });
    function renderExpenses() {
        const tbody = document.getElementById('expense-table-body');
        tbody.innerHTML = '';
        // Filter
        const filterMonth = document.getElementById('filter-month').value;
        expenses.filter(exp => {
            let match = true;
            if (filterMonth && exp.date.slice(0,7) !== filterMonth) match = false;
            return match;
        }).forEach(exp => {
            const tr = document.createElement('tr');
            
            // Format time to 12-hour with AM/PM
            const [hour, minute, second] = exp.time.split(':');
            const dateObj = new Date();
            dateObj.setHours(hour, minute, second);
            const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

            tr.innerHTML = `<td>${exp.name}</td><td>${exp.date} ${formattedTime}</td><td>₱${exp.amount.toFixed(2)}</td>`;
            tbody.appendChild(tr);
        });
    }
    const expenseForm = document.getElementById('expense-form');
    if (expenseForm) {
        expenseForm.onsubmit = async function(e) {
            e.preventDefault();
            if (!sessionUser) {
                alert('Please login first');
                return;
            }

            const amount = document.getElementById('expense-amount').value;
            if (!selectedCategory) {
                alert('Please select a category');
                return;
            }

            try {
                const response = await fetch('http://localhost/piggybank/expense.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: sessionUser.id,
                        amount: amount,
                        category: selectedCategory,
                        description: `${selectedCategory} expense`
                    })
                });

                const data = await response.json();
                if (data.success) {
                    // const now = new Date(); // Data will be fetched from server
                    // expenses.push({ // Data will be added by fetching
                    //     date: now.toISOString().split('T')[0],
                    //     time: now.toTimeString().split(' ')[0],
                    //     hour: now.getHours(),
                    //     name: selectedCategory,
                    //     amount: parseFloat(amount)
                    // });
                    // renderExpenses(); // Will be called by fetchUserData
                    // updateAnalytics(); // Will be called by fetchUserData

                    expenseForm.reset();
                    document.querySelectorAll('.expense-cat-btn').forEach(b => b.classList.remove('selected'));
                    selectedCategory = null;
                    // Fetch data to update all UI elements
                    await fetchUserData(sessionUser.id);
                } else {
                    alert(data.error || 'Failed to record expense');
                }
            } catch (error) {
                alert('Error connecting to server');
            }
        };
    }
    document.getElementById('filter-month').onchange = renderExpenses;
    renderExpenses();

    // Dashboard/Analytics view toggle
    const dashboardMain = document.getElementById('dashboard-main');
    const analyticsMain = document.getElementById('analytics-main');
    const viewAnalyticsBtn = document.getElementById('view-analytics');
    const backDashboardBtn = document.getElementById('back-dashboard');
    if (viewAnalyticsBtn) {
        viewAnalyticsBtn.onclick = function() {
            dashboardMain.style.display = 'none';
            analyticsMain.style.display = '';
            renderAnalyticsExpenses();
            updateAnalytics();
        };
    }
    if (backDashboardBtn) {
        backDashboardBtn.onclick = function() {
            analyticsMain.style.display = 'none';
            dashboardMain.style.display = '';
        };
    }
    // Render analytics expense table (date, name, amount)
    function renderAnalyticsExpenses() {
        const tbody = document.getElementById('expense-table-body-analytics');
        if (!tbody) return;
        tbody.innerHTML = '';
        expenses.forEach(exp => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${exp.date}</td><td>${exp.name}</td><td>₱${exp.amount.toFixed(2)}</td>`;
            tbody.appendChild(tr);
        });
    }

    // Analytics logic (savings/goal + expense analytics)
    let expenseCategoryChart = null;
    function updateAnalytics() {
        // Savings
        document.getElementById('analytics-savings').textContent = `₱${totalSavings.toFixed(2)}`;
        goalAmount = parseFloat(document.getElementById('goal-amount').value) || 1;
        document.getElementById('goal-label').textContent = goalAmount;
        let percent = Math.min(100, (totalSavings / goalAmount) * 100);
        document.getElementById('goal-progress').style.width = percent + '%';
        document.getElementById('savings-progress').textContent = Math.floor(percent);
        // Expense analytics
        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        document.getElementById('expense-total').textContent = `₱${total.toFixed(2)}`;
        // Breakdown by category
        const catTotals = {};
        expenses.forEach(exp => {
            if (!catTotals[exp.name]) catTotals[exp.name] = 0;
            catTotals[exp.name] += exp.amount;
        });
        const categories = Object.keys(catTotals);
        const amounts = Object.values(catTotals);
        // Chart.js pie chart
        if (!expenseCategoryChart) {
            const ctx = document.getElementById('expenseCategoryChart').getContext('2d');
            expenseCategoryChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: categories,
                    datasets: [{
                        data: amounts,
                        backgroundColor: [
                            '#ff8ee0', '#b86fc6', '#c94fa0', '#ffb6f9', '#ffe3fa', '#f8f8fa', '#23132e', '#2d1836'
                        ],
                    }]
                },
                options: {
                    plugins: {
                        legend: { display: true, position: 'bottom' }
                    }
                }
            });
        } else {
            expenseCategoryChart.data.labels = categories;
            expenseCategoryChart.data.datasets[0].data = amounts;
            expenseCategoryChart.update();
        }
        // Update analytics table if visible
        if (analyticsMain && analyticsMain.style.display !== 'none') {
            renderAnalyticsExpenses();
        }
    }
    document.getElementById('goal-amount').oninput = function() {
        updateAnalytics();
    };
    updateAnalytics();

    // Check for existing session on page load
    if (savedUser) {
        sessionUser = JSON.parse(savedUser);
        // Removed showSection, updatePiggybankUI, updateAnalytics from here
        // as fetchUserData will handle showing the section and updating UI
    }

    // Default to login section
    showSection('login-section');

    // Add event listeners for sidebar navigation links
    const navDashboard = document.getElementById('nav-dashboard');
    if (navDashboard) {
        navDashboard.addEventListener('click', function(e) {
            e.preventDefault();
            showSection('dashboard-main');
        });
    }

    const navAnalytics = document.getElementById('nav-analytics');
    if (navAnalytics) {
        navAnalytics.addEventListener('click', function(e) {
            e.preventDefault();
            // Assuming the analytics section has the ID 'analytics-section'
            showSection('analytics-section');
        });
    }

    // Add event listener for the logout link
    const navLogout = document.getElementById('nav-logout');
    if (navLogout) {
        navLogout.addEventListener('click', function(e) {
            e.preventDefault();
            // Clear session user data
            sessionUser = null;
            localStorage.removeItem('piggybank_user');
            // Show the login section
            showSection('login-section');
             // Clear student ID display
             const studentIdElement = document.getElementById('sidebar-student-id');
             if (studentIdElement) {
                 studentIdElement.textContent = 'Student ID: Loading...'; // Or initial text
             }
        });
    }
});


