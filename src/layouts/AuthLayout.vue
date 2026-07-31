<template>
  <div class="auth-layout">
    <div class="auth-layout__bg" aria-hidden="true">
      <svg
        class="auth-layout__waves"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="auth-sand" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffb07a" />
            <stop offset="45%" stop-color="#ff9a62" />
            <stop offset="100%" stop-color="#ff7a45" />
          </linearGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#auth-sand)" />
        <path
          d="M0 180 C220 120 380 240 560 200 C780 150 920 80 1140 130 C1280 165 1360 210 1440 190 L1440 0 L0 0 Z"
          fill="#ffc39a"
          opacity="0.55"
        />
        <path
          d="M0 320 C180 280 340 360 520 330 C740 290 900 230 1120 270 C1280 300 1360 340 1440 320 L1440 0 L0 0 Z"
          fill="#ffb488"
          opacity="0.35"
        />
        <path
          d="M0 520 C240 460 420 580 640 540 C880 490 1040 430 1260 480 C1350 505 1400 530 1440 520 L1440 900 L0 900 Z"
          fill="#ff8f55"
          opacity="0.45"
        />
        <path
          d="M0 680 C200 640 360 720 560 700 C820 670 1000 620 1220 660 C1330 680 1390 710 1440 700 L1440 900 L0 900 Z"
          fill="#ff7d42"
          opacity="0.5"
        />
        <path
          d="M0 780 C180 760 320 820 520 800 C780 770 980 740 1200 780 C1320 800 1385 820 1440 810 L1440 900 L0 900 Z"
          fill="#ff6d35"
          opacity="0.55"
        />
      </svg>
    </div>

    <router-link to="/login" class="auth-layout__brand">
      <img
        src="/logoWhite.svg"
        alt="очередь"
        class="auth-layout__brand-logo"
      />
    </router-link>

    <div class="auth-layout__content">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "AuthLayout",
});
</script>

<style scoped>
.auth-layout {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

.auth-layout__bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.auth-layout__waves {
  width: 100%;
  height: 100%;
  display: block;
}

.auth-layout__brand {
  position: fixed;
  top: 28px;
  left: 36px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.auth-layout__brand-logo {
  height: 40px;
  width: auto;
  display: block;
}

.auth-layout__content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 88px 16px 40px;
  box-sizing: border-box;
}

.auth-layout__content > :deep(*) {
  margin-block: auto;
}

@media (max-width: 768px) {
  .auth-layout__brand {
    top: 20px;
    left: 20px;
  }

  .auth-layout__brand-logo {
    height: 32px;
  }

  .auth-layout__content {
    padding: 96px 16px 28px;
  }
}
</style>
