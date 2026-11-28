
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
const contributionsList = document.querySelector('#contributions-list');
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

const paymentVerificationSection = document.querySelector(
    '#payment-verification-section'
);

function updateRolePermissions() {
    if (!roleSelector) return;

    if (chairmanActions) {
        chairmanActions.style.display =
            roleSelector.value === 'chairman' ? 'block' : 'none';
    }

    if (paymentVerificationSection) {
        paymentVerificationSection.style.display =
            roleSelector.value === 'treasurer' ? 'block' : 'none';
    }
}

if (roleSelector) {
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
            status: 'Active',
            accountActivated: false
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
if (memberSearch) {
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
}


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


const profileDetails = document.querySelector('#profile-details');
const editProfileButton = document.querySelector('#edit-profile-button');
const editProfileForm = document.querySelector('#edit-profile-form');
const cancelProfileEdit = document.querySelector('#cancel-profile-edit');
const profileMessage = document.querySelector('#profile-message');


if (profileDetails && editProfileButton && editProfileForm) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    const members = JSON.parse(localStorage.getItem('members')) || [];

    const currentMember = members.find(function(member) {
        return member.email === loggedInUser.email;
    });

    if (currentMember) {
        profileDetails.innerHTML = `
            <p><strong>Full Name:</strong> ${currentMember.fullName}</p>
            <p><strong>Membership Number:</strong> ${currentMember.membershipNumber}</p>
            <p><strong>Membership Status:</strong> ${currentMember.status}</p>
            <p><strong>Joining Date:</strong> ${new Date(currentMember.dateJoined).toLocaleDateString()}</p>
            <p><strong>Phone Number:</strong> ${currentMember.phoneNumber}</p>
            <p><strong>Email:</strong> ${currentMember.email}</p>
        `;
        editProfileForm.addEventListener('submit', function(event) {
        event.preventDefault();

        currentMember.phoneNumber =
            document.querySelector('#profile-phone').value.trim();

        currentMember.email =
            document.querySelector('#profile-email').value.trim();

        localStorage.setItem('members', JSON.stringify(members));

        profileDetails.innerHTML = `
            <p><strong>Full Name:</strong> ${currentMember.fullName}</p>
            <p><strong>Membership Number:</strong> ${currentMember.membershipNumber}</p>
            <p><strong>Membership Status:</strong> ${currentMember.status}</p>
            <p><strong>Joining Date:</strong> ${new Date(currentMember.dateJoined).toLocaleDateString()}</p>
            <p><strong>Phone Number:</strong> ${currentMember.phoneNumber}</p>
            <p><strong>Email:</strong> ${currentMember.email}</p>
        `;

        editProfileForm.hidden = true;
        profileMessage.textContent = 'Profile updated successfully.';
    });
    cancelProfileEdit.addEventListener('click', function() {
        editProfileForm.hidden = true;
        profileMessage.textContent = '';
    });

    }
    editProfileButton.addEventListener('click', function() {
        document.querySelector('#profile-phone').value =
            currentMember.phoneNumber;

        document.querySelector('#profile-email').value =
            currentMember.email;

        editProfileForm.hidden = false;
    });
}

// activation form

const activationForm = document.querySelector('#activation-form')

if(activationForm){
    activationForm.addEventListener('submit', function(event){
    event.preventDefault()
    console.log('Activation form submitted');
    const email = document.querySelector('#email').value
    const password = document.querySelector('#password').value
    const confirmPassword = document.querySelector('#confirm-password').value
    const para = document.querySelector('#activation-message')
    function findMember(member){
        return member.email === email
    }
    if(password !== confirmPassword){
       
        para.textContent = 'Passwords do not match.'
    }else {
        const members = JSON.parse(localStorage.getItem('members')) || []
        const registeredMember = members.find(findMember)
        console.log('Registered member:', registeredMember)
        if(!registeredMember){
            para.textContent =  'No registered member found with this email.'
            return
        }
        if( registeredMember.status === 'Pending' ||
            registeredMember.status === 'Rejected'){
                para.textContent = 'Your membership is not approved. You cannot activate your account'
                return
            }

            if(registeredMember.accountActivated === true){
                para.textContent = 'Account already active.'
            }
             const memberIndex = members.findIndex(function(member){
                return member.membershipNumber === registeredMember.membershipNumber
             })

            if(memberIndex !== -1){
                members[memberIndex].password = password
                members[memberIndex].accountActivated = true

                localStorage.setItem('members', JSON.stringify(members))

                para.textContent = 'Account activated successfully!'
            }
    }
    })
}


const loginForm = document.querySelector('#login-form')

if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault()

        const email = document.querySelector('#email').value
        const password = document.querySelector('#password').value

        if (!email || !password) {
            alert('Please enter both email and password')
            return
        }

        const users = [
            {
                email: 'member@gmail.com',
                password: 'member123',
                role: 'member'
            },
            {
                email: 'leader@gmail.com',
                password: 'leader123',
                role: 'leadership'
            }
        ]

        const leadershipUser = users.find(function(account) {
            return account.email === email && account.password === password
        })

        const members = JSON.parse(localStorage.getItem('members')) || []

        const registeredMember = members.find(function(member) {
            return member.email === email &&
                member.password === password &&
                member.accountActivated === true &&
                member.status === 'Active'
        })

        const user = leadershipUser || registeredMember

        if (!user) {
            alert('Invalid email or password')
            return
        }

        const role = leadershipUser ? 'leadership' : 'member'

        localStorage.setItem('loggedInUser', JSON.stringify({
            email: user.email,
            role: role
        }))

        if (role === 'member') {
            window.location.href = 'members/dashboard.html'
        } else {
            window.location.href = 'leadership/dashboard.html'
        }
    })
}

const logoutButton = document.querySelector('#logout-button');

if (logoutButton) {
    logoutButton.addEventListener('click', function() {
        localStorage.removeItem('loggedInUser');
        window.location.href = '../login.html';
    });
}

window.addEventListener('pageshow', function() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'))

    const currentPath = window.location.pathname

    if (currentPath.includes('/members/') &&
        (!loggedInUser || loggedInUser.role !== 'member')) {
        window.location.replace('../login.html')
    }

    if (currentPath.includes('/leadership/') &&
        (!loggedInUser || loggedInUser.role !== 'leadership')) {
        window.location.replace('../login.html')
    }
})

const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'))


if (loggedInUser && loggedInUser.role === 'member') {
    const currentMember = members.find(function(member) {
        return member.email === loggedInUser.email;
    });

   
    const contributions = JSON.parse(localStorage.getItem('contributions')) || []

    const memberContributions = contributions.filter(function(contribution){
        return contribution.membershipNumber === currentMember.membershipNumber
    })

    const totalMemberContributions = memberContributions.reduce(function(totalContribution, record){
        return record.amountPaid + totalContribution
    }, 0)

   
    const para = document.querySelector('#statement-total-contributions')
    para.textContent = `KSh ${totalMemberContributions.toLocaleString()}`
}


// NOTE:
// The Edit form loads existing member information.
// Saving edited information is the next step.
