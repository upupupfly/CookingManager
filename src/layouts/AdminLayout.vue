<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const active = ref('dishes')

watch(
  () => route.path,
  (p) => {
    if (p.startsWith('/dishes')) active.value = 'dishes'
  },
  { immediate: true }
)

function onMenuChange(value: string) {
  if (value === 'dishes') router.push('/dishes')
}

function onLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="admin-layout">
    <t-head-menu v-model="active" theme="light" @change="onMenuChange">
      <template #logo>
        <div class="brand">
          <img class="brand-logo" src="/favicon.svg" alt="卫宫家今天的饭" />
          <span class="brand-text">卫宫家今天的饭</span>
        </div>
      </template>
      <t-menu-item value="dishes">菜品管理</t-menu-item>
      <template #operations>
        <t-button theme="primary" variant="outline" size="medium" @click="onLogout">退出登录</t-button>
      </template>
    </t-head-menu>
    <main class="admin-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.admin-layout :deep(.t-head-menu) {
  border-bottom: 1px solid #e7e7e7;
  background: #ffffff;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}
.brand-logo {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}
.brand-text {
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.9);
  white-space: nowrap;
}
.admin-content {
  padding: 16px 20px;
  box-sizing: border-box;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
}
</style>
