<script setup>
import { ref, watch, onMounted, computed, nextTick } from 'vue';

import { useScale } from '@composables/useScale.js';
import { useDrag } from '@composables/useDrag.js';
import { useImpactCalculator } from '@composables/useImpactCalculator.js';

// System scales
const {
  baseSize,
  rows,
  columns,
  baseSizePx,
  regimentWidthPx,
  regimentHeightPx,
  templateSizePx,
  templateSize,
  scaleFactor,
} = useScale();

const templates = [
  { name: 'Small Template', size: 75 },
  { name: 'Large Template', size: 125 },
];

// Refs
const battlefieldRef = ref(null);
const battlefieldRect = ref({ x: 0, y: 0 });

const regimentRef = ref(null);
const regimentRect = ref({ x: 0, y: 0 });

// rects updates
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

onMounted(async () => {
  await nextTick();
  handleResize();
  updateBattlefieldRect();
  updateRegimentRect();

  window.addEventListener('resize', handleResize);
  window.addEventListener('resize', async () => {
    await nextTick();
    updateBattlefieldRect();
    updateRegimentRect();
  });
});

const handleResize = () => {
  const screenWidth = window.innerWidth;

  if (screenWidth <= 600) {
    scaleFactor.value = 2.5;
  } else if (screenWidth <= 900) {
    scaleFactor.value = 3;
  } else {
    scaleFactor.value = 4;
  }
};

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
const {
  position: templatePosition,
  onMouseDown,
  onTouchStart,
} = useDrag(battlefieldRef, updateRegimentRect);

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

const baseSizes = [20, 25];

const validateRows = () => {
  if (rows.value < 1) rows.value = 1;
  if (rows.value > 8) rows.value = 8;
};

const validateColumns = () => {
  if (columns.value < 1) columns.value = 1;
  if (columns.value > 7) columns.value = 7;
};
</script>

<template>
  <div class="config-panel">
    <h2>Regiment Configuration</h2>
    <div class="config-panel__inputs">
      <div class="input-row">
        <label>
          Base size (mm):
          <select v-model="baseSize">
            <option v-for="size in baseSizes" :key="size" :value="size">{{ size }} mm</option>
          </select>
        </label>
      </div>

      <div class="input-row">
        <label>
          Rows:
          <input type="number" v-model.number="rows" min="1" max="8" @change="validateRows" />
        </label>

        <label>
          Columns:
          <input type="number" v-model.number="columns" min="1" max="7" @change="validateColumns" />
        </label>
      </div>
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
      @touchstart.prevent="onTouchStart"
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
  flex-direction: column;
  gap: 1rem;
}

.input-row {
  display: flex;
  gap: 1rem;
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
  background-color: rgba(255, 0, 0, 0.8);
}

.impact-partial {
  background-color: rgba(255, 255, 0, 0.8);
}

.template-selector {
  margin: 1rem 0;
}

.template-selector label {
  display: block;
  max-width: fit-content;
  margin-bottom: 0.5rem;
}
</style>
