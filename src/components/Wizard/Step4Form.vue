<template>
  <div class="step">
    <div v-if="workingHoursStore.isLoading">Загрузка доступных слотов...</div>
    <div v-else-if="workingHoursStore.availableSlots.length === 0">
      Нет доступных слотов
    </div>
    <div v-else v-for="date in uniqueDates" :key="date" class="date-block">
      <h3 class="date-title">{{ formatDate(date) }}</h3>
      <div class="times-list">
        <el-button
          v-for="slot in slotsByDate[date]"
          :key="`${slot.workingHourId}-${slot.startsAt || slot.startTime}`"
          :class="[
            'time-button',
            { selected: form.startsAt === slot.startsAt },
          ]"
          @click="selectSlot(slot)"
          plain
        >
          {{ slot.startTime }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useWorkingHoursStore } from "@/store/useWorkingHoursStore";
import { notifyError } from "@/utils/notify";
import type { WizardForm, WorkingHourSlot } from "@/types";

const props = defineProps<{ modelValue: WizardForm }>();
const emit = defineEmits<{
  (e: "update:modelValue", value: WizardForm): void;
}>();

const workingHoursStore = useWorkingHoursStore();
const form = ref<WizardForm>({ ...props.modelValue });

watch(
  () => props.modelValue,
  (newValue) => {
    form.value = { ...newValue };
  },
  { immediate: true, deep: true }
);

function loadSlots() {
  const { employeeId, districtId, directionId } = props.modelValue;
  if (employeeId && districtId && directionId) {
    workingHoursStore.fetchAvailableSlots({
      employeeId,
      districtId,
      directionId,
    });
  } else {
    notifyError("Выберите бизнес, услугу и сотрудника на предыдущих шагах");
  }
}

onMounted(loadSlots);

watch(
  () => [
    props.modelValue.employeeId,
    props.modelValue.districtId,
    props.modelValue.directionId,
  ],
  ([employeeId, districtId, directionId], oldVals) => {
    const [oldEmployeeId, oldDistrictId, oldDirectionId] = oldVals || [];
    if (
      employeeId !== oldEmployeeId ||
      districtId !== oldDistrictId ||
      directionId !== oldDirectionId
    ) {
      workingHoursStore.clearAvailableSlots();
      form.value.workingHourId = null;
      form.value.startsAt = null;
      form.value.branchId = null;
      form.value.date = null;
      form.value.time = null;
      emit("update:modelValue", { ...form.value });
      if (employeeId && districtId && directionId) {
        workingHoursStore.fetchAvailableSlots({
          employeeId: Number(employeeId),
          districtId: Number(districtId),
          directionId: Number(directionId),
        });
      }
    }
  }
);

const uniqueDates = computed(() =>
  [...new Set(workingHoursStore.availableSlots.map((slot) => slot.date))].sort()
);

const slotsByDate = computed(() =>
  workingHoursStore.availableSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, WorkingHourSlot[]>)
);

function selectSlot(slot: WorkingHourSlot) {
  form.value.workingHourId = slot.workingHourId;
  form.value.date = slot.date;
  form.value.time = slot.startTime;
  form.value.startsAt = slot.startsAt || null;
  form.value.branchId = slot.branchId ?? null;
  emit("update:modelValue", { ...form.value });
}

function formatDate(date: string): string {
  try {
    return format(new Date(date), "d MMMM yyyy", { locale: ru });
  } catch {
    return date;
  }
}
</script>

<style scoped>
.date-block {
  margin-bottom: 16px;
}
.date-title {
  margin-bottom: 8px;
  font-weight: 600;
}
.times-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.time-button {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 20px;
  padding: 18px 34px;
  color: #4d4e4f;
  background-color: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  border-color: #fff;
}
.time-button:hover {
  background: #ff552e;
  color: #fff;
  border-color: #ff552e;
}
.time-button.selected {
  background: #ff552e;
  color: #fff;
  border-color: #ff552e;
}
.el-button + .el-button {
  margin-left: 0px !important;
}

@media (max-width: 768px) {
  .date-title {
    font-size: 16px;
  }

  .time-button {
    font-size: 14px;
    padding: 12px 14px;
  }
}
</style>
