<template>
  <div class="register-page">
    <div class="register-card">
      <h1 class="register-card__title">Регистрация</h1>
      <div class="register-card__divider"></div>

      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="rules"
        class="register-form"
        label-position="top"
        @submit.prevent="handleRegister"
      >
        <el-row :gutter="12">
          <el-col :xs="24" :sm="8">
            <el-form-item label="Фамилия" prop="surname">
              <el-input
                v-model="registerForm.surname"
                placeholder="Иванов"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item label="Имя" prop="name">
              <el-input
                v-model="registerForm.name"
                placeholder="Иван"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item label="Отчество" prop="patronymic">
              <el-input
                v-model="registerForm.patronymic"
                placeholder="Иванович"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="12">
          <el-col :xs="24" :sm="12">
            <el-form-item label="Дата рождения" prop="dateOfBirth">
              <el-date-picker
                v-model="registerForm.dateOfBirth"
                type="date"
                format="DD/MM/YYYY"
                value-format="YYYY-MM-DD"
                placeholder="ДД/ММ/ГГГГ"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="Город" prop="city">
              <el-input
                v-model="registerForm.city"
                placeholder="Москва"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="12">
          <el-col :xs="24" :sm="12">
            <el-form-item label="Телефон" prop="phone">
              <el-input
                v-model="registerForm.phone"
                placeholder="+7 (___) ___-__-__"
                clearable
                @input="onPhoneInput"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="Электронная почта" prop="email">
              <el-input
                v-model="registerForm.email"
                placeholder="example@gmail.com"
                clearable
                @input="onEmailInput"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Пароль" prop="password">
          <el-input
            :type="passwordVisible ? 'text' : 'password'"
            v-model="registerForm.password"
            placeholder="Придумайте пароль"
            @input="onPasswordInput"
          >
            <template #suffix>
              <el-icon class="register-form__eye" @click="togglePassword">
                <component :is="passwordVisible ? Hide : View" />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="Вид документа" prop="documentType">
          <el-select
            v-model="registerForm.documentType"
            placeholder="Выберите тип"
            style="width: 100%"
          >
            <el-option label="Паспорт РФ" value="passport_ru" />
            <el-option label="Загранпаспорт" value="passport_int" />
            <el-option
              label="Водительское удостоверение"
              value="driver_license"
            />
          </el-select>
        </el-form-item>

        <el-row :gutter="12">
          <el-col :xs="24" :sm="12">
            <el-form-item label="Серия" prop="passportSeries">
              <el-input
                v-model="registerForm.passportSeries"
                placeholder="____"
                maxlength="4"
                clearable
                @input="onSeriesInput"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="Номер" prop="passportNumber">
              <el-input
                ref="passportNumberRef"
                v-model="registerForm.passportNumber"
                placeholder="______"
                maxlength="6"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item prop="consent" class="register-form__consent">
          <el-checkbox v-model="registerForm.consent">
            Я даю согласие на
            <a href="#" class="register-link" @click.prevent
              >обработку персональных данных</a
            >
          </el-checkbox>
        </el-form-item>

        <el-button
          native-type="submit"
          class="register-form__submit"
          :loading="authStore.isLoading"
        >
          Зарегистрироваться
        </el-button>
      </el-form>

      <p class="register-login">
        Уже есть аккаунт?
        <router-link to="/login" class="register-link">Войти.</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/useAuthStore";
import { View, Hide } from "@element-plus/icons-vue";
import { ElLoading } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";

const authStore = useAuthStore();
const router = useRouter();
const registerFormRef = ref<FormInstance>();
const registerForm = reactive({
  surname: "",
  name: "",
  patronymic: "",
  dateOfBirth: "",
  city: "",
  phone: "",
  email: "",
  password: "",
  documentType: "",
  passportSeries: "",
  passportNumber: "",
  consent: false,
});
const passwordVisible = ref(false);
const passportNumberRef = ref<{ focus: () => void }>();

const rules: FormRules = {
  surname: [{ required: true, message: "Введите фамилию", trigger: "blur" }],
  name: [{ required: true, message: "Введите имя", trigger: "blur" }],
  patronymic: [
    { required: true, message: "Введите отчество", trigger: "blur" },
  ],
  dateOfBirth: [
    {
      required: true,
      message: "Выберите дату рождения",
      trigger: "change",
    },
  ],
  city: [{ required: true, message: "Укажите город", trigger: "blur" }],
  phone: [{ required: true, message: "Введите телефон", trigger: "blur" }],
  email: [
    { required: true, message: "Введите email", trigger: "blur" },
    {
      type: "email",
      message: "Неверный формат email",
      trigger: ["blur", "change"],
    },
  ],
  password: [{ required: true, message: "Введите пароль", trigger: "blur" }],
  documentType: [
    {
      required: true,
      message: "Выберите тип документа",
      trigger: "change",
    },
  ],
  passportSeries: [
    {
      required: true,
      message: "Введите серию паспорта",
      trigger: "blur",
    },
    {
      pattern: /^\d{4}$/,
      message: "Серия должна быть из 4 цифр",
      trigger: "blur",
    },
  ],
  passportNumber: [
    {
      required: true,
      message: "Введите номер паспорта",
      trigger: "blur",
    },
    {
      pattern: /^\d{6}$/,
      message: "Номер должен быть из 6 цифр",
      trigger: "blur",
    },
  ],
  consent: [
    {
      validator: (_: unknown, value: boolean, cb: (e?: Error) => void) => {
        value ? cb() : cb(new Error("Необходимо согласие"));
      },
      trigger: "change",
    },
  ],
};

const togglePassword = () => {
  passwordVisible.value = !passwordVisible.value;
};

const onEmailInput = (value: string) => {
  registerForm.email = value.replace(/\s+/g, "");
};

const onPasswordInput = (value: string) => {
  registerForm.password = value.trim();
};

const formatPhone = (value: string): string => {
  let digits = value.replace(/\D/g, "");
  if (!digits.startsWith("7")) digits = "7" + digits;
  let fmt = "+7";
  if (digits.length > 1) fmt += " (" + digits.slice(1, 4);
  if (digits.length >= 5) fmt += ") " + digits.slice(4, 7);
  if (digits.length >= 8) fmt += "-" + digits.slice(7, 9);
  if (digits.length >= 10) fmt += "-" + digits.slice(9, 11);
  return fmt;
};

const onPhoneInput = () => {
  registerForm.phone = formatPhone(registerForm.phone);
};

const onSeriesInput = async () => {
  if (registerForm.passportSeries.replace(/\D/g, "").length === 4) {
    await nextTick();
    passportNumberRef.value?.focus();
  }
};

const handleRegister = () => {
  registerFormRef.value?.validate(async (valid) => {
    if (!valid) return;
    const loader = ElLoading.service({
      text: "Загрузка...",
      background: "rgba(0,0,0,0.3)",
    });
    try {
      const ok = await authStore.signup({
        name: `${registerForm.surname} ${registerForm.name} ${registerForm.patronymic}`,
        email: registerForm.email.trim(),
        password: registerForm.password.trim(),
        phone: registerForm.phone,
      });
      if (ok) {
        router.push("/records");
      }
    } finally {
      loader.close();
    }
  });
};
</script>

<style scoped>
.register-page {
  --reg-orange: #ff552e;
  --reg-orange-hover: #e84b28;
  --reg-text: #3d3d3d;
  --reg-muted: #8a8a8a;
  --reg-border: #e6e6e6;

  width: 100%;
  display: flex;
  justify-content: center;
}

.register-card {
  width: 100%;
  max-width: 560px;
  background: #fff;
  border-radius: 16px;
  padding: 32px 36px 28px;
  box-shadow: 0 18px 48px rgba(90, 40, 10, 0.18);
  box-sizing: border-box;
}

.register-card__title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--reg-text);
  text-align: left;
}

.register-card__divider {
  height: 1px;
  background: var(--reg-border);
  margin: 18px 0 22px;
}

.register-form {
  width: 100%;
}

.register-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.register-form :deep(.el-form-item__label) {
  color: var(--reg-text);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 8px !important;
  padding: 0;
}

.register-form :deep(.el-input__wrapper),
.register-form :deep(.el-select__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px var(--reg-border) inset;
  min-height: 44px;
  background: #fff;
}

.register-form :deep(.el-input__wrapper) {
  padding: 4px 12px;
}

.register-form :deep(.el-input__wrapper.is-focus),
.register-form :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px var(--reg-orange) inset !important;
}

.register-form :deep(.el-input__inner),
.register-form :deep(.el-select__placeholder),
.register-form :deep(.el-select__selected-item) {
  color: var(--reg-text);
  font-size: 15px;
}

.register-form :deep(.el-input__inner::placeholder) {
  color: #b0b0b0;
}

.register-form :deep(.el-date-editor.el-input),
.register-form :deep(.el-date-editor.el-input__wrapper) {
  width: 100%;
}

.register-form__eye {
  cursor: pointer;
  color: #9a9a9a;
  font-size: 18px;
}

.register-form__eye:hover {
  color: var(--reg-orange);
}

.register-form__consent :deep(.el-checkbox__label) {
  color: var(--reg-text);
  font-size: 13px;
  white-space: normal;
  line-height: 1.4;
}

.register-form__consent :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: var(--reg-orange);
  border-color: var(--reg-orange);
}

.register-form__submit {
  width: 100%;
  height: 48px;
  margin-top: 4px;
  border: none !important;
  border-radius: 10px !important;
  background: var(--reg-orange) !important;
  color: #fff !important;
  font-size: 16px !important;
  font-weight: 600 !important;
}

.register-form__submit:hover,
.register-form__submit:focus {
  background: var(--reg-orange-hover) !important;
  color: #fff !important;
}

.register-link {
  color: var(--reg-orange);
  text-decoration: none;
  font-weight: 500;
}

.register-link:hover {
  color: var(--reg-orange-hover);
  text-decoration: underline;
}

.register-login {
  margin: 18px 0 0;
  text-align: center;
  font-size: 14px;
  color: var(--reg-text);
}

@media (max-width: 768px) {
  .register-card {
    padding: 24px 20px 22px;
    border-radius: 14px;
  }

  .register-card__title {
    font-size: 24px;
  }
}
</style>
