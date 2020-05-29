import Chart, { plugins } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.plugins.unregister(ChartDataLabels);

window.addEventListener('DOMContentLoaded', function () {
    graph();
});

interface CompanyData {
    label: string[];
    revenue: number[];
}

async function graph() {
    const ctx = document.getElementById('myChart');

    const data = await http<CompanyData>(
        "https://yamatoya.github.io/coincheck/data.json"
    );

    if (ctx instanceof HTMLCanvasElement) {
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                "labels": data.label,
                datasets: [{
                    data: data.revenue,
                    "backgroundColor": "rgba(255, 99, 132, 0.2)",
                    "borderColor": "rgb(255, 99, 132)",
                    "borderWidth": 1
                }]
            },
            plugins: [ChartDataLabels],
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                maintainAspectRatio: false,
                responsive: false,
                legend: {
                    display: false
                },
                plugins: {
                    datalabels: {
                        color: 'black',
                        display: true,
                        formatter: function (value: number) {
                            return value + '億円'
                        }
                    },
                    font: {
                        weight: 'bold'
                    }
                }
            }
        });
    }
}

async function http<T>(
    request: RequestInfo
): Promise<T> {
    const response = await fetch(request);
    const body = await response.json();
    return body;
}

// example consuming code
interface Todo {
    userId: number;
    id: number;
    title: string;
    completed: boolean;
}