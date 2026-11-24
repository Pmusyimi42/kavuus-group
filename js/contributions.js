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
    const contributions = getContributions();
    const monthFilter = document.querySelector('#contribution-month');
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

function updateContributionSummary() {
    const contributions = getContributions();
    const monthFilter = document.querySelector('#contribution-month');
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

    document.querySelector('#expected-contributions').textContent =
        `KSh ${expected.toLocaleString()}`;

    document.querySelector('#received-contributions').textContent =
        `KSh ${received.toLocaleString()}`;

    document.querySelector('#outstanding-contributions').textContent =
        `KSh ${outstanding.toLocaleString()}`;
}

const monthFilter = document.querySelector('#contribution-month');

monthFilter.addEventListener('change', function() {
    renderContributions();
    updateContributionSummary();
});

const today = new Date();

const currentMonthContributions = createMonthlyRecords(
    today.getFullYear(),
    today.getMonth()
);

saveContributions(currentMonthContributions);

console.log(
    JSON.parse(localStorage.getItem('contributions'))
);