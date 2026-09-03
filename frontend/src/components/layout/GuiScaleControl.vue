<template>
  <div class="scale-modal-overlay" @click.self="$emit('close')">
    <div class="scale-modal-card">
      <div class="modal-header">
        <h3 class="modal-title">GUI 界面缩放控制</h3>
        <button class="modal-close-btn" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <div class="presets-row">
          <button
            v-for="preset in presets"
            :key="preset.id"
            class="preset-btn"
            :class="{ active: modelValue === preset.size }"
            @click="applySize(preset.size)"
          >
            <span class="preset-label">{{ preset.label }}</span>
            <span class="preset-sub">{{ preset.size }}px</span>
          </button>
        </div>

        <div class="slider-group">
          <div class="slider-label-row">
            <span>细致微调</span>
            <span class="slider-val">{{ modelValue }}px</span>
          </div>
          <input
            type="range"
            min="32"
            max="64"
            step="2"
            :value="modelValue"
            class="scale-range-slider"
            @input="applySize(Number(($event.target as HTMLInputElement).value))"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: number;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", size: number): void;
  (e: "close"): void;
}>();

const presets = [
  { id: "compact", label: "紧凑", size: 36 },
  { id: "normal", label: "标准", size: 44 },
  { id: "large", label: "大号", size: 54 }
];

function applySize(size: number) {
  emit("update:modelValue", size);
  try {
    localStorage.setItem("neonei:guiScale", String(size));
  } catch (ignored) {}
}
</script>

<style scoped>
.scale-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.scale-modal-card {
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 8px;
  width: 340px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #0D1117;
  border-bottom: 1px solid #21262D;
}

.modal-title {
  font-size: 13px;
  font-weight: 700;
  color: #F0F6FC;
  margin: 0;
}

.modal-close-btn {
  background: none;
  border: none;
  color: #8B949E;
  font-size: 18px;
  cursor: pointer;
}

.modal-close-btn:hover {
  color: #F0F6FC;
}

.modal-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.presets-row {
  display: flex;
  gap: 8px;
}

.preset-btn {
  flex: 1;
  background: #0D1117;
  border: 1px solid #30363D;
  border-radius: 6px;
  padding: 8px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preset-btn:hover {
  border-color: #58A6FF;
  background: #161B22;
}

.preset-btn.active {
  border-color: #2EA043;
  background: #238636;
}

.preset-btn.active .preset-label,
.preset-btn.active .preset-sub {
  color: #FFFFFF;
}

.preset-label {
  font-size: 12px;
  font-weight: 600;
  color: #C9D1D9;
}

.preset-sub {
  font-size: 10px;
  color: #8B949E;
}

.slider-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.slider-label-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #8B949E;
}

.slider-val {
  color: #58A6FF;
  font-family: monospace;
  font-weight: 700;
}

.scale-range-slider {
  width: 100%;
  accent-color: #58A6FF;
  cursor: pointer;
}
</style>
