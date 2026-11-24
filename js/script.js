
// KAVUUS GROUP - FRONTEND JAVASCRIPT

// --------------------------------------------------
// 1. INITIAL DATA
// --------------------------------------------------

const membershipForm = document.querySelector('#membership-form');

let selectedApplicationId = null;

const members = JSON.parse(localStorage.getItem('members') || '[]');

const applications = JSON.parse(localStorage.getItem('applications') || '[]');
const memberEditForm = document.querySelector('#member-edit-form');
const editPhone = document.querySelector('#edit-phone');
const editEmail = document.querySelector('#edit-email');
const editSupporter = document.querySelector('#edit-supporter');
const editStatus = document.querySelector('#edit-status');
const memberSearch = document.querySelector('#member-search');
// --------------------------------------------------
// 2. PANEL VISIBILITY
// --------------------------------------------------

const applicationReview = document.querySelector('#application-review');
const memberDetails = document.querySelector('#member-details');
const editMemberForm = document.querySelector('#edit-member-form');

// Hide all panels when the dashboard initially loads.
if (applicationReview) {
    applicationReview.hidden = true;
    applicationReview.style.display = 'none';
}

if (memberDetails) {
    memberDetails.hidden = true;
    memberDetails.style.display = 'none';
}

if (editMemberForm) {
    editMemberForm.hidden = true;
    editMemberForm.style.display = 'none';
}

// --------------------------------------------------
// 3. MEMBERSHIP APPLICATION FORM
// --------------------------------------------------

if (membershipForm) {
    membershipForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const application = {
            id: crypto.randomUUID(),
            fullName: document.querySelector('#full-name').value.trim(),
            phoneNumber: document.querySelector('#phone').value.trim(),
            email: document.querySelector('#email').value.trim(),
            idNumber: document.querySelector('#national-id').value.trim(),
            supportingMember: document.querySelector('#supporting-member').value.trim(),
            declaration: document.querySelector('#declaration').checked,
            status: 'Pending',
            applicationDate: new Date().toISOString()
        };

        applications.push(application);

        localStorage.setItem('applications', JSON.stringify(applications));

        document.querySelector('#form-message').textContent =
            'Your membership application has been submitted successfully!';

        membershipForm.reset();
    });
}

// --------------------------------------------------
// 4. LEADERSHIP ROLE PERMISSIONS
// --------------------------------------------------

const roleSelector = document.querySelector('#leadership-role');
const chairmanActions = document.querySelector('#chairman-actions');

function updateRolePermissions() {
    if (!roleSelector || !chairmanActions) return;

    chairmanActions.style.display =
        roleSelector.value === 'chairman' ? 'block' : 'none';
}

if (roleSelector && chairmanActions) {
    roleSelector.addEventListener('change', updateRolePermissions);
    updateRolePermissions();
}

// --------------------------------------------------
// 5. DISPLAY PENDING APPLICATIONS
// --------------------------------------------------

const applicationList = document.querySelector('#applications-list');

if (applicationList) {
    const savedApplications = JSON.parse(
        localStorage.getItem('applications') || '[]'
    );

    savedApplications
        .filter(function(application) {
            return application.status === 'Pending';
        })
        .forEach(function(application) {
            const row = document.createElement('tr');

            row.dataset.applicationId = application.id;

            row.innerHTML = `
                <td>${application.fullName}</td>
                <td>${application.idNumber}</td>
                <td>${application.supportingMember}</td>
                <td>${new Date(application.applicationDate).toLocaleDateString()}</td>
                <td>${application.status}</td>
                <td>
                    <button type="button" class="review-button">Review</button>
                </td>
            `;

            applicationList.appendChild(row);
        });

    // REVIEW APPLICATION
    applicationList.addEventListener('click', function(event) {
        if (!event.target.classList.contains('review-button')) return;

        const row = event.target.closest('tr');
        const applicationId = row.dataset.applicationId;

        const savedApplications = JSON.parse(
            localStorage.getItem('applications') || '[]'
        );

        const selectedApplication = savedApplications.find(function(application) {
            return application.id === applicationId;
        });

        if (!selectedApplication) {
            console.error('Application not found.');
            return;
        }

        selectedApplicationId = selectedApplication.id;

        document.querySelector('#review-name').textContent =
            selectedApplication.fullName;

        document.querySelector('#review-phone').textContent =
            selectedApplication.phoneNumber;

        document.querySelector('#review-email').textContent =
            selectedApplication.email;

        document.querySelector('#review-id').textContent =
            selectedApplication.idNumber;

        document.querySelector('#review-supporter').textContent =
            selectedApplication.supportingMember;

        document.querySelector('#review-date').textContent =
            new Date(selectedApplication.applicationDate).toLocaleDateString();

        document.querySelector('#review-status').textContent =
            selectedApplication.status;

        // SHOW REVIEW PANEL
        applicationReview.hidden = false;
        applicationReview.style.display = 'block';
    });
}

// --------------------------------------------------
// 6. APPROVE APPLICATION
// --------------------------------------------------

const approveButton = document.querySelector('#approve-application');

if (approveButton) {
    approveButton.addEventListener('click', function() {
        if (!selectedApplicationId) {
            alert('Please select an application first.');
            return;
        }

        if (roleSelector && roleSelector.value !== 'chairman') {
            alert('Only the Chairman can approve applications.');
            return;
        }

        const savedApplications = JSON.parse(
            localStorage.getItem('applications') || '[]'
        );

        const application = savedApplications.find(function(app) {
            return app.id === selectedApplicationId;
        });

        if (!application || application.status !== 'Pending') {
            alert('Pending application could not be found.');
            return;
        }

        const nextNumber = members.length + 1;

        const membershipNumber =
            `KVG${String(nextNumber).padStart(3, '0')}`;

        const newMember = {
            membershipNumber: membershipNumber,
            fullName: application.fullName,
            phoneNumber: application.phoneNumber,
            email: application.email,
            idNumber: application.idNumber,
            supportingMember: application.supportingMember,
            dateJoined: new Date().toISOString(),
            status: 'Active'
        };

        members.push(newMember);

        localStorage.setItem('members', JSON.stringify(members));

        application.status = 'Approved';

        localStorage.setItem(
            'applications',
            JSON.stringify(savedApplications)
        );

        document.querySelector('#review-status').textContent = 'Approved';

        const applicationRow = document.querySelector(
            `[data-application-id="${selectedApplicationId}"]`
        );

        if (applicationRow) {
            applicationRow.remove();
        }

        renderMembers();

        alert(`Application approved! Membership number: ${membershipNumber}`);

        selectedApplicationId = null;
        applicationReview.hidden = true;
    });
}

// --------------------------------------------------
// 7. REJECT APPLICATION
// --------------------------------------------------

const rejectButton = document.querySelector('#reject-application');

if (rejectButton) {
    rejectButton.addEventListener('click', function() {
        if (!selectedApplicationId) {
            alert('Please select an application first.');
            return;
        }

        const savedApplications = JSON.parse(
            localStorage.getItem('applications') || '[]'
        );

        const application = savedApplications.find(function(app) {
            return app.id === selectedApplicationId;
        });

        if (!application || application.status !== 'Pending') {
            alert('Pending application could not be found.');
            return;
        }

        application.status = 'Rejected';

        localStorage.setItem(
            'applications',
            JSON.stringify(savedApplications)
        );

        document.querySelector('#review-status').textContent = 'Rejected';

        const applicationRow = document.querySelector(
            `[data-application-id="${selectedApplicationId}"]`
        );

        if (applicationRow) {
            applicationRow.remove();
        }

        renderRejectedApplications();

        alert('Application rejected successfully!');

        selectedApplicationId = null;
    });
}

// --------------------------------------------------
// 8. DISPLAY REJECTED APPLICATIONS
// --------------------------------------------------

function renderRejectedApplications() {
    const rejectedApplicationsList = document.querySelector(
        '#rejected-applications-list'
    );

    if (!rejectedApplicationsList) return;

    rejectedApplicationsList.innerHTML = '';

    const savedApplications = JSON.parse(
        localStorage.getItem('applications') || '[]'
    );

    const rejectedApplications = savedApplications.filter(function(application) {
        return application.status === 'Rejected';
    });

    rejectedApplications.forEach(function(application) {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${application.fullName}</td>
            <td>${application.idNumber}</td>
            <td>${application.supportingMember}</td>
            <td>${new Date(application.applicationDate).toLocaleDateString()}</td>
            <td>${application.status}</td>
        `;

        rejectedApplicationsList.appendChild(row);
    });
}

renderRejectedApplications();

// --------------------------------------------------
// 9. REGISTERED MEMBERS
// --------------------------------------------------

const membersList = document.querySelector('#members-list');

function renderMembers(memberList = members) {
    if (!membersList) return;

    membersList.innerHTML = '';

    memberList.forEach(function(member) {
        const row = document.createElement('tr');

        row.dataset.membershipNumber = member.membershipNumber;

        row.innerHTML = `
            <td>${member.membershipNumber}</td>
            <td>${member.fullName}</td>
            <td>${new Date(member.dateJoined).toLocaleDateString()}</td>
            <td>KSh 0</td>
            <td>${member.status}</td>
            <td>
                <button type="button" class="view-member-button">View</button>
                <button type="button" class="edit-member-button">Edit</button>
            </td>
        `;

        membersList.appendChild(row);
    });
}
renderMembers();
memberSearch.addEventListener('input', function() {
    const searchValue = memberSearch.value.toLowerCase();
    const filteredMembers = members.filter(function(member) {
    return (
        member.fullName.toLowerCase().includes(searchValue) ||
        member.membershipNumber.toLowerCase().includes(searchValue) ||
        member.phoneNumber.includes(searchValue)
    );
});
renderMembers(filteredMembers);
});


// --------------------------------------------------
// 10. VIEW AND EDIT MEMBER
// --------------------------------------------------

if (membersList) {
    membersList.addEventListener('click', function(event) {
        const row = event.target.closest('tr');

        if (!row) return;

        const membershipNumber = row.dataset.membershipNumber;

        const selectedMember = members.find(function(member) {
            return member.membershipNumber === membershipNumber;
        });

        if (!selectedMember) return;

        // VIEW MEMBER DETAILS
        if (event.target.classList.contains('view-member-button')) {
            document.querySelector('#detail-number').textContent =
                selectedMember.membershipNumber;

            document.querySelector('#detail-name').textContent =
                selectedMember.fullName;

            document.querySelector('#detail-phone').textContent =
                selectedMember.phoneNumber;

            document.querySelector('#detail-email').textContent =
                selectedMember.email;

            document.querySelector('#detail-id').textContent =
                selectedMember.idNumber;

            document.querySelector('#detail-supporter').textContent =
                selectedMember.supportingMember;

            document.querySelector('#detail-date').textContent =
                new Date(selectedMember.dateJoined).toLocaleDateString();

            document.querySelector('#detail-status').textContent =
                selectedMember.status;

            // SHOW MEMBER DETAILS
            memberDetails.hidden = false;
            memberDetails.style.display = 'block';
        }

        // EDIT MEMBER DETAILS
        if (event.target.classList.contains('edit-member-button')) {
            document.querySelector('#edit-phone').value =
                selectedMember.phoneNumber;

            document.querySelector('#edit-email').value =
                selectedMember.email;

            document.querySelector('#edit-supporter').value =
                selectedMember.supportingMember;

            document.querySelector('#edit-status').value =
                selectedMember.status;

                memberEditForm.addEventListener('submit', function(event) {
                    event.preventDefault();

                    selectedMember.phoneNumber = editPhone.value;
                    selectedMember.email = editEmail.value;
                    selectedMember.supportingMember = editSupporter.value;
                    selectedMember.status = editStatus.value;
                    localStorage.setItem('members', JSON.stringify(members));
                    renderMembers()
                    editMemberForm.hidden = true
                });

            // SHOW EDIT FORM
            editMemberForm.hidden = false;
            editMemberForm.style.display = 'block';
        }
    });
}

// NOTE:
// The Edit form loads existing member information.
// Saving edited information is the next step.
