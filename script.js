document.getElementById('dataForm').addEventListener('submit', handleFormSubmit);
document.getElementById('exportChartButton').addEventListener('click', exportChartToPDF);
document.getElementById('exportTableButton').addEventListener('click', exportTableToCSV);
document.getElementById('lineChartButton').addEventListener('click', () => updateChart('line'));
document.getElementById('barChartButton').addEventListener('click', () => updateChart('bar'));
document.getElementById('columnChartButton').addEventListener('click', () => updateChart('column'));
document.getElementById('comparisonChartButton').addEventListener('click', () => updateChart('comparison'));

let data = [];
let waterConsumptionChart;

function handleFormSubmit(event) {
    event.preventDefault();
    const date = document.getElementById('dateInput').value;
    const consumption = parseFloat(document.getElementById('consumptionInput').value);
    if (date && !isNaN(consumption)) {
        data.push({ date, consumption });
        updateTable();
        updateChart();
        document.getElementById('dataForm').reset();
    }
}

function updateTable() {
    const tbody = document.getElementById('dataTable').querySelector('tbody');
    tbody.innerHTML = '';
    data.forEach((entry, index) => {
        const row = document.createElement('tr');
        const dateCell = document.createElement('td');
        dateCell.textContent = entry.date;
        const consumptionCell = document.createElement('td');
        consumptionCell.textContent = entry.consumption;
        const actionCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteData(index));
        actionCell.appendChild(deleteButton);
        row.appendChild(dateCell);
        row.appendChild(consumptionCell);
        row.appendChild(actionCell);
        tbody.appendChild(row);
    });
}

function updateChart(chartType = 'line') {
    const dates = data.map(entry => entry.date);
    const consumptions = data.map(entry => entry.consumption);
    const ctx = document.getElementById('waterConsumptionChart').getContext('2d');

    if (waterConsumptionChart) {
        waterConsumptionChart.destroy();
    }

    const chartOptions = {
        type: chartType === 'comparison' ? 'bar' : chartType,
        data: {
            labels: dates,
            datasets: [{
                label: 'Water Consumption (liters)',
                data: consumptions,
                backgroundColor: chartType === 'comparison' ? ['rgba(75, 192, 192, 0.2)', 'rgba(192, 75, 75, 0.2)'] : 'rgba(75, 192, 192, 0.2)',
                borderColor: chartType === 'comparison' ? ['rgba(75, 192, 192, 1)', 'rgba(192, 75, 75, 1)'] : 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: chartType !== 'bar',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Consumption (liters)'
                    },
                    beginAtZero: true
                }
            }
        }
    };

    if (chartType === 'column') {
        chartOptions.type = 'bar';
        chartOptions.options.indexAxis = 'y';
    }

    waterConsumptionChart = new Chart(ctx, chartOptions);
}

function deleteData(index) {
    data.splice(index, 1);
    updateTable();
    updateChart();
}

async function exportChartToPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    // Capture the chart
    const chartElement = document.getElementById('waterConsumptionChart');
    const chartCanvas = await html2canvas(chartElement);
    const chartData = chartCanvas.toDataURL('image/png');
    
    // Add chart to PDF
    pdf.addImage(chartData, 'PNG', 10, 10, 180, chartCanvas.height * 180 / chartCanvas.width);
    
    pdf.save('water_consumption_chart.pdf');
}

function exportTableToCSV() {
    const csvRows = [];
    const headers = ['Date', 'Water Consumption (liters)'];
    csvRows.push(headers.join(','));

    data.forEach(entry => {
        const values = [entry.date, entry.consumption];
        csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'water_consumption_data.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
