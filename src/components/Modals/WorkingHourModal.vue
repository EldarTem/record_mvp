<template>
  <el-dialog
    :model-value="visible"
    :width="dialogWidth"
    :show-close="true"
    :align-center="false"
    :title="form.id ? 'Редактирование окна' : 'Создание свободного окна'"
    class="working-hour-dialog"
    append-to-body
    @close="handleClose"
    @update:model-value="onVisibleChange"
  >
    <el-form :model="form" label-position="top" class="custom-form">
      <el-form-item label="Дата" class="custom-label">
        <el-date-picker
          v-model="form.date"
          type="date"
          format="DD/MM/YYYY"
          value-format="YYYY-MM-DD"
          placeholder="ДД/ММ/ГГГГ"
          class="custom-input"
          style="width: 100%"
          teleported
        />
      </el-form-item>
      <div class="row">
        <el-form-item label="Начало" class="custom-label time-item">
          <el-time-picker
            v-model="form.start_time"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="00:00"
            class="custom-input"
            style="width: 100%"
            teleported
          />
        </el-form-item>
        <el-form-item label="Конец" class="custom-label time-item">
          <el-time-picker
            v-model="form.end_time"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="00:00"
            class="custom-input"
            style="width: 100%"
            teleported
          />
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <div class="footer-row">
        <el-button
          v-if="form.id"
          class="cancel-btn"
          @click="handleDelete"
        >
          Удалить
        </el-button>
        <el-button v-else class="cancel-btn" @click="handleClose">
          Отменить
        </el-button>
        <el-button class="create-btn" type="primary" @click="saveHour">
          {{ form.id ? "Сохранить" : "Создать" }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { notifyError } from "@/utils/notify";

const props = defineProps<{
  visible: boolean;
  workingHour?: {
    id?: number;
    specific_date?: string;
    start_time?: string;
    end_time?: string;
  } | null;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "update:model-value", value: boolean): void;
  (
    e: "save",
    payload: {
      id?: number;
      date: string;
      start_time: string;
      end_time: string;
    }
  ): void;
  (e: "delete", id: number): void;
}>();

const form = reactive({
  id: 0,
  date: "",
  start_time: "",
  end_time: "",
});

const windowWidth = ref(
  typeof window !== "undefined" ? window.innerWidth : 1024
);
const isMobile = computed(() => windowWidth.value <= 768);
const dialogWidth = computed(() => (isMobile.value ? "92%" : "560px"));

const onResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener("resize", onResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
});

function resetForm() {
  form.id = 0;
  form.date = "";
  form.start_time = "";
  form.end_time = "";
}

function fillFromProps() {
  const hour = props.workingHour;
  if (hour && hour.id) {
    form.id = hour.id;
    form.date = hour.specific_date
      ? String(hour.specific_date).split("T")[0]
      : "";
    form.start_time = hour.start_time ? String(hour.start_time).slice(0, 5) : "";
    form.end_time = hour.end_time ? String(hour.end_time).slice(0, 5) : "";
  } else {
    resetForm();
  }
}

watch(
  () => [props.visible, props.workingHour] as const,
  ([visible]) => {
    if (visible) fillFromProps();
  },
  { deep: true }
);

function onVisibleChange(value: boolean) {
  emit("update:visible", value);
  emit("update:model-value", value);
  if (!value) resetForm();
}

function handleClose() {
  emit("update:visible", false);
  emit("update:model-value", false);
  resetForm();
}

function saveHour() {
  if (!form.date || !form.start_time || !form.end_time) {
    notifyError("Заполните все обязательные поля");
    return;
  }
  emit("save", {
    id: form.id || undefined,
    date: form.date,
    start_time: String(form.start_time).slice(0, 5),
    end_time: String(form.end_time).slice(0, 5),
  });
  handleClose();
}

function handleDelete() {
  if (!form.id) return;
  emit("delete", form.id);
  handleClose();
}
</script>

<style scoped>
.custom-form {
  width: 100%;
}

.custom-form :deep(.el-form-item) {
  width: 100%;
  margin-bottom: 16px;
}

.custom-form :deep(.el-date-editor),
.custom-form :deep(.el-time-picker),
.custom-form :deep(.el-input),
.custom-form :deep(.el-input__wrapper) {
  width: 100% !important;
}

.row {
  display: flex;
  gap: 16px;
  width: 100%;
}

.time-item {
  flex: 1 1 0;
  min-width: 0;
}

.footer-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.footer-row :deep(.el-button) {
  width: 100% !important;
  margin: 0 !important;
  height: 44px;
}

.cancel-btn {
  border: 1.5px solid #f14119 !important;
  color: #f14119 !important;
  background: #fff !important;
  font-size: 14px;
  border-radius: 8px !important;
  font-weight: 500;
}

.cancel-btn:hover {
  background: #fff2ef !important;
}

.create-btn {
  background: #ff552e !important;
  color: #fff !important;
  border-radius: 8px !important;
  font-size: 14px;
  font-weight: 500;
  border: none;
}

.create-btn:hover {
  background: #e84b28 !important;
}

@media (max-width: 768px) {
  .row {
    flex-direction: column;
    gap: 0;
  }
}

@media (min-width: 769px) {
  .footer-row {
    flex-direction: row;
  }

  .footer-row :deep(.el-button) {
    flex: 1 1 0;
  }
}
</style>

<style>
.working-hour-dialog.el-dialog {
  --el-dialog-margin-top: 12vh;
  width: min(560px, 92vw) !important;
  max-width: 92vw !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  margin-top: var(--el-dialog-margin-top) !important;
  margin-bottom: 24px !important;
  border-radius: 18px !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: visible !important;
}

.working-hour-dialog .el-dialog__header {
  flex: 0 0 auto !important;
  padding: 20px 20px 8px !important;
}

.working-hour-dialog .el-dialog__title {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.3;
}

.working-hour-dialog .el-dialog__body {
  flex: 0 0 auto !important;
  height: auto !important;
  max-height: none !important;
  padding: 8px 20px 4px !important;
  overflow: visible !important;
}

.working-hour-dialog .el-dialog__footer {
  flex: 0 0 auto !important;
  padding: 8px 20px 20px !important;
}

@media (max-width: 768px) {
  .working-hour-dialog.el-dialog {
    --el-dialog-margin-top: 8vh;
    width: 92vw !important;
  }

  .working-hour-dialog .el-dialog__title {
    font-size: 20px;
    padding-right: 28px;
  }
}
</style>
