<template>
  <div class="page">
    <div class="profile-header">
      <div>
        <div class="title">Ваш график</div>
        <div class="subtitle">Создайте рабочие часы.</div>
      </div>
      <div class="profile-actions">
        <el-button
          type="primary"
          size="large"
          class="btn-save"
          @click="openForm"
        >
          Создать
        </el-button>
      </div>
    </div>
    <div v-if="workingHoursStore.isLoading">Загрузка...</div>
    <el-empty
      v-else-if="!groupedWorkingHours.length"
      description="График пуст"
    />
    <div v-for="(workingHour, index) in groupedWorkingHours" :key="index">
      <DayTimeBlock
        :day="workingHour.day"
        :date="workingHour.date"
        :slots="workingHour.slots"
        @edit="editDay(workingHour)"
      />
    </div>
    <WorkingHourModal
      :visible="showForm"
      :working-hour="currentHour"
      @save="saveHour"
      @delete="deleteSlot"
      @update:visible="showForm = $event"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from "vue";
import { useWorkingHoursStore } from "@/store/useWorkingHoursStore";
import WorkingHourModal from "@/components/Modals/WorkingHourModal.vue";
import DayTimeBlock from "@/components/DayTimeBlock.vue";
import api from "@/services/api";

interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
}

interface GroupedWorkingHour {
  day: string;
  date: string;
  slots: TimeSlot[];
}

export default defineComponent({
  name: "EmployeeScheduleView",
  components: { WorkingHourModal, DayTimeBlock },
  setup() {
    const workingHoursStore = useWorkingHoursStore();
    const employeeProfileId = ref<number | null>(null);

    const dayMapping: Record<string, string> = {
      Monday: "ПН",
      Tuesday: "ВТ",
      Wednesday: "СР",
      Thursday: "ЧТ",
      Friday: "ПТ",
      Saturday: "СБ",
      Sunday: "ВС",
    };

    const workingHours = computed(() => {
      const hours = workingHoursStore.workingHours || [];
      return hours.map((hour) => ({
        ...hour,
        day_of_week: hour.day_of_week
          ? dayMapping[hour.day_of_week] || hour.day_of_week
          : "",
        specific_date: hour.specific_date
          ? new Date(hour.specific_date).toISOString().split("T")[0]
          : "",
      }));
    });

    const groupedWorkingHours = computed((): GroupedWorkingHour[] => {
      const grouped: Record<string, GroupedWorkingHour> = {};

      workingHours.value.forEach((hour) => {
        const key = hour.specific_date || hour.day_of_week || "unknown";
        if (!grouped[key]) {
          grouped[key] = {
            day: hour.day_of_week || "",
            date: hour.specific_date || "",
            slots: [],
          };
        }
        const slot: TimeSlot = {
          id: hour.id,
          start_time: hour.start_time.slice(0, 5),
          end_time: hour.end_time.slice(0, 5),
        };
        grouped[key].slots.push(slot);
      });

      return Object.values(grouped).sort((a, b) => {
        const dateA = a.date || a.day;
        const dateB = b.date || b.day;
        return dateA.localeCompare(dateB);
      });
    });

    const showForm = ref(false);
    const currentHour = reactive({
      id: 0,
      employee_id: 0,
      day_of_week: "",
      specific_date: "",
      start_time: "",
      end_time: "",
    });

    const resolveEmployeeProfile = async () => {
      const { data } = await api.get<any[]>("/employees/me");
      const profiles = Array.isArray(data) ? data : [];
      employeeProfileId.value = profiles[0]?.id ?? null;
      currentHour.employee_id = employeeProfileId.value || 0;
    };

    const fetchWorkingHours = async () => {
      if (!employeeProfileId.value) {
        await resolveEmployeeProfile();
      }
      if (employeeProfileId.value) {
        await workingHoursStore.fetchWorkingHours(employeeProfileId.value);
      }
    };

    const openForm = () => {
      currentHour.id = 0;
      currentHour.employee_id = employeeProfileId.value || 0;
      currentHour.day_of_week = "";
      currentHour.specific_date = "";
      currentHour.start_time = "";
      currentHour.end_time = "";
      showForm.value = true;
    };

    const editDay = (workingHour: GroupedWorkingHour) => {
      const slotTime = workingHour.slots[0]?.start_time?.slice(0, 5);
      const hourToEdit = workingHours.value.find(
        (h) =>
          h.specific_date === workingHour.date &&
          h.start_time.slice(0, 5) === slotTime
      );
      if (hourToEdit) {
        Object.assign(currentHour, {
          id: hourToEdit.id,
          employee_id: hourToEdit.employee_id,
          day_of_week: hourToEdit.day_of_week || "",
          specific_date: hourToEdit.specific_date || "",
          start_time: hourToEdit.start_time.slice(0, 5),
          end_time: hourToEdit.end_time.slice(0, 5),
        });
        showForm.value = true;
      }
    };

    const deleteSlot = async (slotId: number) => {
      if (!slotId) return;
      await workingHoursStore.removeWorkingHour(slotId);
      await fetchWorkingHours();
    };

    const saveHour = async (updatedHour: any) => {
      const payload: any = {
        employee_id: employeeProfileId.value || currentHour.employee_id,
        specific_date: updatedHour.date || null,
        start_time: updatedHour.start_time,
        end_time: updatedHour.end_time,
      };

      if (updatedHour.id) {
        await workingHoursStore.updateWorkingHour(updatedHour.id, payload);
      } else {
        await workingHoursStore.createWorkingHour(payload);
      }
      showForm.value = false;
      await fetchWorkingHours();
    };

    onMounted(() => {
      fetchWorkingHours();
    });

    return {
      workingHours,
      groupedWorkingHours,
      showForm,
      currentHour,
      openForm,
      editDay,
      deleteSlot,
      saveHour,
      workingHoursStore,
    };
  },
});
</script>

<style scoped>
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 16px;
}
.profile-actions {
  display: flex;
  gap: 12px;
}
.btn-save {
  background: #ff5227;
  color: #fff;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  padding: 10px 26px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    margin-bottom: 20px;
  }

  .profile-actions,
  .btn-save {
    width: 100%;
  }
}
</style>
