FROM golang:1.23.5-alpine AS builder
WORKDIR /app
# Копируем файлы зависимостей
COPY go.mod go.sum ./
# Скачиваем зависимости
RUN go mod download
# Копируем исходный код
COPY . .
# Собираем приложение
RUN CGO_ENABLED=0 GOOS=linux go build -o app ./cmd/app
# Финальный образ
FROM alpine:latest
WORKDIR /app
# Установка необходимых пакетов
RUN apk --no-cache add ca-certificates tzdata
# Копируем бинарный файл из builder
COPY --from=builder /app/app .
# Копируем миграции
COPY migrations ./migrations
# Создаем директорию для загрузок
RUN mkdir -p /app/uploads
# Открываем порт
EXPOSE 8080
# Запускаем приложение
CMD ["./app"] 