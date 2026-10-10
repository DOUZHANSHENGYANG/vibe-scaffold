# app-shell Roadmap（审查遗留项）

> 来源：对抗性代码审查（code-reviewer 子代理，2026-10）。已修复项见 git 历史；本文记录机制级遗留。

## 已修复（本轮）

| 问题                                                                                                 | 修复                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| B3：非 Tauri 栈构建失败（window.ts 静态解析 `@tauri-apps/api` 失败）                                 | 拆双模板变体：`app-shell/common`（浏览器 stub）/ `app-shell/tauri`（真实现）                                                                           |
| B1（部分）：paraglide 插件注入错配置文件                                                             | 新 `spaVitePlugins` slot——注入点改为 **apps/web/vite.config.ts**（spa.ts renderFile 化）；pwa 同步迁移；vite-plus 上错误位置的 vitePlugins slot 已撤销 |
| M-minor：主题选中态双轨 / ready rejection / titlebar 初始闪烁 / settings 高亮不跟随 / 清空无错误处理 | 全部修复（useTheme 驱动选中态、`.catch`、拖拽区先渲染、hashchange 跟踪、toast error）                                                                  |
| local-db 模板 plugin-sql API 错误                                                                    | `new Database()` 构造式（Todo 实测抓出）                                                                                                               |

## 待做（按优先级）

1. **root-layout 挂载机制（原 B2）**：spa 的 `__root.tsx` 目前是静态模板，addon 无法挂载 `<Titlebar />`。方案：spa 提供 `rootLayoutExtras` slot（renderFile 化 `__root.tsx`），app-shell 贡献 `<Titlebar />` + `tauriWindow {decorations:false}`。**在此机制就绪前不要恢复 decorations:false**（否则生成的桌面应用开箱无边框且无法关闭）。
2. **维护路径回放 setup（原 M1）**：`vibe-scaffold add` 不执行 setupCommand → paraglide 产物缺失 → 校验失败。需要维护模型持久化并回放"新增能力对应的 setup 命令"。
3. **header 的 i18n 化（原 M2）**：header 链接与 titlebar aria-label 硬编码英文。header 归 tanstack-router 模板所有——i18n 化需要 header 模板变体或文案 slot。
4. **app-shell 验证覆盖**：当前无含 app-shell 的 snapshot/golden。加入一个 `spa+local-db+app-shell`（+tauri 变体）栈进验证矩阵。
5. **settings 双模板去重**：common/local-db 两份 settings.tsx 仅差 DataSection；若节继续增多，提取共享 section 组件。

## 已知约定（非缺陷）

- `<Titlebar />` 与 `decorations:false` 是**手动启用**的约定（AGENTS.md App shell 节）：挂载 + 改 conf 各一步；机制化见待做 #1。
- paraglide 产物（`src/paraglide/`）checkin 入库（与 Studio 同策略）：`vp check` 不需要先 build；改 messages 后跑 `pnpm --dir apps/web exec paraglide-js compile --project ./project.inlang --outdir ./src/paraglide --emit-ts-declarations`。
