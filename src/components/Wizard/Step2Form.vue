<template>
  <div class="step">
    <el-form label-position="top">
      <el-form-item label="Категория">
        <el-select
          v-model="form.categoryId"
          placeholder="Выберите категорию"
          :loading="categoryStore.isLoading"
          @change="handleCategoryChange"
          :disabled="!form.districtId"
        >
          <el-option
            v-for="cat in filteredCategories"
            :key="cat.id"
            :label="cat.name"
            :value="cat.id"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <ul v-if="form.categoryId" class="options-list">
      <li
        v-for="dir in filteredDirections"
        :key="dir.id"
        :class="['option-item', { selected: form.directionId === dir.id }]"
        @click="selectDirection(dir.id)"
      >
        <span><img :src="docIcon" alt="" /></span>
        {{ dir.name }}
      </li>
      <li v-if="directionStore.isLoading">Загрузка услуг...</li>
      <li v-else-if="!filteredDirections.length">Услуги не найдены</li>
    </ul>
    <div v-else-if="!form.districtId">Выберите бизнес на предыдущем шаге</div>
    <div v-else>Выберите категорию выше</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useDirectionStore } from "@/store/useDirectionStore";
import type { WizardForm } from "@/types";
import docIcon from "@/assets/icons/doc_logo.svg";

const props = defineProps<{ modelValue: WizardForm }>();
const emit = defineEmits<{
  (e: "update:modelValue", value: WizardForm): void;
}>();

const categoryStore = useCategoryStore();
const directionStore = useDirectionStore();

const form = ref<WizardForm>({ ...props.modelValue });

watch(
  () => props.modelValue,
  (newValue) => {
    form.value = { ...newValue };
  },
  { immediate: true, deep: true }
);

const filteredCategories = computed(() =>
  categoryStore.categories.filter(
    (cat) => cat.districtId === form.value.districtId
  )
);
const filteredDirections = computed(() =>
  directionStore.directions.filter(
    (dir) => dir.categoryId === form.value.categoryId
  )
);

async function loadCatalog(businessId: number) {
  await Promise.all([
    categoryStore.fetchCategories(businessId),
    directionStore.fetchDirections(businessId),
  ]);
}

onMounted(() => {
  if (form.value.districtId) {
    loadCatalog(form.value.districtId);
  }
});

watch(
  () => form.value.districtId,
  (districtId, prev) => {
    if (districtId && districtId !== prev) {
      form.value.categoryId = null;
      form.value.directionId = null;
      emit("update:modelValue", { ...form.value });
      loadCatalog(districtId);
    }
  }
);

watch(
  () => form.value.categoryId,
  (categoryId, prev) => {
    if (categoryId !== prev) {
      form.value.directionId = null;
      emit("update:modelValue", { ...form.value });
    }
  }
);

function handleCategoryChange(categoryId: number) {
  form.value.categoryId = categoryId;
  emit("update:modelValue", { ...form.value });
}

function selectDirection(id: number) {
  form.value.directionId = id;
  form.value.employeeId = null;
  form.value.workingHourId = null;
  form.value.startsAt = null;
  form.value.branchId = null;
  emit("update:modelValue", { ...form.value });
}
</script>

<style scoped>
.options-list {
  list-style: none;
  padding: 0;
  margin-top: 16px;
}
.option-item {
  font-size: 20px;
  gap: 15px;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  color: #4d4e4f;
  background-color: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  border-color: #fff;
}
.option-item i {
  margin-right: 8px;
  color: #ff552e;
}
.option-item.selected {
  border-color: #ff552e;
  background: rgba(255, 85, 46, 0.1);
}

.el-form-item__label {
  font-size: 40px !important;
}

@media (max-width: 768px) {
  .option-item {
    font-size: 16px;
    gap: 10px;
    padding: 12px;
    margin-bottom: 12px;
  }
}
</style>
