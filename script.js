// DOM Elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const tabBtns = document.querySelectorAll('.tab-btn');
const teacherDashboard = document.getElementById('teacher-dashboard');
const studentDashboard = document.getElementById('student-dashboard');
const logoutBtn = document.getElementById('logout-btn');
const userName = document.getElementById('user-name');

// Mock Data Storage (In a real app, this would be in a database)
let users = [
    { id: 1, name: 'Teacher Demo', email: 'teacher@rj.edu', password: 'password', role: 'teacher' },
    { id: 2, name: 'Student Demo', email: 'student@rj.edu', password: 'password', role: 'student' }
];

let materials = [];
let assignments = [];
let submissions = [];

// Current User Session
let currentUser = null;

// Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        if (btn.dataset.tab === 'login') {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        } else {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
        }
    });
});

// Login Handler
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const role = document.getElementById('login-role').value;

    const user = users.find(u => u.email === email && u.password === password && u.role === role);
    
    if (user) {
        currentUser = user;
        showDashboard();
    } else {
        alert('Invalid credentials!');
    }
});

// Teacher Registration Handler
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    if (users.some(u => u.email === email)) {
        alert('Email already registered!');
        return;
    }

    const newTeacher = {
        id: users.length + 1,
        name,
        email,
        password,
        role: 'teacher'
    };

    users.push(newTeacher);
    alert('Registration successful! Please login.');
    
    // Reset form and switch to login tab
    registerForm.reset();
    tabBtns[0].click();
});

// Add Student Form Handler (Teacher Only)
const addStudentForm = document.getElementById('add-student-form');
addStudentForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('student-name').value;
    const email = document.getElementById('student-email').value;

    if (users.some(u => u.email === email)) {
        alert('Email already registered!');
        return;
    }

    const newStudent = {
        id: users.length + 1,
        name,
        email,
        password: 'password', // In a real app, would generate a random password and email it
        role: 'student'
    };

    users.push(newStudent);
    alert('Student added successfully!');
    addStudentForm.reset();
});

// Post Material Form Handler (Teacher Only)
const postMaterialForm = document.getElementById('post-material-form');
postMaterialForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('material-title').value;
    const content = document.getElementById('material-content').value;

    materials.push({
        id: materials.length + 1,
        title,
        content,
        teacherId: currentUser.id,
        date: new Date().toISOString()
    });

    alert('Material posted successfully!');
    postMaterialForm.reset();
    updateMaterialsList();
});

// Create Assignment Form Handler (Teacher Only)
const createAssignmentForm = document.getElementById('create-assignment-form');
createAssignmentForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('assignment-title').value;
    const description = document.getElementById('assignment-description').value;
    const dueDate = document.getElementById('assignment-due').value;

    assignments.push({
        id: assignments.length + 1,
        title,
        description,
        dueDate,
        teacherId: currentUser.id,
        date: new Date().toISOString()
    });

    alert('Assignment created successfully!');
    createAssignmentForm.reset();
    updateAssignmentsList();
});

// Update Materials List
function updateMaterialsList() {
    const materialsList = document.getElementById('materials-list');
    if (!materialsList) return;

    materialsList.innerHTML = materials.map(material => ` 
        <div class="list-item">
            <h3>${material.title}</h3>
            <p>${material.content}</p>
            <small>Posted on: ${new Date(material.date).toLocaleDateString()}</small>
        </div>
    `).join('');
}

// Update Assignments List
function updateAssignmentsList() {
    const assignmentsList = document.getElementById('assignments-list');
    if (!assignmentsList) return;

    assignmentsList.innerHTML = assignments.map(assignment => `
        <div class="list-item">
            <h3>${assignment.title}</h3>
            <p>${assignment.description}</p>
            <p>Due: ${assignment.dueDate}</p>
            ${currentUser.role === 'student' ? `
                <button onclick="submitAssignment(${assignment.id})" class="btn-primary">
                    Submit Assignment
                </button>
            ` : ''}
        </div>
    `).join('');
}

// Submit Assignment (Student Only)
function submitAssignment(assignmentId) {
    const submission = prompt('Enter your submission:');
    if (submission) {
        submissions.push({
            id: submissions.length + 1,
            assignmentId,
            studentId: currentUser.id,
            content: submission,
            date: new Date().toISOString(),
            score: null
        });
        alert('Assignment submitted successfully!');
        updateSubmissionsList();
    }
}

// Update Submissions List (Teacher Only)
function updateSubmissionsList() {
    const submissionsList = document.getElementById('submissions-list');
    if (!submissionsList) return;

    submissionsList.innerHTML = submissions.map(submission => {
        const student = users.find(u => u.id === submission.studentId);
        const assignment = assignments.find(a => a.id === submission.assignmentId);

        return `
            <div class="list-item">
                <h3>${assignment.title}</h3>
                <p>Student: ${student.name}</p>
                <p>Submission: ${submission.content}</p>
                <div class="score-section">
                    ${submission.score !== null 
                        ? `<p>Score: ${submission.score}</p>` 
                        : `
                            <input type="number" min="0" max="100" id="score-${submission.id}" placeholder="Enter score">
                            <button onclick="gradeSubmission(${submission.id})" class="btn-primary">
                                Grade
                            </button>
                        `
                    }
                </div>
            </div>
        `;
    }).join('');
}

// Grade Submission (Teacher Only)
function gradeSubmission(submissionId) {
    const scoreInput = document.getElementById(`score-${submissionId}`);
    const score = parseInt(scoreInput.value);
    
    if (isNaN(score) || score < 0 || score > 100) {
        alert('Please enter a valid score between 0 and 100');
        return;
    }

    const submission = submissions.find(s => s.id === submissionId);
    submission.score = score;
    alert('Submission graded successfully!');
    updateSubmissionsList();
    updateStudentScores();
}

// Update Student Scores List (Student View)
function updateStudentScores() {
    const scoresList = document.getElementById('scores-list');
    if (!scoresList) return;

    // Filter submissions for the current student
    const studentSubmissions = submissions.filter(submission => submission.studentId === currentUser.id);

    // Display each submission with its score
    scoresList.innerHTML = studentSubmissions.map(submission => {
        const assignment = assignments.find(a => a.id === submission.assignmentId);
        return `
            <div class="list-item">
                <h3>${assignment.title}</h3>
                <p>Submitted: ${submission.content}</p>
                <p>Score: ${submission.score !== null ? submission.score : 'Not graded yet'}</p>
            </div>
        `;
    }).join('');
}

// Show Dashboard
function showDashboard() {
    authSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    userName.textContent = `${currentUser.name} (${currentUser.role})`;

    if (currentUser.role === 'teacher') {
        teacherDashboard.classList.remove('hidden');
        studentDashboard.classList.add('hidden');
        updateSubmissionsList();
    } else {
        teacherDashboard.classList.add('hidden');
        studentDashboard.classList.remove('hidden');
        updateMaterialsList();
        updateAssignmentsList();
        updateStudentScores();
    }
}

// Logout Handler
logoutBtn.addEventListener('click', () => {
    currentUser = null;
    authSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    loginForm.reset();
});
