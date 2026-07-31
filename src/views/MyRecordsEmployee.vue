<template>
  <div class="page">
    <div v-if="sessionStore.isLoading" class="loading">Загрузка...</div>
    <div v-else>
      <div class="title">
        Добро пожаловать, <span>{{ userName }}</span
        >!
      </div>
      <div v-if="paginatedRecords.length">
        <div class="subtitle">Ваши ближайшие записи:</div>
        <RecordCard
          v-for="rec in paginatedRecords"
          :key="rec.id"
          :record="rec"
          @cancel="handleCancel"
        />

        <div class="pagination-controls">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[5, 10, 20]"
            :total="filteredRecords.length"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
      <div class="subtitle" v-else>У вас нет текущих записей.</div>
    </div>
  </div>
  <ConfirmModal
    v-model="showCancelDialog"
    :message="'Вы уверены, что хотите отменить запись?'"
    :loading="cancelLoading"
    @confirm="confirmCancel"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useSessionStore } from "@/store/useSessionStore";
import RecordCard from "@/components/Cards/RecordCardEmpl.vue";
import ConfirmModal from "@/components/Modals/ConfirmModal.vue";
import api from "@/services/api";

const userName = ref("Пользователь");
const sessionStore = useSessionStore();
const employeeProfileId = ref<number | null>(null);

const currentPage = ref(1);
const pageSize = ref(10);

const ACTIVE_STATUSES = ["booked"];
const showCancelDialog = ref(false);
const cancelLoading = ref(false);
const cancelId = ref<number | null>(null);

const filteredRecords = computed(() => {
  const arr = Array.isArray(sessionStore.sessions) ? sessionStore.sessions : [];
  return arr
    .filter((s) => ACTIVE_STATUSES.includes(s.status))
    .map((s) => ({
      id: s.id,
      title: s.direction_name || "Без услуги",
      with: s.client_name || "Клиент",
      address: s.address || "Не указано",
      time:
        s.specific_date && s.start_time
          ? `${String(s.specific_date).split("T")[0]}T${s.start_time}`
          : s.specific_date || "",
      status: mapStatusRu(s.status),
      day_of_week: s.day_of_week || "",
    }));
});

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredRecords.value.slice(start, start + pageSize.value);
});

function mapStatusRu(status: string) {
  switch (status) {
    case "booked":
      return "скоро";
    case "completed":
      return "завершена";
    case "canceled":
      return "отменена";
    default:
      return status;
  }
}

function handleSizeChange(val: number) {
  pageSize.value = val;
  currentPage.value = 1;
}

function handleCurrentChange(val: number) {
  currentPage.value = val;
}

function handleCancel(id: number) {
  cancelId.value = id;
  showCancelDialog.value = true;
}

async function confirmCancel() {
  if (!cancelId.value) return;
  cancelLoading.value = true;
  try {
    await sessionStore.cancelSession(cancelId.value);
    await loadSessions();
  } finally {
    cancelLoading.value = false;
    showCancelDialog.value = false;
    cancelId.value = null;
  }
}

async function resolveEmployeeProfile() {
  const { data } = await api.get<any[]>("/employees/me");
  const profiles = Array.isArray(data) ? data : [];
  employeeProfileId.value = profiles[0]?.id ?? null;
}

async function loadSessions() {
  if (!employeeProfileId.value) {
    await resolveEmployeeProfile();
  }
  if (employeeProfileId.value) {
    await sessionStore.fetchSessions({ employee_id: employeeProfileId.value });
  }
}

onMounted(async () => {
  const stored = localStorage.getItem("userData");
  if (stored) {
    try {
      const userData = JSON.parse(stored);
      userName.value = userData.name || "Пользователь";
    } catch {
      userName.value = "Пользователь";
    }
  }
  await loadSessions();
});
</script>

<style scoped>
.page {
  padding: 20px;
}

.loading {
  text-align: center;
  font-size: 18px;
}
.pagination-controls {
  margin-top: 20px;
  text-align: center;
}
</style>
