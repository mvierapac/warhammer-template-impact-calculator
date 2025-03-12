import { ref, computed } from 'vue';

export function useScale() {
  // Configurable inputs
  const baseSize = ref(20); // mm (base size of each model)
  const rows = ref(5);
  const columns = ref(5);

  const templateSize = ref(75);

  // Scale factor (pixels per mm)
  const scaleFactor = ref(4);

  // Computed sizes in pixels
  const baseSizePx = computed(() => baseSize.value * scaleFactor.value);

  const regimentWidthPx = computed(() => columns.value * baseSizePx.value);
  const regimentHeightPx = computed(() => rows.value * baseSizePx.value);

  const templateSizePx = computed(() => templateSize.value * scaleFactor.value);

  return {
    baseSize,
    rows,
    columns,
    templateSize,
    scaleFactor,
    baseSizePx,
    regimentWidthPx,
    regimentHeightPx,
    templateSizePx,
  };
}
