import { defineStore } from 'pinia';
import { ref } from 'vue';
import { notifyError, notifySuccess } from '@/utils/notify';
import type {
  EmployeeDetails,
  CreateEmployeeDetailsPayload,
  UpdateEmployeeDetailsPayload,
} from '@/types';
import api from '@/services/api';

function normalizeEmployee(e: any): EmployeeDetails {
  return {
    id: e.id,
    fullName: e.fullName || e.name || '',
    position: e.position || '',
    email: e.email || '',
    phone: e.phone,
    isActive: e.is_active ?? e.isActive ?? true,
  };
}

export const useEmployeeDetailsStore = defineStore('employeeDetails', () => {
  const employees = ref<EmployeeDetails[]>([]);
  const isLoading = ref(false);

  async function fetchEmployees(params?: {
    business_id?: number;
    branch_id?: number;
  }) {
    isLoading.value = true;
    try {
      const { data } = await api.get<any[]>('/employees', { params });
      employees.value = (Array.isArray(data) ? data : []).map(normalizeEmployee);
    } catch (e: any) {
      notifyError(e.response?.data?.message || 'Ошибка загрузки сотрудников');
    } finally {
      isLoading.value = false;
    }
  }

  async function createEmployee(
    payload: CreateEmployeeDetailsPayload & {
      business_id?: number;
      user_id?: number;
      branch_id?: number;
      bio?: string;
    }
  ) {
    isLoading.value = true;
    try {
      const { data } = await api.post('/employees', {
        business_id: payload.business_id,
        user_id: payload.user_id,
        branch_id: payload.branch_id,
        position: payload.position,
        bio: payload.bio,
        is_active: payload.isActive ?? true,
      });
      employees.value.push(normalizeEmployee(data));
      notifySuccess('Сотрудник добавлен');
    } catch (e: any) {
      notifyError(
        e.response?.data?.message || 'Ошибка при создании сотрудника'
      );
    } finally {
      isLoading.value = false;
    }
  }

  async function updateEmployee(
    id: number,
    payload: UpdateEmployeeDetailsPayload
  ) {
    isLoading.value = true;
    try {
      const { data } = await api.put(`/employees/${id}`, {
        position: payload.position,
        is_active: payload.isActive,
      });
      const idx = employees.value.findIndex((e) => e.id === id);
      if (idx !== -1) employees.value[idx] = normalizeEmployee(data);
      notifySuccess('Данные сотрудника обновлены');
    } catch (e: any) {
      notifyError(
        e.response?.data?.message || 'Ошибка при обновлении сотрудника'
      );
    } finally {
      isLoading.value = false;
    }
  }

  async function removeEmployee(id: number) {
    isLoading.value = true;
    try {
      await api.delete(`/employees/${id}`);
      employees.value = employees.value.filter((e) => e.id !== id);
      notifySuccess('Сотрудник удалён');
    } catch (e: any) {
      notifyError(
        e.response?.data?.message || 'Ошибка при удалении сотрудника'
      );
    } finally {
      isLoading.value = false;
    }
  }

  return {
    employees,
    isLoading,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    removeEmployee,
  };
});
