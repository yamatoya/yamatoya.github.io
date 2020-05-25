import Chart, { plugins } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.plugins.unregister(ChartDataLabels);

window.addEventListener('DOMContentLoaded', function () {
    const graph = new Graph()
});

class Graph {
    private ctx = document.getElementById('myChart');
    constructor() {
        if (this.ctx instanceof HTMLCanvasElement) {
            var myChart = new Chart(this.ctx, {
                type: 'bar',
                data: {
                    "labels": ["2019/4-6", "2019/7-9", "2019/10-12", "2020/1-3"],
                    datasets: [{
                        data: [12.74, 8.01, 4.81, 12.56],
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
}