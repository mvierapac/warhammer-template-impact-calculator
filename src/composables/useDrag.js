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

  const startDrag = (clientX, clientY) => {
    isDragging = true;
    updateBattlefieldRect();
    updateRectsCallback();

    const mouseX = clientX - battlefieldRect.value.x;
    const mouseY = clientY - battlefieldRect.value.y;

    offset.x = mouseX - position.value.x;
    offset.y = mouseY - position.value.y;

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  };

  const onMouseDown = (event) => {
    event.preventDefault(); // prevent text selection
    startDrag(event.clientX, event.clientY);
  };

  const onTouchStart = (event) => {
    const touch = event.touches[0];
    startDrag(touch.clientX, touch.clientY);
  };

  const onMouseMove = (event) => {
    if (!isDragging) return;

    const mouseX = event.clientX - battlefieldRect.value.x;
    const mouseY = event.clientY - battlefieldRect.value.y;

    position.value.x = mouseX - offset.x;
    position.value.y = mouseY - offset.y;
  };

  const onTouchMove = (event) => {
    if (!isDragging) return;

    const touch = event.touches[0];
    const touchX = touch.clientX - battlefieldRect.value.x;
    const touchY = touch.clientY - battlefieldRect.value.y;

    position.value.x = touchX - offset.x;
    position.value.y = touchY - offset.y;
  };

  const endDrag = () => {
    isDragging = false;

    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);

    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
  };

  const onMouseUp = () => {
    endDrag();
  };

  const onTouchEnd = () => {
    endDrag();
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
    onTouchStart,
  };
}
