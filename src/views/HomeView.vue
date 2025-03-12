<script setup>
import { ref, watch, onMounted, computed } from 'vue';

import { useScale } from '@composables/useScale.js';
import { useDrag } from '@composables/useDrag.js';
import { useImpactCalculator } from '@composables/useImpactCalculator.js';

// Escala general del sistema
const {
  baseSize,
  rows,
  columns,
  baseSizePx,
  regimentWidthPx,
  regimentHeightPx,
  templateSizePx,
  templateSize,
} = useScale();

const templates = [
  { name: 'Small Template', size: 75 },
  { name: 'Large Template', size: 125 },
];

// Refs de los contenedores
const battlefieldRef = ref(null);
const battlefieldRect = ref({ x: 0, y: 0 });

const regimentRef = ref(null);
const regimentRect = ref({ x: 0, y: 0 });

// Funciones de actualización de rects
const updateBattlefieldRect = () => {
  if (battlefieldRef.value) {
    battlefieldRect.value = battlefieldRef.value.getBoundingClientRect();
  }
};

const updateRegimentRect = () => {
  if (regimentRef.value) {
    const rect = regimentRef.value.getBoundingClientRect();
    regimentRect.value = {
      x: rect.left - battlefieldRect.value.x,
      y: rect.top - battlefieldRect.value.y,
    };
  }
};

onMounted(() => {
  updateBattlefieldRect();
  updateRegimentRect();

  window.addEventListener('resize', () => {
    updateBattlefieldRect();
    updateRegimentRect();
  });
});

// Bases con posiciones absolutas relativas al battlefield
const bases = computed(() => {
  const arr = [];
  const regimentOffsetX = regimentRect.value.x;
  const regimentOffsetY = regimentRect.value.y;

  for (let row = 0; row < rows.value; row++) {
    for (let col = 0; col < columns.value; col++) {
      const x = regimentOffsetX + col * baseSizePx.value + baseSizePx.value / 2;
      const y = regimentOffsetY + row * baseSizePx.value + baseSizePx.value / 2;
      arr.push({ x, y, row, col });
    }
  }
  return arr;
});

// Drag logic
const { position: templatePosition, onMouseDown } = useDrag(battlefieldRef, updateRegimentRect);

// Impact calculation
const { impactedBases, impactSummary } = useImpactCalculator(
  bases,
  templatePosition,
  templateSizePx,
  baseSizePx,
);

// Template selection logic
const selectedTemplate = ref(templates[0].size);

watch(selectedTemplate, (newSize) => {
  templateSize.value = newSize;
});
</script>

<template>
  <div class="config-panel">
    <h2>Regiment Configuration</h2>
    <div class="config-panel__inputs">
      <label>
        Base size (mm):
        <input type="number" v-model="baseSize" />
      </label>

      <label>
        Rows:
        <input type="number" v-model="rows" />
      </label>

      <label>
        Columns:
        <input type="number" v-model="columns" />
      </label>
    </div>

    <div class="template-selector">
      <h3>Select Template</h3>
      <label v-for="option in templates" :key="option.size">
        <input type="radio" :value="option.size" v-model="selectedTemplate" />
        {{ option.name }} ({{ option.size }}mm)
      </label>
    </div>

    <section class="impact-results">
      <p>Total hits: {{ impactSummary.totals }}</p>
      <p>Partial hits: {{ impactSummary.partials }}</p>
    </section>
  </div>
  <div ref="battlefieldRef" class="battlefield">
    <!-- Regiment grid -->
    <div
      ref="regimentRef"
      class="regiment"
      :style="{
        gridTemplateRows: `repeat(${rows}, ${baseSizePx}px)`,
        gridTemplateColumns: `repeat(${columns}, ${baseSizePx}px)`,
        width: `${regimentWidthPx}px`,
        height: `${regimentHeightPx}px`,
      }"
    >
      <div
        v-for="base in impactedBases"
        :key="`${base.row}-${base.col}`"
        class="base"
        :class="{
          'impact-total': base.impactType === 'total',
          'impact-partial': base.impactType === 'partial',
        }"
        :style="{
          width: `${baseSizePx}px`,
          height: `${baseSizePx}px`,
        }"
      ></div>
    </div>
    <div
      class="circular-template"
      :style="{
        width: `${templateSizePx}px`,
        height: `${templateSizePx}px`,
        left: `${templatePosition.x - templateSizePx / 2}px`,
        top: `${templatePosition.y - templateSizePx / 2}px`,
      }"
      @mousedown="onMouseDown"
    >
      <div class="center-marker"></div>
    </div>
  </div>
</template>

<style scoped>
.config-panel {
  margin-bottom: 1rem;
}

.config-panel__inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.battlefield {
  position: relative;
  width: 100%;
  max-width: 800px;
  place-items: center;
  border: 1px solid #ccc;
  padding: 1rem;
}

/* Regiment grid styles */
.regiment {
  display: grid;
  background-color: #333;
}

/* Base styles */
.base {
  background-color: #bbb;
  border: 1px solid #444;
  box-sizing: border-box;
}

.circular-template {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 0, 0, 0.3);
  border: 1px solid red;
  cursor: grab;
  pointer-events: auto;
}

.center-marker {
  width: 8px;
  height: 8px;
  background-color: red;
  border-radius: 50%;
  border: 1px solid #fff;
  top: 50%;
  position: relative;
  left: 50%;
  transform: translate(-50%, -50%);
}

.base {
  background-color: #bbb; /* Default: no impact */
  border: 1px solid #444;
  box-sizing: border-box;
}

.impact-total {
  background-color: rgba(255, 0, 0, 0.8); /* Red */
}

.impact-partial {
  background-color: rgba(255, 255, 0, 0.8); /* Yellow */
}

.template-selector {
  margin: 1rem 0;
}

.template-selector label {
  display: block;
  margin-bottom: 0.5rem;
}
</style>
