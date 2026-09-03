<template>
  <div class="bottom-search-wrapper">
    <div class="search-inner-box">
      <input
        ref="inputRef"
        v-model="modelValue"
        type="text"
        class="nei-search-input"
        placeholder="搜索物品、拼音(jcdl)、模组(@gregtech)或矿词($circuit)..."
        @contextmenu.prevent="clearSearch"
      />
      <button
        v-if="modelValue"
        class="clear-text-btn"
        @click="clearSearch"
        title="清空 (或在输入框点击右键)"
      >
        &times;
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const modelValue = defineModel<string>({ default: "" });

const inputRef = ref<HTMLInputElement | null>(null);

function clearSearch() {
  modelValue.value = "";
  inputRef.value?.focus();
}

function focus() {
  inputRef.value?.focus();
  inputRef.value?.select();
}

defineExpose({
  focus,
  clearSearch
});
</script>

<style scoped>
.bottom-search-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 6px 16px;
  box-sizing: border-box;
  background: #090B0E;
  border-top: 1px solid #21262D;
  position: relative;
  z-index: 40;
}

.search-inner-box {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 480px;
  position: relative;
}

.nei-search-input {
  width: 100%;
  background: #0D1117;
  border: 1px solid #30363D;
  border-radius: 6px;
  color: #F0F6FC;
  font-size: 13px;
  padding: 6px 32px 6px 12px;
  outline: none;
  box-sizing: border-box;
  transition: all 0.15s ease;
}

.nei-search-input:focus {
  border-color: #58A6FF;
  box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.2);
  background: #161B22;
}

.nei-search-input::placeholder {
  color: #484F58;
  font-size: 12px;
}

.clear-text-btn {
  position: absolute;
  right: 8px;
  background: transparent;
  border: none;
  color: #8B949E;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.clear-text-btn:hover {
  color: #F0F6FC;
}
</style>
