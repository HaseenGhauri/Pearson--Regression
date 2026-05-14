
        let dataPoints = [];
        let chart;

        function addPoint() {
            const xInput = document.getElementById('x');
            const yInput = document.getElementById('y');
            const errorDiv = document.getElementById('input-error');

            const x = parseFloat(xInput.value);
            const y = parseFloat(yInput.value);

            errorDiv.textContent = '';

            if (isNaN(x) || isNaN(y)) {
                errorDiv.textContent = "Please enter valid numbers for both X and Y.";
                return;
            }

            dataPoints.push({ x, y });
            renderTable();
            checkCalculateButton();

            xInput.value = '';
            yInput.value = '';
        }

        function renderTable() {
            const tbody = document.getElementById('table-body');
            tbody.innerHTML = '';

            dataPoints.forEach((point, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${point.x}</td>
                    <td>${point.y}</td>
                    <td><button onclick="removePoint(${index})" style="color:red; background:none; border:none; cursor:pointer;">✕</button></td>
                `;
                tbody.appendChild(row);
            });
        }

        function removePoint(index) {
            dataPoints.splice(index, 1);
            renderTable();
            checkCalculateButton();
        }

        function checkCalculateButton() {
            document.getElementById('calculate-btn').disabled = dataPoints.length < 2;
        }

        function clearAll() {
            if (confirm("Clear all data?")) {
                dataPoints = [];
                renderTable();
                checkCalculateButton();
                document.getElementById('results-panel').style.display = 'none';
                if (chart) chart.destroy();
            }
        }

        function calculateCorrelation() {
            if (dataPoints.length < 2) return;

            let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
            const n = dataPoints.length;

            dataPoints.forEach(p => {
                sumX += p.x;
                sumY += p.y;
                sumXY += p.x * p.y;
                sumX2 += p.x * p.x;
                sumY2 += p.y * p.y;
            });

            const meanX = sumX / n;
            const meanY = sumY / n;

            // Pearson r
            const numerator = n * sumXY - sumX * sumY;
            const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
            const r = denominator === 0 ? 0 : numerator / denominator;

            // Standard Deviation (Sample)
            let sumDevX2 = 0, sumDevY2 = 0;
            dataPoints.forEach(p => {
                sumDevX2 += Math.pow(p.x - meanX, 2);
                sumDevY2 += Math.pow(p.y - meanY, 2);
            });

            const sdX = Math.sqrt(sumDevX2 / (n - 1));
            const sdY = Math.sqrt(sumDevY2 / (n - 1));

            // Linear Regression: y = mx + b
            const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            const intercept = meanY - slope * meanX;

            // Display Results
            document.getElementById('mean-x').textContent = meanX.toFixed(4);
            document.getElementById('mean-y').textContent = meanY.toFixed(4);
            document.getElementById('sd-x').textContent = sdX.toFixed(4);
            document.getElementById('sd-y').textContent = sdY.toFixed(4);

            const rDisplay = document.getElementById('correlation-result');
            rDisplay.textContent = `r = ${r.toFixed(4)}`;

            // Color based on strength
            rDisplay.style.background = Math.abs(r) > 0.7 ? '#d1fae5' : (Math.abs(r) > 0.4 ? '#fef3c7' : '#fee2e2');

            // Interpretation
            let interp = '';
            if (Math.abs(r) > 0.8) interp = `Strong ${r > 0 ? 'positive' : 'negative'} correlation`;
            else if (Math.abs(r) > 0.5) interp = `Moderate ${r > 0 ? 'positive' : 'negative'} correlation`;
            else if (Math.abs(r) > 0.3) interp = `Weak ${r > 0 ? 'positive' : 'negative'} correlation`;
            else interp = "Very weak or no linear correlation";
            document.getElementById('interpretation').textContent = interp;

            // Regression Equation
            document.getElementById('regression-equation').textContent = 
                `y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)}`;

            document.getElementById('results-panel').style.display = 'block';

            drawScatterPlot(meanX, meanY, slope, intercept, r);
        }

        function drawScatterPlot(meanX, meanY, slope, intercept, r) {
            const ctx = document.getElementById('scatterChart');
            if (chart) chart.destroy();

            const xVals = dataPoints.map(p => p.x);
            const minX = Math.min(...xVals);
            const maxX = Math.max(...xVals);

            // Regression line points
            const linePoints = [
                { x: minX, y: slope * minX + intercept },
                { x: maxX, y: slope * maxX + intercept }
            ];

            chart = new Chart(ctx, {
                type: 'scatter',
                data: {
                    datasets: [
                        {
                            label: 'Data Points',
                            data: dataPoints.map(p => ({x: p.x, y: p.y})),
                            backgroundColor: '#3b82f6',
                            borderColor: '#1e40af',
                            borderWidth: 2,
                            pointRadius: 6
                        },
                        {
                            label: 'Regression Line',
                            data: linePoints,
                            type: 'line',
                            borderColor: '#ef4444',
                            borderWidth: 3,
                            borderDash: [0],
                            tension: 0,
                            pointRadius: 0,
                            showLine: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { title: { display: true, text: 'X Variable' } },
                        y: { title: { display: true, text: 'Y Variable' } }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: `Pearson r = ${r.toFixed(4)}`,
                            font: { size: 16 }
                        },
                        legend: { position: 'top' }
                    }
                }
            });
        }

        // Enter key support
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addPoint();
        });
   