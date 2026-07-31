import { defineStore } from 'pinia';
import { ref } from 'vue';
import { notifyError, notifySuccess } from '@/utils/notify';
import type { Notification } from '@/types';
import api from '@/services/api';

function normalizeNotification(n: any): Notification {
  return {
    id: n.id,
    userId: n.user_id ?? n.userId,
    title: n.title,
    message: n.message,
    isRead: Boolean(n.is_read ?? n.isRead),
    createdAt: n.created_at ?? n.createdAt,
  };
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([]);
  const isLoading = ref(false);

  async function fetchNotifications() {
    isLoading.value = true;
    try {
      const { data } = await api.get<any[]>('/notification');
      notifications.value = (Array.isArray(data) ? data : []).map(
        normalizeNotification
      );
    } catch (e: any) {
      notifyError(e.response?.data?.message || 'Ошибка загрузки уведомлений');
    } finally {
      isLoading.value = false;
    }
  }

  async function markAsRead(id: number) {
    isLoading.value = true;
    try {
      await api.put(`/notification/${id}/read`);
      const idx = notifications.value.findIndex((n) => n.id === id);
      if (idx !== -1) notifications.value[idx].isRead = true;
      notifySuccess('Уведомление прочитано');
    } catch (e: any) {
      notifyError(
        e.response?.data?.message || 'Ошибка при изменении статуса уведомления'
      );
    } finally {
      isLoading.value = false;
    }
  }

  return {
    notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
  };
});
