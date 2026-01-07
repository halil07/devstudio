# DevStudio

Tarayıcı tabanlı web geliştirme IDE'si. Geliştiricilerin kod yazmasını, düzenlemesini ve çalıştırmasını tarayıcı üzerinden gerçekleştirmesini sağlar.

![DevStudio](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![Vite](https://img.shields.io/badge/Vite-7.2.4-purple)

## 🚀 Özellikler

- **Kod Editörü**: Monaco Editor (VS Code'un editörü) ile söz dizimi vurgulama
- **Dosya Yönetimi**: Sanal ve yerel dosya sistemi desteği
- **Canlı Önizleme**: Çalışan uygulamaların gerçek zamanlı önizlemesi
- **Terminal Entegrasyonu**: Build çıktıları ve loglar için yerleşik terminal
- **WebContainer Entegrasyonu**: StackBlitz WebContainer API ile Node.js uygulamalarını doğrudan tarayıcıda çalıştırın

## 🛠️ Teknolojiler

### Core Framework & Build Tools
- **React 19.2.0** - Concurrent özellikli en son React
- **TypeScript 5.9.3** - Tip güvenli geliştirme
- **Vite 7.2.4** - Hızlı build aracı ve dev server
- **Tailwind CSS 3.4.19** - Utility-first CSS framework

### Ana Kütüphaneler
- **@monaco-editor/react** - React için Monaco editor
- **@webcontainer/api** - Tarayıcıda Node.js çalıştırmak için WebContainer
- **xterm** - Tarayıcı için terminal emülatörü
- **lucide-react** - Modern ikon kütüphanesi

## 📁 Proje Yapısı

```
devstudio/
├── src/
│   ├── components/              # React bileşenleri
│   │   ├── FileTree.tsx         # Dosya gezgini
│   │   ├── Header.tsx           # Üst toolbar
│   │   ├── MonacoEditor.tsx     # Kod editörü
│   │   ├── TabBar.tsx           # Dosya sekme yönetimi
│   │   └── Terminal.tsx         # Terminal çıktısı
│   ├── lib/                     # Çekirdek kütüphaneler
│   │   ├── fileSystem.ts        # Sanal dosya sistemi
│   │   ├── localFileSystem.ts   # Yerel dosya sistemi
│   │   └── webcontainer.ts      # WebContainer yönetimi
│   ├── types/
│   │   └── index.ts             # TypeScript tipleri
│   ├── App.tsx                  # Ana uygulama bileşeni
│   └── main.tsx                 # Uygulama giriş noktası
├── public/                      # Statik dosyalar
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── eslint.config.js
```

## 🏃 Kurulum ve Çalıştırma

### Geliştirme Ortamı

```bash
# Bağımlılıkları yükle
pnpm install

# Geliştirme sunucusunu başlat
pnpm dev
```

### Build

```bash
# Production build oluştur
pnpm build
```

### Preview

```bash
# Production build önizleme
pnpm preview
```

### Lint

```bash
# ESLint çalıştır
pnpm lint
```

## 📦 Ana Bileşenler

### Header
- Proje markası
- Yerel klasör açma butonu
- Reset butonu
- Run/Stop dev server kontrolleri
- Preview toggle

### FileTree
- Özyineli dosya ağacı görüntüleme
- Genişletilebilir/daraltılabilir dizinler
- Dosya türü ikonları ve renk kodlaması
- Aktif dosya vurgulama

### MonacoEditor
- Tam VS Code editör deneyimi
- Çoklu dil için söz dizimi vurgulama
- Koyu tema
- Minimap, satır numaraları, word wrap
- Otomatik formatlama

### TabBar
- Çoklu dosya sekmeleri
- Değiştirilmiş dosya göstergesi
- Aktif sekme vurgulama
- Sekme kapatma

### Terminal
- Gerçek zamanlı çıktı görüntüleme
- Renk kodlu çıktı türleri
- ANSI escape sequence temizleme
- Otomatik scroll

## 🔧 Çekirdek Kütüphaneler

### VirtualFileSystem
- Bellek içi dosya sistemi
- Varsayılan proje şablonu (Vite + React)
- Dosya CRUD işlemleri
- Dizin ağacı oluşturma

### LocalFileSystem
- Tarayıcı File System Access API entegrasyonu
- Klasör seçici ile okuma/yazma izinleri
- .gitignore deseni desteği
- Özyineli dizin yükleme

### WebContainerManager
- WebContainer başlatma ve ilkleme
- Dosya montajı
- Bağımlılık yükleme (pnpm)
- Dev server yönetimi
- Preview URL için server-ready olayları

## 🌐 Tarayıcı Gereksinimleri

- File System Access API desteği olan modern tarayıcı
- WebContainer için gerekli başlıklar (yapılandırılmış)
- Chromium tabanlı tarayıcılarda en iyi performans

## 📝 Lisans

Bu proje açık kaynak kodludur.
