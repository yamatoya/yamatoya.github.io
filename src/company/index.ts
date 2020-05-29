import Chart, { plugins } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.plugins.unregister(ChartDataLabels);

window.addEventListener('DOMContentLoaded', function () {
    graph("coincheck", "revenue");
});

interface CompanyData {
    label: string[];
    revenue: number[];
    revenue_unit: string;
}

async function graph(name: string, target: string) {
    const ctx = document.getElementById('myChart');

    const data = await http<CompanyData>(
        `https://yamatoya.github.io/{name}/data.json`
    );

    if (ctx instanceof HTMLCanvasElement) {
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                "labels": data.label,
                datasets: [{
                    data: data["target"],
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
                            return `${value}${data.revenue_unit}`
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