# Yu-Gi-Oh Server API

Backend API để quản lý deck của các nhân vật trong game.

## Cài đặt

```bash
cd server
npm install
```

## Cấu hình

File `.env` đã được tạo với:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/yugioh_game
```

## Chạy

### 1. Khởi động MongoDB
Đảm bảo MongoDB đang chạy trên máy của bạn.

### 2. Seed dữ liệu mẫu (optional)
```bash
npm run server:seed
```

Lệnh này sẽ tạo 2 nhân vật mẫu:
- Yugi Muto (với Dark Magician deck)
- Seto Kaiba (với Blue-Eyes White Dragon deck)

### 3. Khởi động server
```bash
npm run dev
```

Hoặc chạy cả client và server:
```bash
# Từ thư mục root
npm run dev
```

## API Endpoints

### Characters

- `GET /api/characters` - Lấy tất cả nhân vật
- `GET /api/characters/:name` - Lấy nhân vật theo tên
- `POST /api/characters` - Tạo nhân vật mới
- `PUT /api/characters/:name/deck` - Cập nhật deck
- `PUT /api/characters/:name/stats` - Cập nhật thống kê (win/loss)
- `DELETE /api/characters/:name` - Xóa nhân vật

### Ví dụ tạo nhân vật mới

```json
POST /api/characters
{
  "name": "Joey Wheeler",
  "description": "Master of Red-Eyes Black Dragon",
  "avatar": "url_to_avatar",
  "deck": {
    "main": [
      {
        "id": 74677422,
        "name": "Red-Eyes Black Dragon",
        "type": "Normal Monster",
        "atk": 2400,
        "def": 2000,
        "level": 7,
        "race": "Dragon",
        "attribute": "DARK"
      }
    ],
    "extra": []
  }
}
```

## Database Schema

### Character Model
```javascript
{
  name: String (unique),
  description: String,
  avatar: String,
  deck: {
    main: [Card],
    extra: [Card]
  },
  stats: {
    wins: Number,
    losses: Number,
    totalDuels: Number
  },
  timestamps: true
}
```

### Card Schema
```javascript
{
  id: Number,
  name: String,
  type: String,
  desc: String,
  atk: Number,
  def: Number,
  level: Number,
  race: String,
  attribute: String,
  image_url: String
}
```
