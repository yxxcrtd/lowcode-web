import { resolve } from 'path'
import { loadEnv } from 'vite'
import type { UserConfig, ConfigEnv } from 'vite'
import { createVitePlugins } from './build/vite'
import { include, exclude } from "./build/vite/optimize"
// 当前执行node命令时文件夹的地址(工作目录)
const root = process.cwd()

// 路径查找
function pathResolve(dir: string) {
  return resolve(root, '.', dir)
}

// https://vitejs.dev/config/
export default ({ command, mode }: ConfigEnv): UserConfig => {
  let env = {} as any
  const isBuild = command === 'build'
  if (!isBuild) {
    env = loadEnv((process.argv[3] === '--mode' ? process.argv[4] : process.argv[3]), root)
  } else {
    env = loadEnv(mode, root)
  }
  return {
    base: env.VITE_BASE_PATH,
    root: root,
    // 服务端渲染
    server: {
      port: env.VITE_PORT, // 端口号
      host: "0.0.0.0",
      open: env.VITE_OPEN === 'true',
      // 本地跨域代理. 目前注释的原因：暂时没有用途，server 端已经支持跨域
      proxy: {
        '/admin/': {
          target: 'http://localhost:3030',
          rewrite: ()=>'admin.html',
        },
        '/external/': {
          target: 'http://localhost:3030',
          rewrite: ()=>'external.html',
        },
        ['/admin-api']: {
          target: env.VITE_BASE_URL,
          ws: false,
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^/admin-api`), ''),
        },
        ['/ibps']: {
          target: env.VITE_BUSSINESS_URL,
          ws: false,
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^/ibps`), ''),
        }
      },
    },
    // 项目使用的vite插件。 单独提取到build/vite/plugin中管理
    plugins: createVitePlugins(),
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['legacy-js-api'],
          additionalData: '@use "./src/styles/variables.scss" as *;',
          javascriptEnabled: true
        }
      }
    },
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss', '.css'],
      alias: [
        {
          find: 'vue-i18n',
          replacement: 'vue-i18n/dist/vue-i18n.cjs.js'
        },
        {
          find: /\@\//,
          replacement: `${pathResolve('src')}/`
        }
      ]
    },
    build: {
      minify: 'terser',
      outDir: env.VITE_OUT_DIR || 'dist',
      sourcemap: env.VITE_SOURCEMAP === 'true' ? 'inline' : false,
      // brotliSize: false,
      terserOptions: {
        compress: {
          drop_debugger: env.VITE_DROP_DEBUGGER === 'true',
          drop_console: env.VITE_DROP_CONSOLE === 'true'
        }
      },
      rollupOptions: {
        input: {
          external: resolve(__dirname, 'external.html'),
          admin: resolve(__dirname, 'admin.html'),
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks: {
            echarts: ['echarts'] // 将 echarts 单独打包，参考 https://gitee.com/yudaocode/yudao-ui-admin-vue3/issues/IAB1SX 讨论
          },
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
        },
      },
    },
    optimizeDeps: { include, exclude }
  }
}
