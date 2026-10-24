<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import loginBg from '@/assets/login-bg.png'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const password = ref('')
const loading = ref(false)
const error = ref('')
const showPwd = ref(false)

async function onSubmit() {
  const pwd = password.value.trim()
  if (!pwd) {
    error.value = '请输入口令'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await auth.login(pwd)
    const redirect = (route.query.redirect as string) || '/dishes'
    router.replace(redirect)
  } catch (e) {
    const err = e as { message?: string }
    error.value = err?.message || '口令错误，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <!-- 背景插画：绝对定位仅用于背景图（允许） -->
    <img class="login-bg" :src="loginBg" alt="" draggable="false" />

    <!-- 卡片：flex 子项靠右居中；卡内元素全部正常文档流 -->
    <div class="login-card">
      <h1 class="login-title">Login</h1>

      <div class="field">
        <span class="field-label">Password</span>
        <t-input
          v-model="password"
          :type="showPwd ? 'text' : 'password'"
          placeholder="********"
          class="field-input"
          @enter="onSubmit"
        >
          <template #suffix-icon>
            <span class="eye-toggle" @click="showPwd = !showPwd">👁</span>
          </template>
        </t-input>
        <p class="error-line">
          <span v-if="error">{{ error }}</span>
        </p>
      </div>

      <t-button class="sign-in-btn" :loading="loading" @click="onSubmit">Sign in</t-button>

    </div>
  </div>
</template>

<style scoped>
/* 整页用 flex 流式布局：卡片靠右、垂直居中 */
.login-page {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 100vh;
  width: 100%;
  padding-right: 9.1%;
  box-sizing: border-box;
  background: #eef2ff;
  overflow: hidden;
  font-family: sans-serif;
}
/* 背景图用绝对定位（允许） */
.login-bg {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 78%;
  height: 98.3%;
  object-fit: cover;
  object-position: left bottom;
  user-select: none;
  -webkit-user-drag: none;
}
/* 卡片：flex 子项，不做绝对定位 */
.login-card {
  width: 641px;
  padding: 75px 120px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 19px 39px #dee1ff;
  border-radius: 24px;
}
/* 卡内元素：正常文档流 + 间距 */
.login-title {
  margin: 0 0 73px;
  font-size: 36px;
  font-weight: 600;
  line-height: 35px;
  color: #1a1a1a;
  user-select: none;
  -webkit-user-drag: none;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 11px;
  margin-bottom: 74px;
}
.field-label {
  font-size: 14px;
  color: #4a4a4a;
  user-select: none;
  -webkit-user-drag: none;
}
.field-input :deep(.t-input) {
  height: 50px;
  background: #ffffff;
  border-radius: 6px;
}
.eye-toggle {
  cursor: pointer;
  color: #c7d2d6;
  font-size: 16px;
  user-select: none;
}
.sign-in-btn {
  width: 100%;
  height: 50px;
  background: #4487ec;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(68, 135, 236, 0.4);
}
.sign-in-btn:hover {
  background: #3a78d4;
}
.error-line {
  height: 20px;
  margin: 0;
  font-size: 13px;
  color: #d54941;
}
</style>
