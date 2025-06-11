# Web Application (Next.js)

Web application của dự án NyNus, xây dựng với Next.js và tuân thủ cấu trúc monorepo.

## Cấu trúc thư mục

```
apps/web/
├── src/               # Mã nguồn chính của ứng dụng
│   ├── app/           # Next.js App Router
│   ├── components/    # React components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities và services
│   ├── store/         # State management
│   └── providers/     # Context providers
├── public/            # Static assets
├── .next/             # Build directory
└── [config files]     # Các file cấu hình
```

## Quy ước import

- Sử dụng path alias `@/` để import từ thư mục `src/`
- Ví dụ: `import { useAuth } from "@/hooks/use-auth";`
- Tránh sử dụng đường dẫn tương đối (relative paths) cho các thư mục sâu

## Cấu hình

- **Next.js**: Cấu hình trong `next.config.js`
- **TypeScript**: Cấu hình trong `tsconfig.json`
- **Tailwind CSS**: Cấu hình trong `tailwind.config.js`
- **ESLint**: Cấu hình trong `.eslintrc.js`

## Scripts

Chạy trong thư mục root của monorepo:

```bash
# Development
pnpm dev

# Build
pnpm build

# Lint
pnpm lint
```

## Best Practices

1. **Tất cả mã nguồn trong `src/`**: Luôn đặt mã nguồn trong thư mục `src/`
2. **Sử dụng path alias**: Sử dụng `@/` thay vì đường dẫn tương đối
3. **Tách biệt concerns**: Phân tách rõ ràng giữa UI, logic và data fetching
4. **Tái sử dụng từ packages**: Sử dụng shared UI và utilities từ packages 