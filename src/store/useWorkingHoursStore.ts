import { defineStore } from 'pinia';
import { ref } from 'vue';
import { notifyError, notifySuccess } from '@/utils/notify';
import type {
  WorkingHour,
  WorkingHourSlot,
  CreateWorkingHourPayload,
  UpdateWorkingHourPayload,
} from '@/types';
import api from '@/services/api';
import { format } from 'date-fns';

function normalizeSlot(slot: any): WorkingHour {
  const starts = new Date(slot.starts_at);
  const ends = new Date(slot.ends_at);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    id: slot.id,
    employee_id: slot.employee_id,
    specific_date: slot.starts_at,
    start_time: `${pad(starts.getHours())}:${pad(starts.getMinutes())}:00`,
    end_time: `${pad(ends.getHours())}:${pad(ends.getMinutes())}:00`,
    status: slot.status,
  };
}

export const useWorkingHoursStore = defineStore('workingHours', () => {
  const workingHours = ref<WorkingHour[]>([]);
  const availableSlots = ref<WorkingHourSlot[]>([]);
  const isLoading = ref(false);

  async function fetchWorkingHours(employeeId?: number) {
    isLoading.value = true;
    try {
      const { data } = employeeId
        ? await api.get<any[]>(`/schedule-slots/employee/${employeeId}`)
        : await api.get<any[]>('/schedule-slots');
      workingHours.value = (Array.isArray(data) ? data : []).map(normalizeSlot);
    } catch (e) {
      notifyError('Ошибка загрузки расписания');
      workingHours.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchAvailableSlots(params: {
    employeeId: number;
    districtId: number;
    directionId: number;
  }) {
    isLoading.value = true;
    try {
      const { data } = await api.get<any[]>('/appointments/available-times', {
        params: {
          business_id: params.districtId,
          service_variant_id: params.directionId,
          employee_id: params.employeeId,
        },
      });

      availableSlots.value = (Array.isArray(data) ? data : []).map((slot) => {
        const starts = new Date(slot.starts_at);
        const ends = new Date(slot.ends_at);
        return {
          workingHourId: slot.work_interval_id,
          date: format(starts, 'yyyy-MM-dd'),
          startTime: format(starts, 'HH:mm'),
          endTime: format(ends, 'HH:mm'),
          startsAt: slot.starts_at,
          branchId: slot.branch_id ?? null,
        };
      });
    } catch (e: any) {
      notifyError(
        e.response?.data?.message || e.message || 'Ошибка загрузки доступных слотов'
      );
      availableSlots.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  async function createWorkingHour(payload: CreateWorkingHourPayload) {
    isLoading.value = true;
    try {
      const starts_at =
        payload.specific_date && payload.start_time
          ? new Date(`${payload.specific_date}T${payload.start_time}`).toISOString()
          : undefined;
      const ends_at =
        payload.specific_date && payload.end_time
          ? new Date(`${payload.specific_date}T${payload.end_time}`).toISOString()
          : undefined;

      if (!starts_at || !ends_at) {
        throw new Error('Нужны дата и время начала/конца');
      }

      const { data } = await api.post('/schedule-slots', {
        employee_id: payload.employee_id,
        starts_at,
        ends_at,
        status: 'available',
        source: 'manual',
      });
      workingHours.value.push(normalizeSlot(data));
      notifySuccess('Рабочее время добавлено');
    } catch (e: any) {
      notifyError(e.response?.data?.message || 'Ошибка при добавлении рабочего времени');
    } finally {
      isLoading.value = false;
    }
  }

  async function updateWorkingHour(
    id: number,
    payload: UpdateWorkingHourPayload
  ) {
    isLoading.value = true;
    try {
      const body: Record<string, unknown> = {};
      if (payload.specific_date && payload.start_time) {
        body.starts_at = new Date(
          `${payload.specific_date}T${payload.start_time}`
        ).toISOString();
      }
      if (payload.specific_date && payload.end_time) {
        body.ends_at = new Date(
          `${payload.specific_date}T${payload.end_time}`
        ).toISOString();
      }
      const { data } = await api.put(`/schedule-slots/${id}`, body);
      const idx = workingHours.value.findIndex((w) => w.id === id);
      if (idx !== -1) workingHours.value[idx] = normalizeSlot(data);
      notifySuccess('Рабочее время обновлено');
    } catch (e: any) {
      notifyError(e.response?.data?.message || 'Ошибка при обновлении рабочего времени');
    } finally {
      isLoading.value = false;
    }
  }

  async function removeWorkingHour(id: number) {
    isLoading.value = true;
    try {
      await api.delete(`/schedule-slots/${id}`);
      workingHours.value = workingHours.value.filter((w) => w.id !== id);
      notifySuccess('Рабочее время удалено');
    } catch (e: any) {
      notifyError(e.response?.data?.message || 'Ошибка при удалении рабочего времени');
    } finally {
      isLoading.value = false;
    }
  }

  function clearAvailableSlots() {
    availableSlots.value = [];
  }

  return {
    workingHours,
    availableSlots,
    isLoading,
    fetchWorkingHours,
    fetchAvailableSlots,
    createWorkingHour,
    updateWorkingHour,
    removeWorkingHour,
    clearAvailableSlots,
  };
});
