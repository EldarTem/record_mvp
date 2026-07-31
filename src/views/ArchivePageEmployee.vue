<template>
  <div class="page archive-page">
    <div v-if="sessionStore.isLoading" class="loading">Загрузка...</div>
    <div v-else>
      <div class="title">Архив записей</div>
      <div v-if="paginatedRecords.length">
        <div class="subtitle">Прошедшие и отменённые записи:</div>
        <RecordCard
          v-for="rec in paginatedRecords"
          :key="rec.id"
          :record="rec"
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
      <div class="subtitle" v-else>Архив пуст.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useSessionStore } from "@/store/useSessionStore";
import RecordCard from "@/components/Cards/RecordCardEmpl.vue";
import api from "@/services/api";

const sessionStore = useSessionStore();
const currentPage = ref(1);
const pageSize = ref(10);
const employeeProfileId = ref<number | null>(null);

const ARCHIVE_STATUSES = ["completed", "canceled"];
const filteredRecords = computed(() => {
  const arr = Array.isArray(sessionStore.sessions) ? sessionStore.sessions : [];
  return arr
    .filter((s) => ARCHIVE_STATUSES.includes(s.status))
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

async function loadSessions() {
  const { data } = await api.get<any[]>("/employees/me");
  const profiles = Array.isArray(data) ? data : [];
  employeeProfileId.value = profiles[0]?.id ?? null;
  if (employeeProfileId.value) {
    await sessionStore.fetchSessions({ employee_id: employeeProfileId.value });
  }
}

onMounted(async () => {
  await loadSessions();
});
</script>

<style scoped>
.page.archive-page {
  padding: 24px;
  background: #fff;
  border-radius: 10px;
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
