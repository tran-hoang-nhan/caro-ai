# Caro AI - Cấu trúc dự án mới

Dự án Caro AI đã được chia thành hai phần riêng biệt:
1. **Backend (API)**: Nằm trong thư mục `caro-bot` (Python & Flask).
2. **Frontend (React + Vite)**: Nằm trong thư mục `frontend` (React).

---

## 1. Hướng dẫn chạy Backend (API)

Backend chạy bằng Python Flask để xử lý các nước đi của AI.

### Bước 1: Mở Terminal/Command Prompt
Di chuyển vào thư mục backend:
```bash
cd caro-bot
```

### Bước 2: Kích hoạt môi trường ảo (venv)
Môi trường ảo Python (`venv`) đã được chuyển vào trong thư mục `caro-bot`. Hãy kích hoạt nó:

* **Trên Windows (CMD):**
  ```cmd
  venv\Scripts\activate
  ```
* **Trên Windows (PowerShell):**
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
* **Trên macOS / Linux:**
  ```bash
  source venv/bin/activate
  ```

### Bước 3: Khởi chạy Flask Server
Sau khi môi trường ảo được kích hoạt, khởi động server API:
```bash
python app.py
```
Server backend sẽ chạy tại địa chỉ: `http://127.0.0.1:5000`

---

## 2. Hướng dẫn chạy Frontend (React + Vite)

Frontend sử dụng React và kết nối với Backend thông qua cấu hình Proxy của Vite.

### Bước 1: Mở một cửa sổ Terminal mới
Di chuyển vào thư mục frontend:
```bash
cd frontend
```

### Bước 2: Cài đặt các thư viện Node.js (nếu chạy lần đầu)
```bash
npm install
```

### Bước 3: Khởi chạy Frontend ở chế độ Develop
```bash
npm run dev
```

Vite sẽ hiển thị địa chỉ truy cập (thường là `http://localhost:5173` hoặc `http://localhost:5174`). Hãy click vào liên kết đó để mở game trong trình duyệt và bắt đầu chơi!