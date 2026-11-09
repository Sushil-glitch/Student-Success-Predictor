/**
 * Client-side script for Student Predictor
 * Supports dual-mode:
 *  1. Server API mode (Flask backend at /predict_score and /predict_dropout)
 *  2. Static client-side fallback (GitHub Pages) with deterministic ML weights and rule-based heuristic
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Helper: Client-side Linear Regression Model (GitHub Pages fallback) ---
    function computeClientPerformanceScore(gender, studyHours, parentEdu, schoolType, board, testPrep) {
        let score = 49.55; // Intercept
        score += studyHours * 0.5260;

        if (gender === 'female') score += -1.5495;
        if (gender === 'male') score += 1.5495;

        if (parentEdu === 'bachelors') score += -0.8446;
        if (parentEdu === 'high_school') score += -2.3488;
        if (parentEdu === 'masters') score += 3.1934;

        if (schoolType === 'government') score += 0.8508;
        if (schoolType === 'private') score += -0.8508;

        if (board === 'cbse') score += -0.3226;
        if (board === 'ib') score += 2.3353;
        if (board === 'icse') score += 0.1808;
        if (board === 'igcse') score += -2.9386;
        if (board === 'state') score += 0.7451;

        if (testPrep === '50_percent') score += -5.2042;
        if (testPrep === '75_percent') score += 5.1842;
        if (testPrep === 'completed') score += 19.2584;
        if (testPrep === 'none') score += -19.2383;

        // Bounded deterministic score between 0 and 100 (no artificial random noise)
        score = Math.min(Math.max(Math.round(score * 100) / 100, 0), 100);
        return score;
    }

    // --- Helper: Rule-Based Dropout Assessment ---
    function computeClientDropoutRisk(attendance, studyHours, marks) {
        // Transparent heuristic evaluation based on attendance, study habits, and marks
        const isHighRisk = attendance < 50 || marks < 40 || (attendance < 65 && marks < 50 && studyHours < 3);
        return isHighRisk ? 'HIGH RISK' : 'LOW RISK';
    }

    // ==========================================
    // 1. Handling Performance Prediction Form
    // ==========================================
    const predictForm = document.getElementById('predictForm');
    if (predictForm) {
        predictForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const gender = document.getElementById('gender').value.trim();
            const studyHoursRaw = document.getElementById('studyHours').value;
            const studyHours = parseFloat(studyHoursRaw);
            const parentEdu = document.getElementById('parentEdu').value.trim();
            const schoolType = document.getElementById('schoolType').value.trim();
            const board = document.getElementById('board').value.trim();
            const testPrep = document.getElementById('testPrep').value.trim();

            const resultBox = document.getElementById('resultBox');
            const spinner = document.getElementById('spinner');

            // Client-side Input Validation
            if (isNaN(studyHours) || studyHours < 0 || studyHours > 24) {
                resultBox.style.display = 'block';
                resultBox.innerHTML = `
                    <p style="color: #ef4444; font-weight: 600;">Validation Error: Study hours must be a number between 0 and 24.</p>
                `;
                return;
            }

            const validGenders = ['male', 'female'];
            const validParentEdus = ['high_school', 'bachelors', 'masters'];
            const validSchoolTypes = ['government', 'private'];
            const validBoards = ['cbse', 'icse', 'state', 'ib', 'igcse'];
            const validTestPreps = ['none', '50_percent', '75_percent', 'completed'];

            if (!validGenders.includes(gender) ||
                !validParentEdus.includes(parentEdu) ||
                !validSchoolTypes.includes(schoolType) ||
                !validBoards.includes(board) ||
                !validTestPreps.includes(testPrep)) {
                resultBox.style.display = 'block';
                resultBox.innerHTML = `
                    <p style="color: #ef4444; font-weight: 600;">Validation Error: Please select valid options for all required fields.</p>
                `;
                return;
            }

            // Show real loading state while request is in flight
            spinner.style.display = 'block';
            resultBox.style.display = 'none';

            let score = null;
            let status = null;
            let engineSource = '';

            try {
                // Try live Flask API endpoint first
                const response = await fetch('/predict_score', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        gender,
                        studyHours,
                        parentEdu,
                        schoolType,
                        board,
                        testPrep
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    score = data.score;
                    status = data.status;
                    engineSource = data.message || 'Server ML Prediction';
                } else {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.error || `Server responded with status ${response.status}`);
                }
            } catch (err) {
                // Fallback to deterministic client-side ML engine (for GitHub Pages static hosting)
                score = computeClientPerformanceScore(gender, studyHours, parentEdu, schoolType, board, testPrep);
                status = score >= 40 ? 'PASS' : 'FAIL';
                engineSource = 'Static ML Engine (Client-side Linear Regression weights)';
            } finally {
                spinner.style.display = 'none';
            }

            // Render result
            resultBox.style.display = 'block';
            resultBox.innerHTML = `
                <h3>Predicted Result</h3>
                <p style="font-size: 2.2rem; font-weight: 700; margin: 10px 0; color: #fff;">${score}%</p>
                <span class="badge ${status === 'PASS' ? 'badge-pass' : 'badge-fail'}">
                    ${status}
                </span>
                <p style="margin-top: 15px; color: #94a3b8; font-size: 0.85rem;">
                    ${engineSource}
                </p>
            `;
        });
    }

    // ==========================================
    // 2. Handling Dropout Risk Assessment Form
    // ==========================================
    const dropoutForm = document.getElementById('dropoutForm');
    if (dropoutForm) {
        dropoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const attendanceRaw = document.getElementById('attendance').value;
            const studyHoursRaw = document.getElementById('studyHours').value;
            const marksRaw = document.getElementById('marks').value;

            const attendance = parseFloat(attendanceRaw);
            const studyHours = parseFloat(studyHoursRaw);
            const marks = parseFloat(marksRaw);

            const resultBox = document.getElementById('dropoutResult');
            const spinner = document.getElementById('dropoutSpinner');

            // Input Validation
            if (isNaN(attendance) || attendance < 0 || attendance > 100) {
                resultBox.style.display = 'block';
                resultBox.innerHTML = `
                    <p style="color: #ef4444; font-weight: 600;">Validation Error: Attendance must be between 0% and 100%.</p>
                `;
                return;
            }
            if (isNaN(studyHours) || studyHours < 0 || studyHours > 24) {
                resultBox.style.display = 'block';
                resultBox.innerHTML = `
                    <p style="color: #ef4444; font-weight: 600;">Validation Error: Study hours must be between 0 and 24 hours.</p>
                `;
                return;
            }
            if (isNaN(marks) || marks < 0 || marks > 100) {
                resultBox.style.display = 'block';
                resultBox.innerHTML = `
                    <p style="color: #ef4444; font-weight: 600;">Validation Error: Previous marks must be between 0% and 100%.</p>
                `;
                return;
            }

            spinner.style.display = 'block';
            resultBox.style.display = 'none';

            let risk = null;
            let note = '';

            try {
                // Try live Flask API endpoint first
                const response = await fetch('/predict_dropout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        attendance,
                        studyHours,
                        marks
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    risk = data.risk;
                    note = data.note || 'Evaluated via rule-based heuristic criteria';
                } else {
                    throw new Error(`Server returned status ${response.status}`);
                }
            } catch (err) {
                // Fallback to client-side rule evaluation for static GitHub Pages
                risk = computeClientDropoutRisk(attendance, studyHours, marks);
                note = 'Evaluated via rule-based heuristic criteria (Static mode)';
            } finally {
                spinner.style.display = 'none';
            }

            const isHighRisk = risk === 'HIGH RISK';
            resultBox.style.display = 'block';
            resultBox.innerHTML = `
                <h3>Risk Assessment</h3>
                <p style="font-size: 2rem; font-weight: 700; color: ${isHighRisk ? '#ef4444' : '#10b981'}; margin: 10px 0;">
                    ${risk}
                </p>
                <span class="badge" style="background: rgba(255,255,255,0.1); color: #94a3b8; font-weight: 500;">
                    Rule-Based Estimate (Heuristic - Not ML)
                </span>
                <p style="margin-top: 15px; color: #94a3b8; font-size: 0.9rem;">
                    Indicators evaluated: Attendance: ${attendance}%, Study: ${studyHours}h/wk, Previous Marks: ${marks}%.
                </p>
                <p style="color: #64748b; font-size: 0.8rem; margin-top: 5px;">
                    ${note}
                </p>
            `;
        });
    }

    // ==========================================
    // 3. Mobile Navigation Menu Toggle & Closing
    // ==========================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('overlay');

    function closeMobileMenu() {
        if (!mobileMenu || !overlay || !mobileMenuBtn) return;
        mobileMenu.classList.remove('active');
        overlay.classList.remove('active');
        const spans = mobileMenuBtn.querySelectorAll('span');
        spans.forEach(span => {
            span.style.transform = 'none';
            span.style.opacity = '1';
        });
    }

    if (mobileMenuBtn && mobileMenu && overlay) {
        mobileMenuBtn.addEventListener('click', () => {
            const isActive = mobileMenu.classList.toggle('active');
            overlay.classList.toggle('active', isActive);

            const spans = mobileMenuBtn.querySelectorAll('span');
            spans.forEach((span, index) => {
                if (isActive) {
                    if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) span.style.opacity = '0';
                    if (index === 2) span.style.transform = 'rotate(-45deg) translate(5px, -5px)';
                } else {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                }
            });
        });

        overlay.addEventListener('click', closeMobileMenu);

        // Close mobile drawer when any link is clicked inside mobile menu
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Close on Escape key press
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }
});
