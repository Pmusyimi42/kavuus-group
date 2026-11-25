const MONTHLY_CONTRIBUTION = 2000;
const LATE_FINE = 100;
const PAYMENT_DEADLINE = 5;
const contributionsTable = document.querySelector('#contributions-list');
function generateMonthlyContributions(members, year, monthIndex) {
    const contributions = [];

    members.forEach(function(member) {
        const record = {
            membershipNumber: member.membershipNumber,
            memberName: member.fullName,
            month: new Date(year, monthIndex).toLocaleString('en', {
                month: 'long',
                year: 'numeric'
            }),
            amountDue: MONTHLY_CONTRIBUTION,
            amountPaid: 0,
            balance: MONTHLY_CONTRIBUTION,
            fines: 0,
            paymentStatus: 'Not Paid',
            lastFineApplied: null,
            year: year,
            monthIndex: monthIndex,
        };

        contributions.push(record);
    });

    return contributions;
}

function getRegisteredMembers() {
    return JSON.parse(localStorage.getItem('members')) || [];
}

function createMonthlyRecords(year, monthIndex) {
    const members = getRegisteredMembers();

    const contributions = generateMonthlyContributions(
        members,
        year,
        monthIndex
    );

    return contributions;
}

function saveContributions(newContributions) {
    const existingContributions = JSON.parse(
        localStorage.getItem('contributions')
    ) || [];

    newContributions.forEach(function(newRecord) {
        const alreadyExists = existingContributions.some(function(record) {
            return (
                record.membershipNumber === newRecord.membershipNumber &&
                record.month === newRecord.month
            );
        });

        if (!alreadyExists) {
            existingContributions.push(newRecord);
        }
    });

    localStorage.setItem(
        'contributions',
        JSON.stringify(existingContributions)
    );
}

function getContributions() {
    return JSON.parse(
        localStorage.getItem('contributions')
    ) || [];
}
function populateContributionMonthFilter() {
    const contributions = getContributions();
    const monthFilter = document.querySelector('#contribution-month');

    if (!monthFilter) return;
    const today = new Date();

    const currentMonthKey =
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const months = new Map();

    // Always include the current month
    months.set(
        currentMonthKey,
        today.toLocaleString('en', {
            month: 'long',
            year: 'numeric'
        })
    );

    // Collect months from saved contribution records
    contributions.forEach(function(contribution) {
        const key =
            `${contribution.year}-${String(contribution.monthIndex + 1).padStart(2, '0')}`;

        months.set(key, contribution.month);
    });

    monthFilter.innerHTML = '';

    [...months.entries()]
        .sort((a, b) => b[0].localeCompare(a[0]))
        .forEach(function([key, monthName]) {
            const option = document.createElement('option');

            option.value = key;
            option.textContent = monthName;

            monthFilter.appendChild(option);
        });

    monthFilter.value = currentMonthKey;
}

function renderContributions() {
    const monthFilter = document.querySelector('#contribution-month');

    if (!monthFilter || !contributionsTable) return;

    const contributions = getContributions();
    const selectedMonth = monthFilter.value;

    const filteredContributions = contributions.filter(function(contribution) {
        const contributionMonth =
            `${contribution.year}-${String(contribution.monthIndex + 1).padStart(2, '0')}`;

        return contributionMonth === selectedMonth;
    });

    contributionsTable.innerHTML = '';

    if (filteredContributions.length === 0) {
        contributionsTable.innerHTML = `
            <tr>
                <td colspan="9">No contribution records for this month.</td>
            </tr>
        `;
        return;
    }

    filteredContributions.forEach(function(contribution) {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${contribution.membershipNumber}</td>
            <td>${contribution.memberName}</td>
            <td>${contribution.month}</td>
            <td>KSh ${contribution.amountDue.toLocaleString()}</td>
            <td>KSh ${contribution.amountPaid.toLocaleString()}</td>
            <td>KSh ${contribution.balance.toLocaleString()}</td>
            <td>—</td>
            <td>—</td>
            <td>${contribution.paymentStatus}</td>
        `;

        contributionsTable.appendChild(row);
    });
}


function calculateLateFine(contribution, currentDate) {
    const firstFineDate = new Date(
        contribution.year,
        contribution.monthIndex,
        PAYMENT_DEADLINE + 1
    );

    if (contribution.balance <= 0 || currentDate < firstFineDate) {
        return contribution.fines;
    }

    let nextFineDate = contribution.lastFineApplied
        ? new Date(contribution.lastFineApplied)
        : firstFineDate;

    if (contribution.lastFineApplied) {
        nextFineDate.setMonth(nextFineDate.getMonth() + 1);
    }

    while (nextFineDate <= currentDate) {
        contribution.fines += LATE_FINE;
        contribution.lastFineApplied = nextFineDate.toISOString().slice(0, 10);

        nextFineDate.setMonth(nextFineDate.getMonth() + 1);
    }

    return contribution.fines;
}

const fines = [
    {
        membershipNumber: 'KVG001',
        month: 'January 2026',
        amount: 100,
        amountPaid: 0,
        balance: 100
    },
    {
        membershipNumber: 'KVG001',
        month: 'February 2026',
        amount: 100,
        amountPaid: 0,
        balance: 100
    },
    {
        membershipNumber: 'KVG002',
        month: 'January 2026',
        amount: 100,
        amountPaid: 0,
        balance: 100
    }
];
function allocatePayment(payment, contributions, fines, membershipNumber) {
        

    const memberFines = fines.filter(function(fine) {
        return fine.membershipNumber === membershipNumber;
    });
    // Sort fines from oldest to newest
    memberFines.sort(function(a, b) {
        return new Date(a.month) - new Date(b.month);
    });
    // Pay outstanding fines first
    memberFines.forEach(function(fine) {
        if (payment <= 0) return;

        const amountToPay = Math.min(payment, fine.balance);

        fine.amountPaid += amountToPay;
        fine.balance -= amountToPay;
        payment -= amountToPay;
    });

            // Get this member's contributions
        const memberContributions = contributions.filter(function(contribution) {
            return contribution.membershipNumber === membershipNumber;
        });

        // Sort contributions from oldest to newest
        memberContributions.sort(function(a, b) {
            return new Date(a.month) - new Date(b.month);
        });

        // Pay outstanding monthly contributions
    memberContributions.forEach(function(contribution) {
        if (payment <= 0) return;

        const amountToPay = Math.min(payment, contribution.balance);

        contribution.amountPaid += amountToPay;
        contribution.balance -= amountToPay;
        payment -= amountToPay;
    });

  return {
        fines: memberFines,
        contributions: memberContributions,
        unallocatedAmount: payment
    };
}
populateContributionMonthFilter()
renderContributions();
updateContributionSummary();
populatePaymentMembers();
renderMpesaTransactions();
renderPendingPayments();
renderMyPayments()
renderMemberContributions();

function updateContributionSummary() {
    const monthFilter = document.querySelector('#contribution-month');

    if (!monthFilter) return;

    const expectedElement = document.querySelector('#expected-contributions');
    const receivedElement = document.querySelector('#received-contributions');
    const outstandingElement = document.querySelector('#outstanding-contributions');

    if (!expectedElement || !receivedElement || !outstandingElement) return;

    const contributions = getContributions();
    const selectedMonth = monthFilter.value;

    const filteredContributions = contributions.filter(function(contribution) {
        const contributionMonth =
            `${contribution.year}-${String(contribution.monthIndex + 1).padStart(2, '0')}`;

        return contributionMonth === selectedMonth;
    });

    const expected = filteredContributions.reduce(function(total, contribution) {
        return total + contribution.amountDue;
    }, 0);

    const received = filteredContributions.reduce(function(total, contribution) {
        return total + contribution.amountPaid;
    }, 0);

    const outstanding = filteredContributions.reduce(function(total, contribution) {
        return total + contribution.balance;
    }, 0);

    expectedElement.textContent = `KSh ${expected.toLocaleString()}`;
    receivedElement.textContent = `KSh ${received.toLocaleString()}`;
    outstandingElement.textContent = `KSh ${outstanding.toLocaleString()}`;
}

function populatePaymentMembers() {
    const paymentMember = document.querySelector('#payment-member');

    if (!paymentMember) return;

    const members = getRegisteredMembers();

    paymentMember.innerHTML = '<option value="">Select Member</option>';

    members.forEach(function(member) {
        const option = document.createElement('option');

        option.value = member.membershipNumber;
        option.textContent =
            `${member.membershipNumber} - ${member.fullName}`;

        paymentMember.appendChild(option);
    });
}

function renderPendingPayments() {
    const payments = JSON.parse(localStorage.getItem('payments')) || [];
    const paymentsTable = document.querySelector('#pending-payments-list');
    if (!paymentsTable) return;
    paymentsTable.innerHTML = '';

    const pendingPayments = payments.filter(function(payment) {
        return payment.status === 'Pending';
    });

    if (pendingPayments.length === 0) {
        paymentsTable.innerHTML = `
            <tr>
                <td colspan="7">No pending payments.</td>
            </tr>
        `;
        return;
    }

    pendingPayments.forEach(function(payment) {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${payment.membershipNumber}</td>
            <td>KSh ${payment.amount.toLocaleString()}</td>
            <td>${payment.paymentDate}</td>
            <td>${payment.reference}</td>
            <td>${payment.method}</td>
            <td>${payment.status}</td>
            <td>
                <button type="button"
                    class="verify-payment-button"
                    data-payment-id="${payment.id}">
                    Verify
                </button>

                <button type="button"
                    class="reject-payment-button"
                    data-payment-id="${payment.id}">
                    Reject
                </button>
            </td>
        `;

        paymentsTable.appendChild(row);
    });
}
const pendingPaymentsTable = document.querySelector('#pending-payments-list');

if (pendingPaymentsTable) {
    pendingPaymentsTable.addEventListener('click', function(event) {

        const paymentId = event.target.dataset.paymentId;

        if (!paymentId) return;

        const payments = JSON.parse(localStorage.getItem('payments')) || [];

        const payment = payments.find(function(item) {
            return item.id === paymentId;
        });

        if (!payment) return;

        if (event.target.classList.contains('verify-payment-button')) {
            payment.status = 'Verified';
        }

        if (event.target.classList.contains('reject-payment-button')) {
            payment.status = 'Rejected';
        }

        localStorage.setItem('payments', JSON.stringify(payments));

        renderPendingPayments();
        renderMpesaTransactions();
    });
}

function renderMpesaTransactions() {
    const transactionsTable = document.querySelector('#mpesa-transactions-list');

    if (!transactionsTable) return;

    const payments = JSON.parse(localStorage.getItem('payments')) || [];
    const members = getRegisteredMembers();

    transactionsTable.innerHTML = '';

    if (payments.length === 0) {
        transactionsTable.innerHTML = `
            <tr>
                <td colspan="6">No transactions recorded yet.</td>
            </tr>
        `;
        return;
    }

    payments.forEach(function(payment) {
        const member = members.find(function(member) {
            return member.membershipNumber === payment.membershipNumber;
        });

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${payment.paymentDate}</td>
            <td>${member ? member.fullName : 'Unknown Member'}</td>
            <td>${payment.membershipNumber}</td>
            <td>${payment.reference}</td>
            <td>KSh ${payment.amount.toLocaleString()}</td>
            <td>${payment.status}</td>
        `;

        transactionsTable.appendChild(row);
    });
}


function renderMyPayments() {
    const paymentsTable = document.querySelector('#my-payments-list');

    if (!paymentsTable) return;

    const payments = JSON.parse(localStorage.getItem('payments')) || [];

    // Temporary member identity for testing
    const currentMember = 'KVG001';

    const myPayments = payments.filter(function(payment) {
        return payment.membershipNumber === currentMember;
    });

    paymentsTable.innerHTML = '';

    if (myPayments.length === 0) {
        paymentsTable.innerHTML = `
            <tr>
                <td colspan="5">You have not recorded any payments yet.</td>
            </tr>
        `;
        return;
    }

    myPayments.forEach(function(payment) {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${payment.paymentDate}</td>
            <td>${payment.reference}</td>
            <td>KSh ${payment.amount.toLocaleString()}</td>
            <td>${payment.method}</td>
            <td>${payment.status}</td>
        `;

        paymentsTable.appendChild(row);
    });
}


function renderMemberContributions() {
    const contributionsTable = document.querySelector(
        '#member-contributions-list'
    );

    if (!contributionsTable) return;

    const contributions = getContributions();

    // Temporary member identity for testing
    const currentMember = 'KVG001';

    const myContributions = contributions.filter(function(contribution) {
        return contribution.membershipNumber === currentMember;
    });

    contributionsTable.innerHTML = '';

    if (myContributions.length === 0) {
        contributionsTable.innerHTML = `
            <tr>
                <td colspan="5">No contribution records found.</td>
            </tr>
        `;
        return;
    }

    myContributions.forEach(function(contribution) {
        const balance = contribution.amountDue - contribution.amountPaid;

        let status = 'Unpaid';

        if (balance <= 0) {
            status = 'Paid';
        } else if (contribution.amountPaid > 0) {
            status = 'Partially Paid';
        }

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${contribution.month}</td>
            <td>KSh ${contribution.amountDue.toLocaleString()}</td>
            <td>KSh ${contribution.amountPaid.toLocaleString()}</td>
            <td>KSh ${balance.toLocaleString()}</td>
            <td>${status}</td>
        `;

        contributionsTable.appendChild(row);
    });
}



const paymentForm = document.querySelector('#payment-form');

if (paymentForm) {
    paymentForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // Temporary logged-in member for testing
        const currentMember = 'KVG001';

        const payment = {
            id: crypto.randomUUID(),
            membershipNumber: currentMember,
            amount: Number(document.querySelector('#payment-amount').value),
            paymentDate: document.querySelector('#payment-date').value,
            reference: document.querySelector('#payment-reference').value.trim().toUpperCase(),
            method: document.querySelector('#payment-method').value,
            status: 'Pending',
            recordedAt: new Date().toISOString()
        };

        const payments = JSON.parse(localStorage.getItem('payments')) || [];
        renderMyPayments()

        const referenceExists = payments.some(function(existingPayment) {
            return existingPayment.reference === payment.reference;
        });

        const message = document.querySelector('#payment-message');

        if (referenceExists) {
            message.textContent = 'This transaction reference has already been recorded.';
            return;
        }

        payments.push(payment);

        localStorage.setItem('payments', JSON.stringify(payments));

        if (typeof renderPendingPayments === 'function') {
            renderPendingPayments();
        }

        if (typeof renderMpesaTransactions === 'function') {
            renderMpesaTransactions();
        }

        message.textContent = 'Payment recorded and awaiting verification.';

        paymentForm.reset();
    });
}

const monthFilter = document.querySelector('#contribution-month');

if (monthFilter) {
    monthFilter.addEventListener('change', function() {
        renderContributions();
        updateContributionSummary();
    });
}

const today = new Date();

const currentMonthContributions = createMonthlyRecords(
    today.getFullYear(),
    today.getMonth()
);

saveContributions(currentMonthContributions);

console.log(
    JSON.parse(localStorage.getItem('contributions'))
);

