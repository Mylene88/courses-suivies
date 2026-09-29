<script setup>
import { formatMoney } from '@/lib/format'
import {
  CategoryScale,
  Chart,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

Chart.register(
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
)

const props = defineProps({
  points: { type: Array, required: true },
  label: { type: String, default: 'Évolution du prix' },
})

const canvas = ref(null)
/** @type {Chart | null} */
let chart = null

function draw() {
  chart?.destroy()
  chart = null
  if (!canvas.value || props.points.length === 0) return

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  chart = new Chart(canvas.value, {
    type: 'line',
    data: {
      labels: props.points.map((point) => point.label),
      datasets: [
        {
          data: props.points.map((point) => point.value),
          borderColor: '#1d6843',
          backgroundColor: 'rgba(29, 104, 67, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: props.points.length > 8 ? 0 : 3.5,
          pointHoverRadius: 5,
          pointBackgroundColor: '#1d6843',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: motion ? false : { duration: 400 },
      plugins: {
        legend: { display: false },
        tooltip: {
          displayColors: false,
          callbacks: {
            label(context) {
              return formatMoney(Number(context.parsed.y))
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#5e574e', maxRotation: 0, autoSkip: true, maxTicksLimit: 4 },
          border: { display: false },
        },
        y: {
          grace: '10%',
          grid: { color: '#e4dcd0' },
          ticks: {
            color: '#5e574e',
            maxTicksLimit: 5,
            callback(value) {
              return formatMoney(Number(value))
            },
          },
          border: { display: false },
        },
      },
    },
  })
}

onMounted(draw)
watch(() => props.points, draw, { deep: true })
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <div class="h-56">
    <canvas ref="canvas" role="img" :aria-label="label"></canvas>
  </div>
</template>
