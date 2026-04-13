# MAY Web — Project Context

## Genel Bakış
MAY yönetim paneli web uygulaması. Kullanıcı, rol ve yetki yönetimi sağlar.

## Teknoloji Stack
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 7
- **UI Library:** Ant Design 6
- **Routing:** React Router 7
- **HTTP Client:** Axios
- **Runtime:** Node 22 (build), Nginx Alpine (production)

## Proje Yapısı
```
src/
├── context/       # AuthContext (JWT auth)
├── layouts/       # MainLayout (sidebar + header)
├── pages/         # Dashboard, Users, Roles, Permissions, Settings, Login
├── services/      # api.ts (axios instance), authService, userService, roleService, permissionService
├── types/         # TypeScript type tanımları
├── App.tsx        # Route tanımları + Ant Design ConfigProvider
├── main.tsx       # Entry point
└── index.css      # Global stiller
```

## Kimlik Doğrulama
- JWT tabanlı (accessToken localStorage + refreshToken httpOnly cookie)
- Axios interceptor ile otomatik token yenileme

## API Bağlantısı
- Backend: `http://localhost:8090/api/v1` (VITE_API_BASE_URL ile override edilebilir)

## Docker
- **Port:** 8091
- **Image:** ozanemrahyakupoglu/may-web
- Multi-stage build: node:22-alpine (build) → nginx:alpine (runtime)

## Modüller
| Modül | Açıklama |
|-------|----------|
| Dashboard | Genel bakış (Kullanıcılar, Roller, Yetkiler) |
| Users | Kullanıcı CRUD |
| Roles | Rol yönetimi |
| Permissions | Yetki yönetimi |
| Settings | Uygulama ayarları |
