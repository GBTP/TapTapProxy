# TapTap 云引擎反向代理

将 TapTap 云引擎作为反向代理，为国内用户提供低延迟的 API 访问，同时隐藏源站 IP。

## 架构

```
国内用户 → TapTap 云引擎（国内 CDN）→ 源站服务器
```

## 部署步骤

### 1. 安装 TDS CLI

```bash
# macOS
brew install taptap/tds/tds

# Windows — 下载安装包
# https://developer.taptap.cn/docs/v3/sdk/engine/deploy/getting-started/
```

### 2. 登录并关联项目

```bash
cd TapTapProxy
tds login
tds switch   # 选择你的游戏项目
```

### 3. 配置环境变量

在 TapTap 开发者中心 → 游戏服务 → 云引擎 → 管理部署 → 你的分组 → 设置 → 自定义环境变量：

| 变量名   | 值                        | 说明       |
| -------- | ------------------------- | ---------- |
| `ORIGIN` | `https://your-server.com` | 源站地址   |

### 4. 部署

```bash
tds deploy --prod
```

### 5. 绑定自定义域名

在开发者中心 → 云引擎 → 设置 → 访问域名，绑定你的域名。

平台会自动处理 SSL 证书。

### 6. 源站安全加固（推荐）

为防止源站 IP 被直接访问，建议在源站 Nginx/防火墙层面限制来源：

- 只允许 TapTap 云引擎出口 IP
- 或在源站验证自定义请求头（在代理的 `proxyReq` 中添加 secret header）

## 本地测试

```bash
npm install
ORIGIN=https://your-server.com npm start
# 访问 http://localhost:3000/ 查看健康检查
# 访问 http://localhost:3000/api/... 验证代理转发
```

## 文件说明

| 文件               | 作用                          |
| ------------------ | ----------------------------- |
| `server.js`        | Express 反向代理服务          |
| `package.json`     | 依赖和启动脚本                |
| `leanengine.yaml`  | 云引擎运行配置                |

## 注意事项

- 体验实例（免费）有 18 小时/天限制且会休眠，正式使用建议至少 standard-512 实例
- 代理支持流式转发，不缓冲请求体，适合大文件上传场景
- 超时设为 5 分钟
