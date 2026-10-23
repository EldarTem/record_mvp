import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

import ElementPlus from 'element-plus';
import ru from 'element-plus/es/locale/lang/ru';
import 'element-plus/dist/index.css';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import 'element-plus/theme-chalk/dark/css-vars.css';

import '@fontsource/montserrat/300.css';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import './style.css';

dayjs.locale('ru');

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(ElementPlus, { locale: ru });

const pinia = createPinia();
app.use(pinia);

import { useAuthStore } from '@/store/useAuthStore';

const splashShownAt = performance.now();
const SPLASH_MIN_MS = 900;

function hideSplash() {
  const splash = document.getElementById('app-splash');
  if (!splash) return;

  const wait = Math.max(0, SPLASH_MIN_MS - (performance.now() - splashShownAt));
  window.setTimeout(() => {
    splash.classList.add('is-hiding');
    window.setTimeout(() => {
      splash.remove();
      document.body.classList.add('app-ready');
    }, 480);
  }, wait);
}

const authStore = useAuthStore();
authStore.tryRestore().finally(() => {
  app.use(router);
  app.mount('#app');
  requestAnimationFrame(() => {
    requestAnimationFrame(hideSplash);
  });
});
