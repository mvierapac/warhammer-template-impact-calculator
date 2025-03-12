<script setup>
import { useScale } from '@composables/useScale.js';
import { ref, computed, onMounted } from 'vue';

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

// Array of bases with their positions
const bases = computed(() => {
  const arr = [];
  for (let row = 0; row < rows.value; row++) {
    for (let col = 0; col < columns.value; col++) {
      const x = col * baseSizePx.value + baseSizePx.value / 2;
      const y = row * baseSizePx.value + baseSizePx.value / 2;
      arr.push({ x, y, row, col });
    }
  }
  return arr;
});

const calculateImpacts = () => {
  const centerX = templatePosition.value.x;
  const centerY = templatePosition.value.y;
  const radius = templateSizePx.value / 2;

  const impactedBases = [];

  bases.value.forEach((base) => {
    const halfBase = baseSizePx.value / 2;

    // Get corner coordinates
    const corners = [
      { x: base.x - halfBase, y: base.y - halfBase }, // top-left
      { x: base.x + halfBase, y: base.y - halfBase }, // top-right
      { x: base.x - halfBase, y: base.y + halfBase }, // bottom-left
      { x: base.x + halfBase, y: base.y + halfBase }, // bottom-right
    ];

    // Check how many corners are inside the template circle
    const cornersInside = corners.filter((corner) => {
      const dx = centerX - corner.x;
      const dy = centerY - corner.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= radius;
    }).length;

    let impactType = 'none';

    if (cornersInside === 4) {
      impactType = 'total'; // All corners inside
    } else if (cornersInside > 0) {
      impactType = 'partial'; // Some corners inside
    }

    impactedBases.push({
      ...base,
      impactType,
    });
  });

  return impactedBases;
};

const impactedBases = computed(() => calculateImpacts());

const impactSummary = computed(() => {
  const totals = impactedBases.value.filter((b) => b.impactType === 'total').length;
  const partials = impactedBases.value.filter((b) => b.impactType === 'partial').length;
  return {
    totals,
    partials,
  };
});
// Template position in px (initially centered over the regiment)
const templatePosition = ref({
  x: 50, // arbitrary initial position
  y: 50,
});

let isDragging = false;
let offset = { x: 0, y: 0 };

// Start dragging when mousedown on the template
const onMouseDown = (event) => {
  isDragging = true;
  offset.x = event.clientX - templatePosition.value.x;
  offset.y = event.clientY - templatePosition.value.y;

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
};

const onMouseMove = (event) => {
  if (!isDragging) return;

  templatePosition.value.x = event.clientX - offset.x;
  templatePosition.value.y = event.clientY - offset.y;
};

const onMouseUp = () => {
  isDragging = false;

  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
};
</script>

<template>
  <div class="config-panel">
    <h2>Regiment Configuration</h2>

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

    <!-- <div>
      <p>Base size: {{ baseSizePx }} px</p>
      <p>Regiment width: {{ regimentWidthPx }} px</p>
      <p>Regiment height: {{ regimentHeightPx }} px</p>
      <p>Template diameter: {{ templateSizePx }} px</p>
    </div> -->
    <section class="impact-results">
      <p>Total hits: {{ impactSummary.totals }}</p>
      <p>Partial hits: {{ impactSummary.partials }}</p>
    </section>
  </div>
  <div ref="battlefieldRef" class="battlefield">
    <!-- Regiment grid -->
    <div
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
</style>
