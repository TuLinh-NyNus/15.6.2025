FROM node:18-alpine AS base

# Cài đặt pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép các file cấu hình
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* turbo.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/tsconfig/package.json ./packages/tsconfig/package.json

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
COPY --from=base /app/apps/web/.next ./apps/web/.next
COPY --from=base /app/apps/web/public ./apps/web/public
COPY --from=base /app/apps/web/package.json ./apps/web/package.json
COPY --from=base /app/apps/web/next.config.js ./apps/web/next.config.js
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

# Thiết lập user không phải root để tăng tính bảo mật
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port và thiết lập lệnh khởi động
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Chạy ứng dụng
CMD ["node", "apps/web/node_modules/.bin/next", "start", "-p", "3000", "--dir", "apps/web"]
