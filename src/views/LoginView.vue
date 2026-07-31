<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-card__title">Вход</h1>
      <div class="login-card__divider"></div>

      <el-form
        :model="loginForm"
        class="login-form"
        label-position="top"
        @submit.prevent="handleLogin"
      >
        <el-form-item label="Электронная почта">
          <el-input
            v-model="loginForm.email"
            autocomplete="email"
            placeholder="example@gmail.com"
            clearable
            @input="onEmailInput"
          />
        </el-form-item>

        <el-form-item label="Пароль">
          <el-input
            :type="passwordVisible ? 'text' : 'password'"
            v-model="loginForm.password"
            autocomplete="current-password"
            placeholder="••••••••"
            @input="onPasswordInput"
          >
            <template #suffix>
              <el-icon class="login-form__eye" @click="togglePassword">
                <component :is="passwordVisible ? Hide : View" />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <div class="login-form__forgot">
          <router-link to="/forgot-password" class="login-link"
            >Забыли пароль?</router-link
          >
        </div>

        <el-button
          native-type="submit"
          class="login-form__submit"
          :loading="authStore.isLoading"
        >
          Войти
        </el-button>
      </el-form>

      <p class="login-legal">
        Регистрируясь, вы соглашаетесь с
        <a href="#" class="login-link" @click.prevent
          >правилами обработки персональных данных</a
        >
      </p>

      <p class="login-signup">
        Ещё нет аккаунта?
        <router-link to="/register" class="login-link"
          >Зарегистрироваться.</router-link
        >
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "vue-router";
import { View, Hide } from "@element-plus/icons-vue";

export default defineComponent({
  name: "LoginView",
  components: {
    View,
    Hide,
  },
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const loginForm = reactive({
      email: "",
      password: "",
    });
    const passwordVisible = ref(false);

    const togglePassword = () => {
      passwordVisible.value = !passwordVisible.value;
    };

    const onEmailInput = (value: string) => {
      loginForm.email = value.replace(/\s+/g, "");
    };

    const onPasswordInput = (value: string) => {
      loginForm.password = value.trim();
    };

    const handleLogin = async () => {
      const ok = await authStore.login({
        email: loginForm.email.trim(),
        password: loginForm.password.trim(),
      });
      if (!ok) return;

      const role = authStore.user?.role;
      if (role === "client") {
        router.push("/records");
      } else if (role === "employee") {
        router.push("/employee-records");
      } else if (role === "business_admin" || role === "super_admin") {
        router.push("/clients");
      } else {
        router.push("/");
      }
    };

    return {
      authStore,
      loginForm,
      handleLogin,
      passwordVisible,
      togglePassword,
      onEmailInput,
      onPasswordInput,
      Hide,
      View,
    };
  },
});
</script>

<style scoped>
.login-page {
  --login-orange: #ff552e;
  --login-orange-hover: #e84b28;
  --login-text: #3d3d3d;
  --login-muted: #8a8a8a;
  --login-border: #e6e6e6;

  width: 100%;
  display: flex;
  justify-content: center;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 32px 36px 28px;
  box-shadow: 0 18px 48px rgba(90, 40, 10, 0.18);
  box-sizing: border-box;
}

.login-card__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--login-text);
  text-align: left;
}

.login-card__divider {
  height: 1px;
  background: var(--login-border);
  margin: 18px 0 22px;
}

.login-form {
  width: 100%;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.login-form :deep(.el-form-item__label) {
  color: var(--login-text);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 8px !important;
  padding: 0;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px var(--login-border) inset;
  padding: 4px 12px;
  min-height: 44px;
  background: #fff;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--login-orange) inset;
}

.login-form :deep(.el-input__inner) {
  color: var(--login-text);
  font-size: 15px;
}

.login-form :deep(.el-input__inner::placeholder) {
  color: #b0b0b0;
}

.login-form__eye {
  cursor: pointer;
  color: #9a9a9a;
  font-size: 18px;
}

.login-form__eye:hover {
  color: var(--login-orange);
}

.login-form__forgot {
  display: flex;
  justify-content: flex-end;
  margin: -4px 0 20px;
}

.login-form__submit {
  width: 100%;
  height: 48px;
  border: none !important;
  border-radius: 10px !important;
  background: var(--login-orange) !important;
  color: #fff !important;
  font-size: 16px !important;
  font-weight: 600 !important;
}

.login-form__submit:hover,
.login-form__submit:focus {
  background: var(--login-orange-hover) !important;
  color: #fff !important;
}

.login-link {
  color: var(--login-orange);
  text-decoration: none;
  font-weight: 500;
}

.login-link:hover {
  color: var(--login-orange-hover);
  text-decoration: underline;
}

.login-legal {
  margin: 16px 0 0;
  text-align: center;
  font-size: 12px;
  line-height: 1.45;
  color: var(--login-muted);
}

.login-signup {
  margin: 18px 0 0;
  text-align: center;
  font-size: 14px;
  color: var(--login-text);
}

@media (max-width: 768px) {
  .login-card {
    padding: 24px 20px 22px;
    border-radius: 14px;
  }

  .login-card__title {
    font-size: 24px;
  }
}
</style>
