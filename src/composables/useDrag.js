import { ref, onMounted, onUnmounted } from 'vue';

export function useDrag(battlefieldRef, updateRectsCallback) {
  const position = ref({ x: 50, y: 50 });
  let isDragging = false;
  let offset = { x: 0, y: 0 };
  const battlefieldRect = ref({ x: 0, y: 0 });

  const updateBattlefieldRect = () => {
    if (battlefieldRef.value) {
      battlefieldRect.value = battlefieldRef.value.getBoundingClientRect();
    }
  };

  const onMouseDown = (event) => {
    isDragging = true;
    updateBattlefieldRect();
    updateRectsCallback();

    const mouseX = event.clientX - battlefieldRect.value.x;
    const mouseY = event.clientY - battlefieldRect.value.y;

    offset.x = mouseX - position.value.x;
    offset.y = mouseY - position.value.y;

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (event) => {
    if (!isDragging) return;

    const mouseX = event.clientX - battlefieldRect.value.x;
    const mouseY = event.clientY - battlefieldRect.value.y;

    position.value.x = mouseX - offset.x;
    position.value.y = mouseY - offset.y;
  };

  const onMouseUp = () => {
    isDragging = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  onMounted(() => {
    window.addEventListener('resize', updateBattlefieldRect);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateBattlefieldRect);
  });

  return {
    position,
    onMouseDown,
  };
}
