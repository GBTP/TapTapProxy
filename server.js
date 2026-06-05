const express = require("express");
const {
  createProxyMiddleware,
  responseInterceptor,
} = require("http-proxy-middleware");

// ============================================================
// 配置项 —— 通过云引擎控制台的环境变量设置，不要写在代码里
// ============================================================
const ORIGIN = process.env.ORIGIN;
if (!ORIGIN) {
  console.error("[TapTapProxy] 缺少环境变量 ORIGIN，请在云引擎控制台设置");
  process.exit(1);
}

// 云引擎分配的端口
const PORT = parseInt(process.env.LEANCLOUD_APP_PORT || process.env.PORT || "3000", 10);

const app = express();

// 健康检查（云引擎要求 / 返回 2xx）
app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

// 反向代理 —— 转发所有 /api 请求到源站
app.use(
  createProxyMiddleware({
    target: ORIGIN,
    changeOrigin: true,
    pathFilter: "/api",
    selfHandleResponse: false,
    proxyTimeout: 300_000,
    timeout: 300_000,
    on: {
      proxyReq: (proxyReq, req) => {
        const clientIp =
          req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        proxyReq.setHeader("X-Real-IP", clientIp);
      },
      error: (err, _req, res) => {
        console.error("[proxy error]", err.message);
        if (!res.headersSent) {
          res.writeHead(502, { "Content-Type": "application/json" });
        }
        res.end(JSON.stringify({ message: "proxy error: " + err.message }));
      },
    },
  })
);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[TapTapProxy] listening on :${PORT}, forwarding to ${ORIGIN}`);
});
