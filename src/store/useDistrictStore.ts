import { defineStore } from 'pinia';
import { ref } from 'vue';
import { notifyError, notifySuccess } from '@/utils/notify';
import type {
  District,
  CreateDistrictPayload,
  UpdateDistrictPayload,
} from '@/types';
import api from '@/services/api';

/** Maps Business → District-shaped UI model (legacy field names). */
function normalizeBusiness(b: any): District {
  return {
    id: b.id,
    name: b.name,
    description: b.description ?? undefined,
    isActive: b.status ? b.status === 'active' : true,
    phone: b.phone ?? undefined,
    email: b.email ?? undefined,
  };
}

export const useDistrictStore = defineStore('district', () => {
  const districts = ref<District[]>([]);
  const isLoading = ref(false);

  async function fetchDistricts() {
    isLoading.value = true;
    try {
      const { data } = await api.get<any[]>('/businesses');
      districts.value = (Array.isArray(data) ? data : []).map(normalizeBusiness);
    } catch (e: any) {
      notifyError(e.response?.data?.message || 'Ошибка загрузки бизнесов');
      districts.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  async function createDistrict(payload: CreateDistrictPayload) {
    isLoading.value = true;
    try {
      const { data } = await api.post('/businesses', {
        name: payload.name,
        description: payload.description,
        status: payload.isActive === false ? 'inactive' : 'active',
      });
      districts.value.push(normalizeBusiness(data));
      notifySuccess('Бизнес добавлен');
    } catch (e: any) {
      notifyError(e.response?.data?.message || 'Ошибка при создании бизнеса');
    } finally {
      isLoading.value = false;
    }
  }

  async function updateDistrict(id: number, payload: UpdateDistrictPayload) {
    isLoading.value = true;
    try {
      const body: Record<string, unknown> = {};
      if (payload.name !== undefined) body.name = payload.name;
      if (payload.description !== undefined) body.description = payload.description;
      if (payload.isActive !== undefined) {
        body.status = payload.isActive ? 'active' : 'inactive';
      }
      const { data } = await api.put(`/businesses/${id}`, body);
      const idx = districts.value.findIndex((d) => d.id === id);
      if (idx !== -1) districts.value[idx] = normalizeBusiness(data);
      notifySuccess('Бизнес обновлён');
    } catch (e: any) {
      notifyError(e.response?.data?.message || 'Ошибка при обновлении бизнеса');
    } finally {
      isLoading.value = false;
    }
  }

  async function removeDistrict(id: number) {
    isLoading.value = true;
    try {
      await api.delete(`/businesses/${id}`);
      districts.value = districts.value.filter((d) => d.id !== id);
      notifySuccess('Бизнес удалён');
    } catch (e: any) {
      notifyError(e.response?.data?.message || 'Ошибка при удалении бизнеса');
    } finally {
      isLoading.value = false;
    }
  }

  return {
    districts,
    isLoading,
    fetchDistricts,
    createDistrict,
    updateDistrict,
    removeDistrict,
  };
});
