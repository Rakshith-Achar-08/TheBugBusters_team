const express = require('express');
const cors = require ('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage (replace with actual database in production)
let students = [];
let transactions = [];
let institutionFinances = {
    totalRevenue: 0,
    totalPending: 0,
    totalCollected: 0
};

// Student Class
class Student {
    constructor(studentData) {
        this.id = uuidv4();
        this.name = studentData.name;
        this.email = studentData.email;
        this.phone = studentData.phone;
        this.enrollmentDate = new Date();
        this.course = studentData.course;
        this.duration = studentData.duration || 4; // default 4 years
        
        // Initialize fee structure for each year (4 parts per year)
        this.feeStructure = this.initializeFeeStructure(studentData.annualFee);
        this.totalFees = this.calculateTotalFees();
        this.paidAmount = 0;
        this.remainingBalance = this.totalFees;
        this.status = 'active';
    }

    initializeFeeStructure(annualFee) {
        const structure = {};
        const quarterlyAmount = annualFee / 4;
        
        for (let year = 1; year <= this.duration; year++) {
            structure[`year_${year}`] = {
                total: annualFee,
                quarters: {
                    q1: { amount: quarterlyAmount, paid: false, paidAmount: 0, dueDate: this.calculateDueDate(year, 1) },
                    q2: { amount: quarterlyAmount, paid: false, paidAmount: 0, dueDate: this.calculateDueDate(year, 2) },
                    q3: { amount: quarterlyAmount, paid: false, paidAmount: 0, dueDate: this.calculateDueDate(year, 3) },
                    q4: { amount: quarterlyAmount, paid: false, paidAmount: 0, dueDate: this.calculateDueDate(year, 4) }
                }
            };
        }
        return structure;
    }

    calculateDueDate(year, quarter) {
        const enrollmentYear = this.enrollmentDate.getFullYear();
        const targetYear = enrollmentYear + (year - 1);
        const quarterMonths = { 1: 3, 2: 6, 3: 9, 4: 12 }; // March, June, September, December
        return new Date(targetYear, quarterMonths[quarter] - 1, 15); // 15th of the month
    }

    calculateTotalFees() {
        let total = 0;
        Object.values(this.feeStructure).forEach(year => {
            total += year.total;
        });
        return total;
    }

    updateBalance() {
        let totalPaid = 0;
        Object.values(this.feeStructure).forEach(year => {
            Object.values(year.quarters).forEach(quarter => {
                totalPaid += quarter.paidAmount;
            });
        });
        this.paidAmount = totalPaid;
        this.remainingBalance = this.totalFees - this.paidAmount;
    }
}

// Transaction Class
class Transaction {
    constructor(transactionData) {
        this.id = uuidv4();
        this.studentId = transactionData.studentId;
        this.amount = transactionData.amount;
        this.paymentMethod = transactionData.paymentMethod;
        this.year = transactionData.year;
        this.quarter = transactionData.quarter;
        this.timestamp = new Date();
        this.status = 'completed';
        this.description = `Payment for Year ${transactionData.year} - Quarter ${transactionData.quarter}`;
        this.receiptNumber = this.generateReceiptNumber();
    }

    generateReceiptNumber() {
        return `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    }
}

// API Endpoints

// Create new student
app.post('/api/students', (req, res) => {
    try {
        const { name, email, phone, course, annualFee, duration } = req.body;
        
        if (!name || !email || !annualFee) {
            return res.status(400).json({ error: 'Name, email, and annual fee are required' });
        }

        const student = new Student({ name, email, phone, course, annualFee, duration });
        students.push(student);
        
        // Update institution finances
        institutionFinances.totalPending += student.totalFees;

        res.status(201).json({
            message: 'Student created successfully',
            student: student,
            feeBreakdown: student.feeStructure
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create student' });
    }
});

// Get all students
app.get('/api/students', (req, res) => {
    try {
        const studentsWithBalance = students.map(student => ({
            ...student,
            upcomingDues: getUpcomingDues(student)
        }));
        res.json(studentsWithBalance);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// Get student by ID
app.get('/api/students/:id', (req, res) => {
    try {
        const student = students.find(s => s.id === req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        const studentTransactions = transactions.filter(t => t.studentId === student.id);
        res.json({
            student,
            transactions: studentTransactions,
            upcomingDues: getUpcomingDues(student)
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch student' });
    }
});

// Process payment
app.post('/api/payments', (req, res) => {
    try {
        const { studentId, amount, paymentMethod, year, quarter } = req.body;
        
        if (!studentId || !amount || !year || !quarter) {
            return res.status(400).json({ error: 'Student ID, amount, year, and quarter are required' });
        }

        const student = students.find(s => s.id === studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const quarterKey = `q${quarter}`;
        const yearKey = `year_${year}`;
        
        if (!student.feeStructure[yearKey] || !student.feeStructure[yearKey].quarters[quarterKey]) {
            return res.status(400).json({ error: 'Invalid year or quarter' });
        }

        const quarterData = student.feeStructure[yearKey].quarters[quarterKey];
        const remainingForQuarter = quarterData.amount - quarterData.paidAmount;
        
        if (amount > remainingForQuarter) {
            return res.status(400).json({ 
                error: `Payment amount exceeds remaining balance for this quarter. Remaining: ${remainingForQuarter}` 
            });
        }

        // Process payment
        quarterData.paidAmount += amount;
        if (quarterData.paidAmount >= quarterData.amount) {
            quarterData.paid = true;
        }

        // Create transaction
        const transaction = new Transaction({
            studentId, amount, paymentMethod, year, quarter
        });
        transactions.push(transaction);

        // Update student balance
        student.updateBalance();

        // Update institution finances
        institutionFinances.totalCollected += amount;
        institutionFinances.totalPending -= amount;
        institutionFinances.totalRevenue += amount;

        res.json({
            message: 'Payment processed successfully',
            transaction,
            remainingBalance: student.remainingBalance,
            quarterStatus: quarterData
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process payment' });
    }
});

// Get transaction history
app.get('/api/transactions', (req, res) => {
    try {
        const { studentId, limit = 50 } = req.query;
        
        let filteredTransactions = transactions;
        if (studentId) {
            filteredTransactions = transactions.filter(t => t.studentId === studentId);
        }
        
        // Sort by timestamp (newest first) and limit results
        const sortedTransactions = filteredTransactions
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, parseInt(limit));

        res.json(sortedTransactions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Get financial transparency report
app.get('/api/transparency/finances', (req, res) => {
    try {
        const report = {
            institutionOverview: institutionFinances,
            totalStudents: students.length,
            activeStudents: students.filter(s => s.status === 'active').length,
            totalTransactions: transactions.length,
            monthlyCollection: getMonthlyCollection(),
            overduePayments: getOverduePayments(),
            collectionRate: (institutionFinances.totalCollected / (institutionFinances.totalCollected + institutionFinances.totalPending)) * 100
        };
        
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate transparency report' });
    }
});

// Get overdue payments
app.get('/api/overdue', (req, res) => {
    try {
        const overduePayments = getOverduePayments();
        res.json(overduePayments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch overdue payments' });
    }
});

// Helper Functions
function getUpcomingDues(student) {
    const upcoming = [];
    const currentDate = new Date();
    
    Object.entries(student.feeStructure).forEach(([yearKey, year]) => {
        Object.entries(year.quarters).forEach(([quarterKey, quarter]) => {
            if (!quarter.paid && quarter.dueDate > currentDate) {
                upcoming.push({
                    year: yearKey,
                    quarter: quarterKey,
                    amount: quarter.amount - quarter.paidAmount,
                    dueDate: quarter.dueDate
                });
            }
        });
    });
    
    return upcoming.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

function getOverduePayments() {
    const overdue = [];
    const currentDate = new Date();
    
    students.forEach(student => {
        Object.entries(student.feeStructure).forEach(([yearKey, year]) => {
            Object.entries(year.quarters).forEach(([quarterKey, quarter]) => {
                if (!quarter.paid && quarter.dueDate < currentDate) {
                    overdue.push({
                        studentId: student.id,
                        studentName: student.name,
                        year: yearKey,
                        quarter: quarterKey,
                        amount: quarter.amount - quarter.paidAmount,
                        dueDate: quarter.dueDate,
                        daysPastDue: Math.floor((currentDate - quarter.dueDate) / (1000 * 60 * 60 * 24))
                    });
                }
            });
        });
    });
    
    return overdue;
}

function getMonthlyCollection() {
    const monthlyData = {};
    
    transactions.forEach(transaction => {
        const monthYear = transaction.timestamp.toISOString().substr(0, 7); // YYYY-MM
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = 0;
        }
        monthlyData[monthYear] += transaction.amount;
    });
    
    return monthlyData;
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Student Fee Management Server running on port ${PORT}`);
    console.log('\nAvailable Endpoints:');
    console.log('POST /api/students - Create new student');
    console.log('GET  /api/students - Get all students');
    console.log('GET  /api/students/:id - Get student by ID');
    console.log('POST /api/payments - Process payment');
    console.log('GET  /api/transactions - Get transaction history');
    console.log('GET  /api/transparency/finances - Get financial transparency report');
    console.log('GET  /api/overdue - Get overdue payments');
});

// Export for testing
module.exports = app;