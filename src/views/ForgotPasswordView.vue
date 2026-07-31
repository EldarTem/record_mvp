<template>
  <div class="forgot-page">
    <div class="forgot-card">
      <h1 class="forgot-card__title">Восстановление пароля</h1>
      <div class="forgot-card__divider"></div>

      <!-- 1. Email -->
      <template v-if="step === 'email'">
        <el-form
          ref="emailFormRef"
          :model="emailForm"
          :rules="emailRules"
          class="forgot-form"
          label-position="top"
          @submit.prevent="handleSend"
        >
          <el-form-item label="Электронная почта" prop="email">
            <el-input
              v-model="emailForm.email"
              autocomplete="email"
              placeholder="example@gmail.com"
              clearable
              @input="onEmailInput"
            />
          </el-form-item>

          <el-button
            native-type="submit"
            class="forgot-form__submit"
            :loading="isLoading"
          >
            Отправить
          </el-button>
        </el-form>
      </template>

      <!-- 2. Letter sent -->
      <template v-else-if="step === 'sent'">
        <p class="forgot-card__message">
          Вам было отправлено сообщение. Проверьте электронную почту
        </p>
        <el-button class="forgot-form__submit" @click="goToPassword">
          Вернуться
        </el-button>
      </template>

      <!-- 3. New password -->
      <template v-else>
        <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          class="forgot-form"
          label-position="top"
          @submit.prevent="handleSave"
        >
          <el-form-item label="Введите новый пароль" prop="password">
            <el-input
              :type="passwordVisible ? 'text' : 'password'"
              v-model="passwordForm.password"
              autocomplete="new-password"
              placeholder="qwerty123"
              @input="onPasswordInput('password', $event)"
            >
              <template #suffix>
                <el-icon class="forgot-form__eye" @click="togglePassword">
                  <component :is="passwordVisible ? Hide : View" />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="Повторите пароль" prop="confirmPassword">
            <el-input
              :type="confirmVisible ? 'text' : 'password'"
              v-model="passwordForm.confirmPassword"
              autocomplete="new-password"
              placeholder="qwerty123"
              @input="onPasswordInput('confirmPassword', $event)"
            >
              <template #suffix>
                <el-icon class="forgot-form__eye" @click="toggleConfirm">
                  <component :is="confirmVisible ? Hide : View" />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-button
            native-type="submit"
            class="forgot-form__submit"
            :loading="isLoading"
          >
            Сохранить
          </el-button>
        </el-form>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { View, Hide } from "@element-plus/icons-vue";
import type { FormInstance, FormRules } from "element-plus";
import { notifySuccess } from "@/utils/notify";

type Step = "email" | "sent" | "password";

const router = useRouter();
const route = useRoute();

const emailFormRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();
const step = ref<Step>("email");
const isLoading = ref(false);
const passwordVisible = ref(false);
const confirmVisible = ref(false);

const emailForm = reactive({
  email: "",
});

const passwordForm = reactive({
  password: "",
  confirmPassword: "",
});

const emailRules: FormRules = {
  email: [
    { required: true, message: "Введите email", trigger: "blur" },
    {
      type: "email",
      message: "Неверный формат email",
      trigger: ["blur", "change"],
    },
  ],
};

const passwordRules: FormRules = {
  password: [
    { required: true, message: "Введите новый пароль", trigger: "blur" },
    {
      min: 6,
      message: "Пароль должен быть не короче 6 символов",
      trigger: "blur",
    },
  ],
  confirmPassword: [
    { required: true, message: "Повторите пароль", trigger: "blur" },
    {
      validator: (_: unknown, value: string, cb: (e?: Error) => void) => {
        if (value !== passwordForm.password) {
          cb(new Error("Пароли не совпадают"));
        } else {
          cb();
        }
      },
      trigger: "blur",
    },
  ],
};

onMounted(() => {
  if (route.query.token || route.name === "ResetPassword") {
    step.value = "password";
  }
});

const onEmailInput = (value: string) => {
  emailForm.email = value.replace(/\s+/g, "");
};

const onPasswordInput = (
  field: "password" | "confirmPassword",
  value: string
) => {
  passwordForm[field] = value.trim();
};

const togglePassword = () => {
  passwordVisible.value = !passwordVisible.value;
};

const toggleConfirm = () => {
  confirmVisible.value = !confirmVisible.value;
};

const handleSend = () => {
  emailFormRef.value?.validate(async (valid) => {
    if (!valid) return;
    isLoading.value = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      step.value = "sent";
    } finally {
      isLoading.value = false;
    }
  });
};

const goToPassword = () => {
  step.value = "password";
};

const handleSave = () => {
  passwordFormRef.value?.validate(async (valid) => {
    if (!valid) return;
    isLoading.value = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      notifySuccess("Пароль успешно изменён");
      router.push("/login");
    } finally {
      isLoading.value = false;
    }
  });
};
</script>

<style scoped>
.forgot-page {
  --forgot-orange: #ff552e;
  --forgot-orange-hover: #e84b28;
  --forgot-text: #3d3d3d;
  --forgot-muted: #8a8a8a;
  --forgot-border: #e6e6e6;

  width: 100%;
  display: flex;
  justify-content: center;
}

.forgot-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 32px 36px 28px;
  box-shadow: 0 18px 48px rgba(90, 40, 10, 0.18);
  box-sizing: border-box;
}

.forgot-card__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--forgot-text);
  text-align: left;
}

.forgot-card__divider {
  height: 1px;
  background: var(--forgot-border);
  margin: 18px 0 22px;
}

.forgot-card__message {
  margin: 8px 0 28px;
  text-align: center;
  font-size: 15px;
  line-height: 1.5;
  color: var(--forgot-muted);
}

.forgot-form {
  width: 100%;
}

.forgot-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.forgot-form :deep(.el-form-item__label) {
  color: var(--forgot-text);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 8px !important;
  padding: 0;
}

.forgot-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px var(--forgot-border) inset;
  padding: 4px 12px;
  min-height: 44px;
  background: #fff;
}

.forgot-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--forgot-orange) inset;
}

.forgot-form :deep(.el-input__inner) {
  color: var(--forgot-text);
  font-size: 15px;
}

.forgot-form :deep(.el-input__inner::placeholder) {
  color: #b0b0b0;
}

.forgot-form__eye {
  cursor: pointer;
  color: #9a9a9a;
  font-size: 18px;
}

.forgot-form__eye:hover {
  color: var(--forgot-orange);
}

.forgot-form__submit {
  width: 100%;
  height: 48px;
  margin-top: 8px;
  border: none !important;
  border-radius: 10px !important;
  background: var(--forgot-orange) !important;
  color: #fff !important;
  font-size: 16px !important;
  font-weight: 600 !important;
}

.forgot-form__submit:hover,
.forgot-form__submit:focus {
  background: var(--forgot-orange-hover) !important;
  color: #fff !important;
}

@media (max-width: 768px) {
  .forgot-card {
    padding: 24px 20px 22px;
    border-radius: 14px;
  }

  .forgot-card__title {
    font-size: 24px;
  }
}
</style>
