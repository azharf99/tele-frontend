# Tele Gateway Frontend

Frontend aplikasi Tele Gateway yang dibangun dengan React, TypeScript, dan Vite. Aplikasi ini menggunakan TailwindCSS untuk styling dan terhubung ke backend API untuk mengelola gateway Telegram.

## 🚀 Fitur

- **Modern Tech Stack**: React 19, TypeScript, Vite
- **Styling**: TailwindCSS dengan komponen modern
- **Routing**: React Router DOM untuk navigasi
- **HTTP Client**: Axios untuk komunikasi API
- **UI Components**: Lucide React untuk ikon
- **Notifications**: React Hot Toast untuk notifikasi
- **Authentication**: JWT token management

## 📋 Prerequisites

Sebelum menginstall aplikasi ini, pastikan Anda telah menginstall:

- **Node.js** (versi 18 atau lebih tinggi)
- **npm** (biasanya sudah termasuk dengan Node.js) atau **yarn**
- **Backend API** yang berjalan (lihat konfigurasi environment)

## 🛠️ Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/azharf99/tele-gateway.git
cd tele-gateway/tele-frontend
```

### 2. Install Dependencies

```bash
# Menggunakan npm
npm install

# Atau menggunakan yarn
yarn install
```

### 3. Konfigurasi Environment

Salin file environment example dan sesuaikan dengan kebutuhan Anda:

```bash
cp .env.example .env
```

Edit file `.env` sesuai dengan konfigurasi API Anda:

```env
# API Configuration
VITE_API_URL=http://localhost:8080

# Untuk deployment di VPS, ubah ke:
# VITE_API_URL=http://your-vps-ip:8080
```

### 4. Jalankan Aplikasi

#### Development Mode

```bash
# Menggunakan npm
npm run dev

# Atau menggunakan yarn
yarn dev
```

Aplikasi akan berjalan di `http://localhost:5173`

#### Production Build

```bash
# Build untuk production
npm run build

# Preview build hasil
npm run preview
```

## 🌐 Deployment

### Local Development

1. Pastikan backend API berjalan di `http://localhost:8080`
2. Jalankan `npm run dev`
3. Buka `http://localhost:5173` di browser

### VPS Deployment

1. **Setup Environment**:
   ```bash
   # Clone repository
   git clone https://github.com/azharf99/tele-gateway.git
   cd tele-gateway/tele-frontend
   
   # Install dependencies
   npm install
   
   # Setup environment
   cp .env.example .env
   # Edit .env dengan IP VPS Anda
   ```

2. **Build Application**:
   ```bash
   npm run build
   ```

3. **Serve dengan Web Server** (contoh menggunakan nginx):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       root /path/to/tele-frontend/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

4. **Atau menggunakan PM2**:
   ```bash
   # Install serve globally
   npm install -g serve
   
   # Serve dengan PM2
   pm2 serve dist 80 --name tele-frontend
   ```

## 📦 Struktur Project

```
tele-frontend/
├── public/             # Static assets
├── src/               # Source code
│   ├── components/    # React components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom hooks
│   ├── utils/         # Utility functions
│   └── types/         # TypeScript types
├── .env.example       # Environment template
├── package.json       # Dependencies dan scripts
└── README.md          # Dokumentasi
```

## 🔧 Available Scripts

- `npm run dev` - Jalankan development server
- `npm run build` - Build untuk production
- `npm run lint` - Jalankan ESLint
- `npm run preview` - Preview production build

## 🤝 Kontribusi

Kontribusi sangat dihargai! Jika Anda ingin berkontribusi:

1. Fork repository
2. Buat branch baru (`git checkout -b feature/amazing-feature`)
3. Commit perubahan Anda (`git commit -m 'Add some amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buka Pull Request

## 📞 Kontak

Jika Anda memiliki pertanyaan atau butuh bantuan, jangan ragu untuk menghubungi:

- **Telegram**: [Azhar Faturohman](https://t.me/azhar_faturohman)
- **Email**: azharfaturohman29@gmail.com
- **Repository**: [https://github.com/azharf99/tele-gateway](https://github.com/azharf99/tele-gateway)
- **Status Actions**: [GitHub Actions](https://github.com/azharf99/tele-gateway/actions)

## 📄 License

Project ini dilisensi di bawah MIT License - lihat file LICENSE untuk detailnya.

## 🔗 Link Terkait

- [Backend Repository](https://github.com/azharf99/tele-gateway)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Vite Documentation](https://vitejs.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)
