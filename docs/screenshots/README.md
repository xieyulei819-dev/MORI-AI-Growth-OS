# 截图资产说明（已迁移）

作品集截图已统一迁移到 **`public/portfolio/`**，以便 `next` 直接以静态资源方式提供（加载更快，且支持点击放大）。

| 目录 | 规格 | 用途 |
| --- | --- | --- |
| `public/portfolio/desktop/` | 1440×900（deviceScaleFactor 1.25），JPEG | 作品集桌面端与 README |
| `public/portfolio/mobile/` | 390×844（deviceScaleFactor 2），JPEG | 作品集移动端展示 |

重新生成（需先 `npm run dev`）：

```bash
npm run screenshots
```

脚本会先真实点击 Market / Content / Creative / Campaign / Audience / Advisor / Settings 的 AI 按钮，
等待结果渲染完成后再截图，因此截到的是真实产品状态（AI 模式或自动回退状态都会如实呈现）。

> 旧的 PNG 截图（`docs/screenshots/*.png`）已删除：它们是改动前的过时版本，且体积是 JPEG 的 3 倍以上。
> 如需归档，可随时用上面的命令重新生成。
