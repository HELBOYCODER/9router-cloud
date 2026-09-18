# 9Router — AI Gateway & Provider Aggregator

<div dir="rtl">

## 🇮🇷 فارسی

**9Router** یک دروازه هوش مصنوعی (AI Gateway) متن‌باز و OpenAI-compatible است که چندین ارائه‌دهنده مدل (Provider) را در یک endpoint واحد ترکیب می‌کند. این پروژه ایده‌آل برای کسانی است که می‌خواهند مدل‌های رایگان و پولی مختلف را از یک مکان واحد مدیریت کنند.

### ✨ ویژگی‌ها

- **ترکیب چندین Provider**: Qwen، DeepSeek، Gemini، OpenAI، Z-AI (GLM)، Kimi و ده‌ها مدل دیگر
- **API سازگار با OpenAI**: استاندارد `/v1/chat/completions` — با هر ابزار سازگار با OpenAI کار می‌کند
- **Dاشبورد مدیریت**: رابط وبی برای مشاهده وضعیت، تست API و مدیریت Providerها
- **SQLite Database**: پیکربندی پایدار با قابلیت بازیابی
- **پشتیبانی از Cloud Sandbox**: قابل استقرار روی Daytona با Signed Proxy URL
- **خودکارآمد**: سینک کاتالوگ مدل‌ها، مدیریت API Key و failover بین Providerها

### 📋 ساختار پروژه

```
9router/
├── 9router-go              # باینری Go اصلی (Linux arm64)
├── 9router-dashboard.html  # داشبورد مدیریت وب
└── db/
    └── data.sqlite         # پایگاه داده پیکربندی
```

### 🚀 نحوه استفاده

#### 1. اجرای سرور
```bash
./9router-go --port 20128
```

#### 2. اتصال Providerها
از طریق داشبورد یا مستقیماً در دیتابیس SQLite:
```sql
INSERT INTO providerConnections (id, provider, authType, label, priority, isActive, config)
VALUES (uuid(), 'deepseek', 'apikey', 'My DeepSeek', 1, 1,
  '{"apiKey":"sk-xxx","baseUrl":"https://api.deepseek.com/v1/chat/completions"}');
```

#### 3. اتصال به Minis
```
Base URL: http://localhost:20128/v1
API Key:  sk-test
```

#### 4. استفاده در Daytona (Cloud Sandbox)
```bash
# اجرای سرور در Daytona
./9router-go --port 20128 &

# دریافت Signed Proxy URL
# URL: https://20128-{workspace-id}.daytonaproxy01.net
```

### 🔧 Providerهای پشتیبانی شده

| Provider | مدل‌ها | توضیحات |
|----------|--------|---------|
| **Qwen** | qwen3.8-max, qwen3.7-plus | از طریق Qwen Bridge (localhost:7860) |
| **DeepSeek** | deepseek-v4-flash | از طریق Freebuff Proxy (localhost:3457) |
| **Gemini** | gemini-2.5-flash, gemini-3-pro | از طریق OmniBridge (localhost:8899) |
| **OpenAI** | gpt-4o, gpt-4o-mini | از طریق ChatGPT-Web2API (localhost:8085) |
| **Z-AI** | glm-5.3-flash, glm-4.5 | از طریق Freebuff Proxy |

### 📊 داشبورد مدیریت

داشبورد وبی شامل:
- نمایش وضعیت آنلاین/آفلاین Providerها
- لیست مدل‌های موجود
- تست سریع API با ارسال پرامپت
- هماهنگ‌سازی کاتالوگ مدل‌ها

### ⚙️ پیکربندی

فایل پیکربندی در `db/data.sqlite` شامل:
- `providerConnections`: اتصالات Provider
- `apiKeys`: کلیدهای API
- `kv`: تنظیمات کلید-مقدار
- `combos`: ترکیبات مدل

### 🛡️ امنیت

- API Key پیش‌فرض: `sk-test` (برای تست)
- پشتیبانی از JWT Secret
- SSL/TLS Ready
- MITM Proxy اختیاری

### 📝 لایسنس

MIT License

---

</div>

## 🇬🇧 English

**9Router** is an open-source, OpenAI-compatible AI Gateway that aggregates multiple model providers into a single endpoint. Perfect for managing free and paid models from one place.

### ✨ Features

- **Multi-Provider Aggregation**: Qwen, DeepSeek, Gemini, OpenAI, Z-AI (GLM), Kimi, and dozens more
- **OpenAI-Compatible API**: Standard `/v1/chat/completions` — works with any OpenAI-compatible tool
- **Web Dashboard**: Management UI for status monitoring, API testing, and provider management
- **SQLite Database**: Persistent configuration with full recovery support
- **Cloud Sandbox Ready**: Deploy on Daytona with Signed Proxy URL
- **Auto-Discovery**: Model catalog sync, API key management, and provider failover

### 📋 Project Structure

```
9router/
├── 9router-go              # Main Go binary (Linux arm64)
├── 9router-dashboard.html  # Web management dashboard
└── db/
    └── data.sqlite         # Configuration database
```

### 🚀 Quick Start

#### 1. Run the Server
```bash
./9router-go --port 20128
```

#### 2. Configure Providers
Via dashboard or directly in SQLite:
```sql
INSERT INTO providerConnections (id, provider, authType, label, priority, isActive, config)
VALUES (uuid(), 'deepseek', 'apikey', 'My DeepSeek', 1, 1,
  '{"apiKey":"sk-xxx","baseUrl":"https://api.deepseek.com/v1/chat/completions"}');
```

#### 3. Connect to Minis
```
Base URL: http://localhost:20128/v1
API Key:  sk-test
```

#### 4. Deploy on Daytona (Cloud Sandbox)
```bash
# Run server in Daytona
./9router-go --port 20128 &

# Get Signed Proxy URL
# URL: https://20128-{workspace-id}.daytonaproxy01.net
```

### 🔧 Supported Providers

| Provider | Models | Notes |
|----------|--------|-------|
| **Qwen** | qwen3.8-max, qwen3.7-plus | Via Qwen Bridge (localhost:7860) |
| **DeepSeek** | deepseek-v4-flash | Via Freebuff Proxy (localhost:3457) |
| **Gemini** | gemini-2.5-flash, gemini-3-pro | Via OmniBridge (localhost:8899) |
| **OpenAI** | gpt-4o, gpt-4o-mini | Via ChatGPT-Web2API (localhost:8085) |
| **Z-AI** | glm-5.3-flash, glm-4.5 | Via Freebuff Proxy |

### 📊 Dashboard

Web dashboard features:
- Online/offline status for each provider
- Available model list
- Quick API testing with prompt input
- Model catalog synchronization

### ⚙️ Configuration

Database at `db/data.sqlite` contains:
- `providerConnections`: Provider connections
- `apiKeys`: API keys
- `kv`: Key-value settings
- `combos`: Model combinations

### 🛡️ Security

- Default API Key: `sk-test` (for testing)
- JWT Secret support
- SSL/TLS Ready
- Optional MITM Proxy

### 📝 License

MIT License
