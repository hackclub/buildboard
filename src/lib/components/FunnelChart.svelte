<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { Chart, registerables } from 'chart.js';
    import { FunnelController, TrapezoidElement } from 'chartjs-chart-funnel';
    import ChartDataLabels from 'chartjs-plugin-datalabels';

    Chart.register(...registerables, FunnelController, TrapezoidElement, ChartDataLabels);

    interface FunnelStep {
        label: string;
        value: number;
    }

    interface Props {
        steps: FunnelStep[];
        height?: number;
    }

    let { steps, height = 300 }: Props = $props();

    let canvas: HTMLCanvasElement;
    let chart: Chart | null = null;

    function getColors(count: number): string[] {
        const baseColors = [
            'rgba(212, 175, 55, 0.9)',
            'rgba(195, 160, 50, 0.9)',
            'rgba(178, 145, 45, 0.9)',
            'rgba(161, 130, 40, 0.9)',
            'rgba(144, 115, 35, 0.9)',
            'rgba(127, 100, 30, 0.9)',
            'rgba(110, 90, 28, 0.9)',
            'rgba(74, 222, 128, 0.9)',
        ];
        return baseColors.slice(0, count);
    }

    function createChart() {
        if (!canvas || steps.length === 0) return;

        if (chart) {
            chart.destroy();
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const labels = steps.map(s => s.label);
        const data = steps.map(s => s.value);
        const colors = getColors(steps.length);

        chart = new Chart(ctx, {
            type: 'funnel' as any,
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors,
                    borderColor: colors.map(c => c.replace('0.9', '1')),
                    borderWidth: 1,
                }]
            },
            options: {
                indexAxis: 'x',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.raw as number;
                                const total = steps[0]?.value || 1;
                                const pct = ((value / total) * 100).toFixed(1);
                                return `${value.toLocaleString()} (${pct}%)`;
                            }
                        }
                    },
                    datalabels: {
                        color: '#1a1a1a',
                        font: {
                            weight: 'bold' as const,
                            size: 11
                        },
                        formatter: (value: number) => {
                            const total = steps[0]?.value || 1;
                            const pct = ((value / total) * 100).toFixed(0);
                            return `${value.toLocaleString()}\n(${pct}%)`;
                        },
                        textAlign: 'center' as const
                    }
                },
                scales: {
                    x: {
                        display: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                                size: 10
                            },
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        display: false
                    }
                }
            } as any,
        });
    }

    onMount(() => {
        createChart();
    });

    onDestroy(() => {
        if (chart) {
            chart.destroy();
        }
    });

    $effect(() => {
        if (steps && canvas) {
            createChart();
        }
    });
</script>

<div class="funnel-chart-container" style="height: {height}px;">
    <canvas bind:this={canvas}></canvas>
</div>

<style>
    .funnel-chart-container {
        width: 100%;
        position: relative;
    }
</style>
