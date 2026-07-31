import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { notifyError, notifySuccess } from '@/utils/notify';
import type { User, AuthResponse } from '@/types';
import api from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const isProfileLoading = ref(false);

  watch(token, (val) => {
    if (val) localStorage.setItem('token', val);
    else localStorage.removeItem('token');
  });

  async function getUserProfile() {
    if (!token.value) throw new Error('Нет токена');
    isProfileLoading.value = true;
    try {
      const { data } = await api.get<User>('/users/profile', {
        headers: { Authorization: `Bearer ${token.value}` },
      });
      user.value = data;
      localStorage.setItem('userData', JSON.stringify(data));
    } catch (e: any) {
      user.value = null;
      token.value = null;
      localStorage.removeItem('token');
      notifyError('Ошибка загрузки профиля. Требуется повторная авторизация.');
      throw e;
    } finally {
      isProfileLoading.value = false;
    }
  }

  async function updateUserProfile(payload: Partial<User>) {
    isLoading.value = true;
    try {
      // На сервере PATCH/PUT /users/profile
      await api.put('/users/profile', payload, {
        headers: { Authorization: `Bearer ${token.value}` },
      });
      notifySuccess('Профиль обновлен');
      await getUserProfile(); // Подтянуть новые данные
      return true;
    } catch (e: any) {
      notifyError(e.response?.data?.message || 'Ошибка обновления профиля');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteUserProfile() {
    isLoading.value = true;
    try {
      await api.delete('/users/profile', {
        headers: { Authorization: `Bearer ${token.value}` },
      });
      user.value = null;
      token.value = null;
      localStorage.removeItem('token');
      notifySuccess('Профиль удалён');
      return true;
    } catch (e: any) {
      notifyError(e.response?.data?.message || 'Ошибка удаления профиля');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // Вызывать только один раз при старте приложения!
  async function tryRestore() {
    if (token.value && !user.value) {
      try {
        await getUserProfile();
      } catch {
        // молча
      }
    }
  }

  async function login(payload: { email: string; password: string }) {
    isLoading.value = true;
    try {
      const { data } = await api.post<AuthResponse>('/users/login', {
        email: payload.email.trim(),
        password: payload.password.trim(),
      });
      user.value = data.user;
      token.value = data.token;
      localStorage.setItem('userData', JSON.stringify(data.user));
      notifySuccess('Успешный вход');
      return true;
    } catch (e: any) {
      notifyError(e.response?.data?.message || 'Ошибка входа');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function signup(payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    isLoading.value = true;
    try {
      const { data } = await api.post<{ message: string; token: string }>(
        '/users',
        {
          ...payload,
          email: payload.email.trim(),
          password: payload.password.trim(),
        }
      );
      token.value = data.token;
      await getUserProfile();
      notifySuccess('Регистрация успешна');
      return true;
    } catch (e: any) {
      notifyError(e.response?.data?.message || 'Ошибка регистрации');
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    notifySuccess('Вы вышли из системы');
  }

  return {
    user,
    token,
    isLoading,
    isProfileLoading,
    login,
    signup,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
    tryRestore,
    logout,
  };
});
