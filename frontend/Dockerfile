FROM node:21-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Финальный образ с Nginx для раздачи статики
FROM nginx:stable-alpine

# Копируем собранные файлы из builder в директорию Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Копируем нашу конфигурацию Nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"] 