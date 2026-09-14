FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

ARG VITE_API_URL=/api/afisha
ARG VITE_CDN_URL=/content/afisha

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CDN_URL=$VITE_CDN_URL

RUN npm run build

FROM alpine:3.20

LABEL org.opencontainers.image.source="https://github.com/VickyRazgulyaeva/film-react-nest"

WORKDIR /app

COPY --from=builder /app/dist ./dist

CMD ["sh", "-c", "rm -rf /frontend-dist/* && cp -r /app/dist/. /frontend-dist && tail -f /dev/null"]