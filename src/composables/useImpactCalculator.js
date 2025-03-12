import { computed } from 'vue';

export function useImpactCalculator(bases, templatePosition, templateSizePx, baseSizePx) {
  const calculateImpacts = () => {
    const centerX = templatePosition.value.x;
    const centerY = templatePosition.value.y;
    const radius = templateSizePx.value / 2;

    const impactedBases = [];

    bases.value.forEach((base) => {
      const halfBase = baseSizePx.value / 2;

      const corners = [
        { x: base.x - halfBase, y: base.y - halfBase },
        { x: base.x + halfBase, y: base.y - halfBase },
        { x: base.x - halfBase, y: base.y + halfBase },
        { x: base.x + halfBase, y: base.y + halfBase },
      ];

      const cornersInside = corners.filter((corner) => {
        const dx = centerX - corner.x;
        const dy = centerY - corner.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= radius;
      }).length;

      let impactType = 'none';

      if (cornersInside === 4) {
        impactType = 'total';
      } else if (cornersInside > 0) {
        impactType = 'partial';
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

  return {
    impactedBases,
    impactSummary,
  };
}
