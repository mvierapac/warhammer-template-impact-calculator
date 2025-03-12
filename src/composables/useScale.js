import { ref, computed } from 'vue';

export function useScale() {
  // 🔸 Configurable inputs
  const baseSize = ref(20); // mm (base size of each model)
  const rows = ref(5);
  const columns = ref(5);

  // 🔸 Template size (diameter in mm)
  const templateSize = ref(75); // 3 inches template in mm

  // 🔸 Scale factor (pixels per mm)
  const scaleFactor = ref(4); // Example: 4 pixels represent 1mm

  // 🔸 Computed sizes in pixels
  const baseSizePx = computed(() => baseSize.value * scaleFactor.value);

  const regimentWidthPx = computed(() => columns.value * baseSizePx.value);
  const regimentHeightPx = computed(() => rows.value * baseSizePx.value);

  const templateSizePx = computed(() => templateSize.value * scaleFactor.value);

  // 🔸 Expose variables and computed values
  return {
    // Inputs
    baseSize,
    rows,
    columns,
    templateSize,
    scaleFactor,

    // Computed outputs
    baseSizePx,
    regimentWidthPx,
    regimentHeightPx,
    templateSizePx,
  };
}
