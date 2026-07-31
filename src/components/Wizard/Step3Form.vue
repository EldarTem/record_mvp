<template>
  <div class="step">
    <el-form label-position="top">
      <el-form-item label="Сотрудник">
        <el-select
          v-model="form.employeeId"
          placeholder="Выберите сотрудника"
          :loading="isLoading"
        >
          <el-option
            v-for="employee in employees"
            :key="employee.id"
            :label="employee.name"
            :value="employee.id"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <ul class="options-list" v-if="employees.length">
      <li
        v-for="employee in employees"
        :key="employee.id"
        :class="[
          'option-item',
          { selected: form.employeeId === employee.id },
        ]"
        @click="selectEmployee(employee.id)"
      >
        <span><img :src="peopleIcon" alt="" /></span>
        {{ employee.name }}
        <span v-if="employee.position" class="no-details">{{
          employee.position
        }}</span>
      </li>
    </ul>
    <div v-else-if="isLoading">Загрузка сотрудников...</div>
    <div v-else-if="!form.districtId || !form.directionId">
      Выберите бизнес и услугу на предыдущих шагах
    </div>
    <div v-else>Сотрудники не найдены</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import api from "@/services/api";
import { notifyError } from "@/utils/notify";
import type { WizardForm } from "@/types";
import peopleIcon from "@/assets/icons/people_icon.svg";

interface AvailableEmployee {
  id: number;
  name: string;
  email?: string;
  position?: string;
  branch_id?: number | null;
}

const props = defineProps<{ modelValue: WizardForm }>();
const emit = defineEmits<{
  (e: "update:modelValue", value: WizardForm): void;
}>();

const form = ref<WizardForm>({ ...props.modelValue });
const employees = ref<AvailableEmployee[]>([]);
const isLoading = ref(false);

async function loadEmployees(businessId: number, variantId: number) {
  isLoading.value = true;
  try {
    const { data } = await api.get<AvailableEmployee[]>(
      "/appointments/available-employees",
      {
        params: {
          business_id: businessId,
          service_variant_id: variantId,
        },
      }
    );
    employees.value = Array.isArray(data) ? data : [];
  } catch (e: any) {
    employees.value = [];
    notifyError(e.response?.data?.message || "Ошибка загрузки сотрудников");
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  if (props.modelValue.districtId && props.modelValue.directionId) {
    loadEmployees(props.modelValue.districtId, props.modelValue.directionId);
  }
});

watch(
  () => props.modelValue,
  (newValue) => {
    const prevBusiness = form.value.districtId;
    const prevVariant = form.value.directionId;
    form.value = { ...newValue };
    if (
      newValue.districtId &&
      newValue.directionId &&
      (newValue.districtId !== prevBusiness ||
        newValue.directionId !== prevVariant)
    ) {
      form.value.employeeId = null;
      emit("update:modelValue", { ...form.value });
      loadEmployees(newValue.districtId, newValue.directionId);
    }
  },
  { deep: true }
);

function selectEmployee(employeeId: number) {
  form.value.employeeId = employeeId;
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
.option-item.selected {
  border-color: #ff552e;
  background: rgba(255, 85, 46, 0.1);
}
.no-details {
  font-size: 0.9em;
  color: #909399;
  margin-left: 8px;
}

@media (max-width: 768px) {
  .option-item {
    font-size: 16px;
    gap: 10px;
    padding: 12px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .no-details {
    width: 100%;
    margin-left: 0;
    margin-top: 4px;
  }
}
</style>
