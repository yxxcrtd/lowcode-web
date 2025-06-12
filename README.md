
## 技术栈

| 框架                                                                   | 说明               | 版本     |
|----------------------------------------------------------------------|------------------|--------|
| [Vue](https://staging-cn.vuejs.org/)                                 | Vue 框架           | 3.3.8 |
| [Vite](https://cn.vitejs.dev//)                                      | 开发与构建工具          | 4.5.0  |
| [Element Plus](https://element-plus.org/zh-CN/)                      | Element Plus     | 2.4.2 |
| [TypeScript](https://www.typescriptlang.org/docs/)                   | JavaScript 的超集   | 5.2.2  |
| [pinia](https://pinia.vuejs.org/)                                    | Vue 存储库 替代 vuex5 | 2.1.7 |
| [vueuse](https://vueuse.org/)                                        | 常用工具集            | 10.6.1 |
| [vue-i18n](https://kazupon.github.io/vue-i18n/zh/introduction.html/) | 国际化              | 9.6.5  |
| [vue-router](https://router.vuejs.org/)                              | Vue 路由           | 4.2.5  |
| [unocss](https://uno.antfu.me/)                                      | 原子 css          | 0.57.4  |
| [iconify](https://icon-sets.iconify.design/)                         | 在线图标库            | 3.1.1  |
| [wangeditor](https://www.wangeditor.com/)                            | 富文本编辑器           | 5.1.23 |

## 开发工具

推荐 VS Code 开发，配合插件如下：

| 插件名                           | 功能                  |
|-------------------------------|---------------------|
| Vue - Official                | Vue 与 TypeScript 支持 |
| unocss                        | unocss for vscode   |
| Iconify IntelliSense          | Iconify 预览和搜索       |
| i18n Ally                     | 国际化智能提示             |
| Stylelint                     | Css    格式化          |
| Prettier                      | 代码格式化               |
| ESLint                        | 脚本代码检查              |
| DotENV                        | env 文件高亮            |

## 开发流程

1. 使用https或ssh克隆代码；
2. 检查node版本，必须是20以上版本；
3. 使用 pnpm install 下拉依赖包；
4. 在.dev文件中检查后端服务地址是否正确；
4. 使用 pnpm run dev  启动项目；
5. 使用 pnpm run build:prod 打包；（确定内存足够）
