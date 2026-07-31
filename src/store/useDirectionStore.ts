import { defineStore } from 'pinia';
import { ref } from 'vue';
import { notifyError } from '@/utils/notify';
import type {
  Direction,
  CreateDirectionPayload,
  UpdateDirectionPayload,
} from '@/types';
import api from '@/services/api';

/** Service variants exposed as "directions" for the existing wizard UI. */
function normalizeVariant(variant: any, service: any): Direction {
  const serviceName = service?.name ? `${service.name} — ` : '';
  return {
    id: variant.id,
    name: `${serviceName}${variant.name}`,
    description: service?.description,
    isActive: Boolean(variant.is_active ?? variant.isActive ?? true),
    categoryId: service?.category_id ?? service?.categoryId ?? undefined,
    districtId: service?.business_id ?? service?.businessId ?? undefined,
  };
}

export const useDirectionStore = defineStore('direction', () => {
  const directions = ref<Direction[]>([]);
  const isLoading = ref(false);

  async function fetchDirections(businessId?: number) {
    isLoading.value = true;
    try {
      const [{ data: services }, { data: variants }] = await Promise.all([
        api.get<any[]>('/services', {
          params: businessId ? { business_id: businessId } : undefined,
        }),
        api.get<any[]>('/services/variants'),
      ]);

      const serviceList = Array.isArray(services) ? services : [];
      const variantList = Array.isArray(variants) ? variants : [];
      const byId = new Map(serviceList.map((s) => [s.id, s]));

      directions.value = variantList
        .map((v) => {
          const service = byId.get(v.service_id);
          if (businessId && service && service.business_id !== businessId) {
            return null;
          }
          if (!service && businessId) return null;
          return normalizeVariant(v, service);
        })
        .filter(Boolean) as Direction[];
    } catch (e: any) {
      notifyError(e.response?.data?.message || 'Ошибка загрузки услуг');
      directions.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchDirectionById(id: number) {
    isLoading.value = true;
    try {
      await fetchDirections();
      directions.value = directions.value.filter((d) => d.id === id);
    } catch (e: any) {
      directions.value = [];
      notifyError(e.response?.data?.message || 'Ошибка загрузки услуги');
    } finally {
      isLoading.value = false;
    }
  }

  async function createDirection(payload: CreateDirectionPayload) {
    isLoading.value = true;
    try {
      notifyError('Создание вариантов услуг через этот UI пока не поддерживается');
      void payload;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateDirection(id: number, payload: UpdateDirectionPayload) {
    isLoading.value = true;
    try {
      notifyError('Обновление вариантов услуг через этот UI пока не поддерживается');
      void id;
      void payload;
    } finally {
      isLoading.value = false;
    }
  }

  async function removeDirection(id: number) {
    isLoading.value = true;
    try {
      notifyError('Удаление вариантов услуг через этот UI пока не поддерживается');
      void id;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    directions,
    isLoading,
    fetchDirections,
    createDirection,
    updateDirection,
    removeDirection,
    fetchDirectionById,
  };
});
