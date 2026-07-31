<template>
  <div class="step">
    <ul class="options-list">
      <li
        v-for="dept in districtStore.districts"
        :key="dept.id"
        :class="['option-item', { selected: form.districtId === dept.id }]"
        @click="select(dept.id)"
      >
        <span><img :src="markerIcon" alt="" /></span>
        {{ dept.name }}
      </li>
      <li v-if="districtStore.isLoading">Загрузка бизнесов...</li>
      <li
        v-else-if="
          !districtStore.districts || districtStore.districts.length === 0
        "
      >
        Бизнесы не найдены
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useDistrictStore } from "@/store/useDistrictStore";
import type { WizardForm } from "@/types";
import markerIcon from "@/assets/icons/marker_logo.svg";

const props = defineProps<{ modelValue: WizardForm }>();
const emit = defineEmits<{
  (e: "update:modelValue", value: WizardForm): void;
}>();

const districtStore = useDistrictStore();
const form = ref<WizardForm>({ ...props.modelValue });

watch(
  () => props.modelValue,
  (newValue) => {
    form.value = { ...newValue };
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  districtStore.fetchDistricts();
});

function select(id: number) {
  form.value.districtId = id;
  form.value.categoryId = null;
  form.value.directionId = null;
  form.value.employeeId = null;
  form.value.workingHourId = null;
  form.value.startsAt = null;
  form.value.branchId = null;
  form.value.date = null;
  form.value.time = null;
  emit("update:modelValue", { ...form.value });
}
</script>

<style scoped>
.options-list {
  list-style: none;
  padding: 0;
}
.option-item {
  font-size: 20px;
  gap: 15px;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  color: #4d4e4f;
  background-color: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  border-color: #fff;
}
.option-item i {
  margin-right: 8px;
  color: #ff552e;
}
.option-item.selected {
  border-color: #ff552e;
  background: rgba(255, 85, 46, 0.1);
}

@media (max-width: 768px) {
  .option-item {
    font-size: 16px;
    gap: 10px;
    padding: 12px;
    margin-bottom: 12px;
  }
}
</style>
