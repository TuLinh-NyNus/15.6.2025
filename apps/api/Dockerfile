FROM node:18-alpine AS base

# Cài đặt pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Cài đặt các dependencies cần thiết
RUN apk add --no-cache libc6-compat

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép các file cấu hình
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* turbo.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/dto/package.json ./packages/dto/package.json
COPY packages/entities/package.json ./packages/entities/package.json

# Cài đặt dependencies
RUN pnpm install --frozen-lockfile

# Sao chép toàn bộ source code
COPY . .

# Build ứng dụng
RUN pnpm build

# Giai đoạn production
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Sao chép các file cần thiết từ giai đoạn build
COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY --from=base /app/apps/api/package.json ./apps/api/package.json
COPY --from=base /app/apps/api/prisma ./apps/api/prisma
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

# Thiết lập user không phải root để tăng tính bảo mật
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port và thiết lập lệnh khởi động
EXPOSE 5000
ENV PORT 5000

# Chạy migration và khởi động ứng dụng
CMD cd apps/api && npx prisma migrate deploy && node dist/main
