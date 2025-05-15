# FurniSwap

## Запуск проекта через Docker

### Предварительные требования
- Docker и Docker Compose
- Git

### Шаги для запуска

1. Клонируйте репозиторий:
```bash
git clone <URL репозитория>
cd furniswap_deploy
```

2. Запустите проект с помощью Docker Compose:
```bash
docker-compose up -d
```

3. Проверьте, что все контейнеры запущены:
```bash
docker-compose ps
```

4. Откройте приложение в браузере:
```
http://localhost
```

### Структура проекта

- `/backend` - Go бэкенд
- `/frontend` - React фронтенд
- `/nginx` - Конфигурация Nginx

### Службы в Docker Compose

- **db**: PostgreSQL база данных
- **backend**: Go бэкенд 
- **frontend**: React фронтенд
- **nginx**: Nginx прокси

### Инициализация базы данных

База данных PostgreSQL инициализируется при первом запуске контейнера в следующем порядке:
1. `backend/migrations/01-init.sql` - основная структура базы данных
2. `backend/migrations/02-init2.sql` - дополнительные таблицы и данные

Чтобы добавить больше файлов инициализации, добавьте их в папку `backend/migrations` и укажите в `docker-compose.yml`.

### Работа с проектом

- База данных доступна внутри контейнеров по адресу `db:5432`
- Бэкенд API доступен по адресу `http://localhost/api`
- Фронтенд доступен по адресу `http://localhost`
- Загруженные файлы доступны по пути `http://localhost/uploads/<имя_файла>`

### Остановка проекта

```bash
docker-compose down
```

Для остановки и удаления всех данных (включая базу данных):
```bash
docker-compose down -v
``` 