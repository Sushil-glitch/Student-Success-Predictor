/**
 * Charts script using Chart.js (v4.4.7)
 * Loads real statistics from static/data/dashboard.json generated from the dataset.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Attempt fetching dashboard JSON from relative or API paths
    let data = null;
    const candidatePaths = [
        '../static/data/dashboard.json',
        'static/data/dashboard.json',
        '/api/dashboard_data',
        '/static/data/dashboard.json'
    ];

    for (const path of candidatePaths) {
        try {
            const res = await fetch(path);
            if (res.ok) {
                data = await res.json();
                break;
            }
        } catch (e) {
            // Try next candidate path
        }
    }

    // Fallback static metrics derived from dataset if fetch fails (e.g. strict local file protocol)
    if (!data) {
        data = {
            avg_scores: { math: 54.5, reading: 53.6, writing: 52.1 },
            pass_fail: { pass: 82.3, fail: 17.7 },
            study_trend: [42.2, 50.2, 50.9, 57.0, 56.6, 56.3],
            quick_stats: {
                total_students: 395,
                avg_attendance: "93.9%",
                success_rate: "82.3%",
                high_risk_students: "17.7%"
            }
        };
    }

    // Update Quick Stats cards if DOM elements exist
    const totalElem = document.getElementById('stat-total');
    const attElem = document.getElementById('stat-attendance');
    const successElem = document.getElementById('stat-success');
    const riskElem = document.getElementById('stat-highrisk');

    if (totalElem && data.quick_stats) totalElem.textContent = data.quick_stats.total_students;
    if (attElem && data.quick_stats) attElem.textContent = data.quick_stats.avg_attendance;
    if (successElem && data.quick_stats) successElem.textContent = data.quick_stats.success_rate;
    if (riskElem && data.quick_stats) riskElem.textContent = data.quick_stats.high_risk_students;

    // 1. Average Scores by Subject - Bar Chart
    const ctxBar = document.getElementById('scoresBarChart');
    if (ctxBar && typeof Chart !== 'undefined') {
        new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: ['Math (G1)', 'Reading (G2)', 'Writing (G3)'],
                datasets: [{
                    label: 'Dataset Average Score (%)',
                    data: [
                        data.avg_scores.math,
                        data.avg_scores.reading,
                        data.avg_scores.writing
                    ],
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.75)',
                        'rgba(16, 185, 129, 0.75)',
                        'rgba(245, 158, 11, 0.75)'
                    ],
                    borderColor: ['#6366f1', '#10b981', '#f59e0b'],
                    borderWidth: 1.5,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#f8fafc' }
                    }
                }
            }
        });
    }

    // 2. Pass / Fail Distribution - Doughnut / Pie Chart
    const ctxPie = document.getElementById('passFailPieChart');
    if (ctxPie && typeof Chart !== 'undefined') {
        new Chart(ctxPie, {
            type: 'pie',
            data: {
                labels: [`Pass (>=40%): ${data.pass_fail.pass}%`, `Fail (<40%): ${data.pass_fail.fail}%`],
                datasets: [{
                    data: [data.pass_fail.pass, data.pass_fail.fail],
                    backgroundColor: ['#10b981', '#ef4444'],
                    borderColor: '#0f172a',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#f8fafc', padding: 15 }
                    }
                }
            }
        });
    }

    // 3. Study Hours vs Performance Trend - Line Chart
    const ctxLine = document.getElementById('studyTrendLineChart');
    if (ctxLine && typeof Chart !== 'undefined') {
        new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: ['0 hrs', '2 hrs', '4 hrs', '6 hrs', '8 hrs', '10+ hrs'],
                datasets: [{
                    label: 'Average Score (%)',
                    data: data.study_trend,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 6,
                    tension: 0.35,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 30,
                        max: 100,
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#f8fafc' }
                    }
                }
            }
        });
    }
});
