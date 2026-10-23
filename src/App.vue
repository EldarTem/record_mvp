<!-- src/App.vue -->
<template>
  <router-view />
  <Loader :loading="uiStore.isLoading" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useUiStore } from "@/store/useUiStore";
import Loader from "@/components/Loader.vue";

export default defineComponent({
  name: "App",
  components: { Loader },
  setup() {
    const uiStore = useUiStore();
    return { uiStore };
  },
});
</script>

<style>
body,
html,
#app {
  font-family: "Montserrat", sans-serif;
  height: 100%;
  margin: 0;
  background-color: #ff9a62;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  color: #4d4e4f;
}

/* After splash, main app shell uses the usual light surface */
body.app-ready,
body.app-ready #app {
  background-color: #efefef;
}

.el-container {
  min-height: 100vh;
  width: 100%;
}

.el-main {
  padding: 30px !important;
  flex: 1 1 auto;
  overflow-y: auto;
  width: 100%;
}

.page {
  padding: 50px !important;
  background-color: #fff;
  border-radius: 10px;
  width: 100%;
  box-sizing: border-box;
}

.page .title {
  font-size: 58px;
  font-weight: 700;
  line-height: 1.15;
  word-break: break-word;
}

.page .title span {
  color: var(--brand-orange, #ff552e);
}

.page .subtitle {
  font-size: 24px;
  font-weight: 500;
  margin: 30px 0;
}

.el-header {
  height: 84px !important;
  background: #fff;
  padding: 22px 30px;
  flex: 0 0 auto;
  position: sticky;
  top: 0;
  z-index: 100;
}

.archive-page .el-dialog {
  padding: 0 !important;
  border-radius: 10px !important;
}

.step {
  padding: 5px 34px 38px;
}

.archive-page .el-dialog__footer {
  padding: 0px 38px 34px 0px;
}

.archive-page .el-dialog__header {
  padding-bottom: 0 !important;
}

.pagination-controls {
  overflow-x: auto;
}

@media (max-width: 992px) {
  .el-main {
    padding: 20px !important;
  }

  .page {
    padding: 28px 24px !important;
  }

  .page .title {
    font-size: 40px;
  }

  .page .subtitle {
    font-size: 20px;
    margin: 20px 0;
  }

  .step {
    padding: 8px 16px 24px;
  }
}

@media (max-width: 768px) {
  .el-header {
    height: 64px !important;
    padding: 12px 16px;
  }

  .el-main {
    padding: 12px !important;
  }

  .page {
    padding: 20px 16px !important;
    border-radius: 8px;
  }

  .page .title {
    font-size: 28px;
  }

  .page .subtitle {
    font-size: 16px;
    margin: 14px 0 20px;
  }

  .step {
    padding: 4px 8px 20px;
  }

  .archive-page .el-dialog__footer {
    padding: 0 16px 20px;
  }

  .pagination-controls :deep(.el-pagination),
  .pagination-controls .el-pagination {
    justify-content: center;
    flex-wrap: wrap;
    row-gap: 8px;
  }
}

@media (max-width: 480px) {
  .page .title {
    font-size: 24px;
  }

  .page {
    padding: 16px 12px !important;
  }
}

/* Wizard / dialogs on small screens */
@media (max-width: 768px) {
  .wizard-dialog.el-dialog,
  .el-dialog.wizard-dialog,
  .el-dialog.is-fullscreen {
    border-radius: 0 !important;
  }

  .wizard-dialog .el-dialog__footer,
  .el-dialog__footer {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: stretch;
  }

  .wizard-dialog .el-dialog__footer .el-button,
  .el-dialog__footer .btn-cancel,
  .el-dialog__footer .btn-save {
    flex: 1 1 120px;
  }

  .el-overlay-dialog {
    padding: 0 !important;
  }
}
</style>
