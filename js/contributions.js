const MONTHLY_CONTRIBUTION = 2000;
const LATE_FINE = 100;
const PAYMENT_DEADLINE = 5;
function generateMonthlyContributions(members, month) {
    const contributions = [];

    members.forEach(function(member) {
        const record = {
            membershipNumber: member.membershipNumber,
            memberName: member.fullName,
            month: month,
            amountDue: MONTHLY_CONTRIBUTION,
            amountPaid: 0,
            balance: MONTHLY_CONTRIBUTION,
            fines: 0,
            paymentStatus: 'Not Paid',
            lastFineApplied: null,
            year: 2026,
            monthIndex: 0,
        };

        contributions.push(record);
    });

    return contributions;
}

const testMembers = [
    {
        membershipNumber: 'KVG001',
        fullName: 'Patrick Kisyula'
    },
    {
        membershipNumber: 'KVG002',
        fullName: 'Jane Wanjiku'
    },
    {
        membershipNumber: 'KVG003',
        fullName: 'David Kiptoo'
    }
];

const januaryRecords = generateMonthlyContributions(
    testMembers,
    'January 2026'
);

console.log(januaryRecords);
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