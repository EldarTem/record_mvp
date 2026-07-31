import { defineStore } from 'pinia';
import { ref } from 'vue';
import { notifyError, notifySuccess } from '@/utils/notify';
import type { Session, CreateSessionPayload, UpdateSessionPayload } from '@/types';
import api from '@/services/api';

const STATUS_MAP: Record<string, Session['status']> = {
  pending: 'booked',
  confirmed: 'booked',
  in_progress: 'booked',
  completed: 'completed',
  canceled: 'canceled',
  no_show: 'canceled',
};

function normalizeAppointment(a: any): Session {
  const starts = a.starts_at ? new Date(a.starts_at) : null;
  const ends = a.ends_at ? new Date(a.ends_at) : null;
  const pad = (n: number) => String(n).padStart(2, '0');
  const timeOf = (d: Date | null) =>
    d ? `${pad(d.getHours())}:${pad(d.getMinutes())}:00` : '';

  return {
    id: a.id,
    working_hour_id: a.schedule_slot_id ?? 0,
    status: STATUS_MAP[a.status] ?? 'booked',
    specific_date: a.starts_at ?? '',
    day_of_week: starts
      ? starts.toLocaleDateString('ru-RU', { weekday: 'long' })
      : '',
    start_time: timeOf(starts),
    end_time: timeOf(ends),
    direction_name:
      [a.service_name, a.service_variant_name].filter(Boolean).join(' — ') ||
      'Услуга',
    doctor: {
      id: a.employee_id,
      name: a.employee_name || 'Сотрудник',
    },
    client_name: a.client_name || a.registered_client_name || '',
    address: a.branch_address || a.address || '',
  };
}

export const useSessionStore = defineStore('session', () => {
  const sessions = ref<Session[]>([]);
  const isLoading = ref(false);

  async function fetchSessions(params?: {
    business_id?: number;
    employee_id?: number;
  }) {
    isLoading.value = true;
    try {
      const { data } = await api.get<any[]>('/appointments', { params });
      sessions.value = (Array.isArray(data) ? data : []).map(normalizeAppointment);
    } catch (e: any) {
      notifyError(e.response?.data?.message || 'Ошибка загрузки записей');
      sessions.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  async function createSession(payload: CreateSessionPayload) {
    isLoading.value = true;
    try {
      const body = {
        service_variant_id: payload.direction_id,
        employee_id: payload.employee_id,
        starts_at: payload.starts_at,
        branch_id: payload.branch_id ?? undefined,
        client_id: payload.client_id,
        comment: payload.comments,
      };
      const { data } = await api.post('/appointments', body);
      sessions.value.push(normalizeAppointment(data));
      notifySuccess('Запись создана');
    } catch (e: any) {
      notifyError(
        e.response?.data?.message ||
          e.response?.data?.details?.[0] ||
          'Ошибка при создании записи'
      );
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateSession(id: number, payload: UpdateSessionPayload) {
    isLoading.value = true;
    try {
      if (payload.status) {
        await api.patch(`/appointments/${id}/status`, {
          status: payload.status,
          cancel_reason: payload.comments,
        });
      }
      await fetchSessions();
      notifySuccess('Запись обновлена');
    } catch (e: any) {
      notifyError(e.response?.data?.message || 'Ошибка при обновлении записи');
    } finally {
      isLoading.value = false;
    }
  }

  async function cancelSession(id: number) {
    isLoading.value = true;
    try {
      await api.patch(`/appointments/${id}/cancel`);
      const idx = sessions.value.findIndex((s) => s.id === id);
      if (idx !== -1) sessions.value[idx].status = 'canceled';
      notifySuccess('Запись отменена');
    } catch (e: any) {
      notifyError(e.response?.data?.message || 'Ошибка при отмене записи');
    } finally {
      isLoading.value = false;
    }
  }

  return {
    sessions,
    isLoading,
    fetchSessions,
    createSession,
    updateSession,
    cancelSession,
  };
});
