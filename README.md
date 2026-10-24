# 后台录入管理系统（PC 网页）

「做菜引导小程序」配套的 PC 网页后台录入系统前端。

## 技术栈

Vue 3 + TypeScript + Vite + Vue Router + Pinia + TDesign Vue Next + axios

## 目录结构

```
src/
├── router/        路由表 + 登录守卫
├── layouts/       后台外壳（顶部导航）
├── views/         页面（login / dish-list / dish-edit / preview）
├── components/    业务组件（StatusTag / UnpublishedChangesBadge / SaveStatusIndicator / StateBlock ...）
├── stores/        Pinia（auth / dish）
├── services/      请求层（request 二次封装 / auth / dish / preview / upload）
├── types/         domain.d.ts（数据模型）· api.d.ts（接口类型）
├── utils/         constants / format / error-map
├── mock/          开发期 mock 数据
└── styles/        theme.css（TDesign token 覆盖）
```

## 运行

```bash
npm install
npm run dev        # 开发（默认使用 mock 数据，见 .env.development）
```

## 构建

```bash
npm run build      # vue-tsc 类型检查 + vite 构建
npm run preview    # 预览构建产物
```

## 环境变量

| 变量 | 说明 | 默认 |
|---|---|---|
| `VITE_API_BASE` | 后端接口基地址 | `/api/admin` |
| `VITE_USE_MOCK` | 是否使用 mock 数据 | dev `true` / prod `false` |

## 说明

- **esbuild 临时目录**：esbuild 在 Windows 系统临时目录删除临时文件偶发「Access is denied」，已在 `vite.config.ts` 将临时目录重定向到项目内 `.tmp`（对 `dev`/`build` 同时生效）。
- **接口契约**：保存 / 发布 / 列表三接口见 `doc/后台管理系统/接口契约-保存与发布与列表-v1.0.md`；登录 / 新建菜 / 删除菜 / 预览票据 / 上传签名 5 个接口契约未覆盖，待后端补充。
- **类型即契约**：接口返回类型集中在 `src/types/api.d.ts`，调用处通过 `request<T>()` 拿到完整类型，后端字段变更由 `vue-tsc` 编译期暴露。
