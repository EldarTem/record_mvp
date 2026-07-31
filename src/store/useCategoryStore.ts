import { defineStore } from 'pinia';
import { ref } from 'vue';
import { notifyError, notifySuccess } from '@/utils/notify';
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/types';
import api from '@/services/api';

function normalizeCategory(cat: any): Category {
  return {
    id: cat.id,
    name: cat.name,
    description: cat.description,
    isActive: cat.isActive ?? cat.is_active ?? true,
    // UI still filters by districtId; backend uses business_id
    districtId: cat.districtId ?? cat.district_id ?? cat.business_id,
  };
}

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([]);
  const isLoading = ref(false);

  async function fetchCategories(businessId?: number) {
    isLoading.value = true;
    try {
      const { data } = await api.get<any[]>('/services/categories', {
        params: businessId ? { business_id: businessId } : undefined,
      });
      categories.value = (Array.isArray(data) ? data : []).map(normalizeCategory);
    } catch (e: any) {
      notifyError(e.response?.data?.message || 'Ошибка загрузки категорий');
      categories.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  async function createCategory(
    payload: CreateCategoryPayload & { business_id?: number; districtId?: number }
  ) {
    isLoading.value = true;
    try {
      const business_id = payload.business_id ?? payload.districtId;
      if (!business_id) {
        throw new Error('business_id обязателен');
      }
      const { data } = await api.post('/services/categories', {
        business_id,
        name: payload.name,
        description: payload.description,
      });
      categories.value.push(normalizeCategory(data));
      notifySuccess('Категория добавлена');
    } catch (e: any) {
      notifyError(e.response?.data?.message || 'Ошибка при создании категории');
    } finally {
      isLoading.value = false;
    }
  }

  async function updateCategory(id: number, payload: UpdateCategoryPayload) {
    isLoading.value = true;
    try {
      // Backend has no PUT /services/categories/:id in routes — keep local merge if needed
      notifyError('Обновление категорий пока не поддерживается API');
      void id;
      void payload;
    } finally {
      isLoading.value = false;
    }
  }

  async function removeCategory(id: number) {
    isLoading.value = true;
    try {
      notifyError('Удаление категорий пока не поддерживается API');
      void id;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    categories,
    isLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    removeCategory,
  };
});
