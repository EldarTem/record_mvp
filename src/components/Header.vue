<template>
  <div class="header__inner">
    <router-link :to="homePath" class="header__logo">
      <img src="/logoBlack.svg" alt="очередь" />
    </router-link>
    <div class="header__right">
      <button
        class="header__burger"
        @click="open = !open"
        :aria-expanded="open"
        aria-label="Menu"
      >
        <span :class="{ 'is-open': open }"></span>
        <span :class="{ 'is-open': open }"></span>
        <span :class="{ 'is-open': open }"></span>
      </button>
      <nav :class="['header__nav', { 'is-open': open }]" ref="nav">
        <ul class="nav__list" ref="list">
          <li
            v-for="item in menu"
            :key="item.path"
            class="nav__item"
            :class="{ active: $route.path === item.path }"
          >
            <router-link
              :to="item.path"
              class="nav__link"
              @click="onNavClick"
              >{{ item.label }}</router-link
            >
          </li>
        </ul>
        <div class="slider" ref="slider"></div>
      </nav>
      <button
        v-if="user?.role === 'client'"
        class="header__book-btn"
        @click="openBookingModal"
      >
        Записаться
      </button>
    </div>
    <div v-if="open" class="header__backdrop" @click="open = false"></div>
  </div>
  <WizardDialog
    :visible="showModal"
    @update:visible="showModal = $event"
    @submit="handleSubmit"
    :subtitles="subtitles"
    :stepComponents="stepComponents"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/store/useAuthStore";
import WizardDialog from "@/components/Wizard/WizardDialog.vue";
import Step1Form from "@/components/Wizard/Step1Form.vue";
import Step2Form from "@/components/Wizard/Step2Form.vue";
import Step3Form from "@/components/Wizard/Step3Form.vue";
import Step4Form from "@/components/Wizard/Step4Form.vue";

const open = ref(false);
const showModal = ref(false);
const list = ref<HTMLElement | null>(null);
const slider = ref<HTMLElement | null>(null);

const auth = useAuthStore();
const user = computed(() => auth.user);
const isProfileLoading = computed(() => auth.isProfileLoading);

const route = useRoute();

const homePath = computed(() => {
  switch (user.value?.role) {
    case "employee":
      return "/employee-records";
    case "business_admin":
    case "super_admin":
      return "/clients";
    default:
      return "/records";
  }
});

const menu = computed(() => {
  if (isProfileLoading.value) return [];
  if (!user.value) {
    return [
      { path: "/login", label: "Войти" },
      { path: "/register", label: "Регистрация" },
    ];
  }
  switch (user.value.role) {
    case "client":
      return [
        { path: "/records", label: "Мои записи" },
        { path: "/archive", label: "Архив" },
        { path: "/profile", label: "Аккаунт" },
      ];
    case "employee":
      return [
        { path: "/employee-records", label: "Мои записи" },
        { path: "/archive-employee", label: "Архив записей" },
        { path: "/employee-schedule", label: "Мой график" },
        { path: "/profile", label: "Аккаунт" },
      ];
    case "business_admin":
      return [
        { path: "/clients", label: "Клиенты" },
        { path: "/employee", label: "Сотрудники" },
        { path: "/archive", label: "Архив" },
        { path: "/distcrict", label: "Мой отдел" },
        { path: "/profile", label: "Аккаунт" },
      ];
    case "super_admin":
      return [
        { path: "/clients", label: "Клиенты" },
        { path: "/employee", label: "Сотрудники" },
        { path: "/admins", label: "Администраторы" },
        { path: "/departments", label: "Отделы" },
        { path: "/profile", label: "Аккаунт" },
      ];
  }
  return [];
});

const updateSlider = () => {
  nextTick(() => {
    if (window.innerWidth <= 768) {
      if (slider.value) slider.value.classList.remove("visible");
      return;
    }
    const activeLi = list.value?.querySelector(
      ".nav__item.active"
    ) as HTMLElement;
    if (!activeLi || !slider.value) return;

    slider.value.style.transform = `translateX(${activeLi.offsetLeft}px)`;
    slider.value.style.width = `${activeLi.clientWidth}px`;
    slider.value.classList.add("visible");
  });
};

const moveSlider = () => {
  setTimeout(updateSlider, 50);
};

const onNavClick = () => {
  open.value = false;
  moveSlider();
};

watch(
  () => route.fullPath,
  () => {
    open.value = false;
    updateSlider();
  }
);

onMounted(() => {
  updateSlider();
  window.addEventListener("resize", updateSlider);
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      requestAnimationFrame(updateSlider);
    });
  }
});

const subtitles = [
  "Выберите бизнес",
  "Выберите категорию и услугу",
  "Выберите сотрудника",
  "Выберите дату и время",
];
const stepComponents = [Step1Form, Step2Form, Step3Form, Step4Form];

const openBookingModal = () => {
  open.value = false;
  showModal.value = true;
};

const handleSubmit = (sessionId: number) => {
  console.log("Header: Form submitted with sessionId:", sessionId);
  showModal.value = false;
};
</script>

<style scoped>
.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  gap: 12px;
  position: relative;
}

.header__logo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.header__logo img {
  height: 40px;
  width: auto;
}

.header__right {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.header__backdrop {
  display: none;
}

.header__burger {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 120;
}

.header__burger span {
  display: block;
  height: 2px;
  background: #333;
  transition: transform 0.3s, opacity 0.3s;
}

.header__burger span.is-open:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.header__burger span.is-open:nth-child(2) {
  opacity: 0;
}

.header__burger span.is-open:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

.header__nav {
  position: relative;
}

.nav__list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav__item {
  margin: 0 16px;
}

.nav__link {
  display: block;
  padding: 32px 0;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
}

.nav__item.active .nav__link {
  color: #ff552e;
}

.slider {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: #ff552e;
  width: 0;
  transform: translateX(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, width;
  opacity: 0;
}

.slider.visible {
  opacity: 1;
}

.header__book-btn {
  padding: 10px 20px;
  background-color: #ff552e;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
  white-space: nowrap;
  flex-shrink: 0;
}

.header__book-btn:hover {
  background-color: #e14b26;
}

@media (max-width: 992px) {
  .nav__item {
    margin: 0 10px;
  }

  .nav__link {
    font-size: 14px;
  }

  .header__book-btn {
    padding: 8px 14px;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .header__logo img {
    height: 32px;
  }

  .header__burger {
    display: flex;
    order: 2;
  }

  .header__book-btn {
    order: 1;
    padding: 8px 12px;
    font-size: 13px;
  }

  .header__nav {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    background: #fff;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease, box-shadow 0.3s ease;
    z-index: 110;
  }

  .header__nav.is-open {
    max-height: 70vh;
    overflow-y: auto;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
    border-bottom: 1px solid #eee;
  }

  .header__backdrop {
    display: block;
    position: fixed;
    inset: 64px 0 0 0;
    background: rgba(0, 0, 0, 0.25);
    z-index: 105;
  }

  .nav__list {
    flex-direction: column;
    padding: 8px 0 16px;
  }

  .nav__item {
    margin: 0;
    text-align: left;
  }

  .nav__link {
    padding: 14px 20px;
  }

  .nav__item.active .nav__link {
    background: rgba(255, 85, 46, 0.08);
  }

  .slider {
    display: none;
  }
}

@media (max-width: 480px) {
  .header__book-btn {
    padding: 8px 10px;
    font-size: 12px;
  }
}
</style>
