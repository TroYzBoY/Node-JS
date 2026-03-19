# DAY 1 — Docker + Container Architecture (5 цаг)

**Хичээлийн зорилго**
Энэ хичээлийн дараа сурагч:
- Container гэж юу болох
- Docker яагаад backend хөгжүүлэлтэд стандарт болсон
- Production system дээр container яагаад зайлшгүй хэрэгтэй
гэсэн суурь ойлголтыг авна.

**1-р цаг — Containerization гэж юу вэ?**
**Traditional Deployment (Docker байхгүй үед)**
Developer Machine
 |
 v
 Source Code
 |
 v
 Server

Server дээр дараах setup хийгдэнэ:
- Node install
- Python install
- MySQL install
- Dependencies install
- тохиргоонууд

**Бодит асуудал**
Developer computer:
- Node 18
- MySQL 8
- Ubuntu

Production server:
- Node 20
- MySQL 5.7
- CentOS

**Result:** Код ажиллахгүй
Developer хэлдэг:
“Миний computer дээр бол ажиллаж байсан”

**Энэ асуудлын нэр**
Software engineering дээр үүнийг:
- Environment problem
- Works on my machine problem
гэдэг.

**Container Solution**
Docker энэ асуудлыг шийддэг.
Container дотор:
- Application
- Dependencies
- Runtime
- OS layer

Server дээр зөвхөн:
- Docker Engine
байхад хангалттай.

**Production системийн жишээ — Netflix**
Service
 |
 Docker Image
 |
 Container
 |
 Kubernetes
 |
 Millions of users

Netflix:
100,000+ containers ажиллуулдаг.

**Container яагаад чухал вэ?**
Backend developer production дээр 3 асуудалтай тулгардаг.
- Environment problem
- Deployment problem
- Scaling problem

Docker шийднэ.

**Container Architecture**
Host OS
 |
 Docker Engine
 |
 Container
 Container
 Container

Container бүр тусдаа application ажиллуулна.

**2-р цаг — Virtual Machine vs Container**
**Virtual Machine Architecture**
Hardware
 |
 Host OS
 |
 Hypervisor
 |
 VM1
 VM2
 VM3

VM бүр:
- Full OS
- Application

**VM сул тал**
- Heavy
- Slow startup
- Large resource usage

VM startup:
30–60 секунд

**Container Architecture**
Hardware
 |
 Host OS
 |
 Docker Engine
 |
 Container
 Container
 Container

Container:
- Application
- Dependencies

Startup:
1–2 секунд

**Resource comparison**
Technology RAM
- VM ~2GB
- Container ~50MB

**Production example — Uber**
Uber system architecture:
- Trip Service
- Payment Service
- Driver Service
- Location Service

Эдгээр нь бүгд Docker containers дотор ажилладаг.

**3-р цаг — Docker Image ба Container**
**Docker Image**
Image = template
Blueprint

Example:
- node:20
- python:3.11
- mysql:8
- redis:7

**Container**
Container = running instance of image

Image → Container

Example:
node:20 image
Container A
Container B
Container C

**Docker Lifecycle**
Dockerfile
 |
 Build
 |
 Image
 |
 Run
 |
 Container

**Docker Commands**
Image татах:
```bash
docker pull node:20
```

Container run:
```bash
docker run node
```

Container list:
```bash
docker ps
```

Container stop:
```bash
docker stop <container_id>
```

**Backend System Example**
School system:
- Frontend
- Backend API
- Database
- Cache

Docker architecture:
- React container
- Node API container
- MySQL container
- Redis container

**4-р цаг — Dockerfile**
Dockerfile = Image build script

Example:
```dockerfile
FROM node:20
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node","server.js"]
```

**Dockerfile тайлбар**
- FROM: Base image (node:20)
- WORKDIR: Container working directory (/app)
- COPY: Local file → container (package.json)
- RUN: Command execute (npm install)
- CMD: Application start command (node server.js)

Image build:
```bash
docker build -t school-api .
```

Container run:
```bash
docker run -p 3000:3000 school-api
```

**Production pipeline example**
GitHub
 |
 CI/CD
 |
 Docker Build
 |
 Docker Registry
 |
 Kubernetes

**5-р цаг — Docker Compose**
Production system:
- API
- Database
- Cache
- Queue

Эдгээрийг тус тусад нь run хийх нь хэцүү.

**Docker Compose Solution**
```yaml
version: "3"
services:
  api:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: school
  redis:
    image: redis
```

System run:
```bash
docker compose up
```

Architecture:
Client
 |
 API container
 |
 MySQL container
 |
 Redis container

**Production advantage**
Developer machine:
```bash
docker compose up
```

Production server:
```bash
docker compose up
```

Environment identical.

**Production Pipeline**
Developer
 |
 GitHub
 |
 CI/CD
 |
 Docker Image
 |
 Registry
 |
 Kubernetes

**Лаборатори даалгавар**
**LAB 1 — Node API container**
- Dockerfile бич
- Image build
- Container run

**LAB 2 — Multi container system**
System:
- Node API
- MySQL
- Redis

Docker Compose ашиглах

**LAB 3 — Architecture diagram**
Client
 |
 API container
 |
 Database container
 |
 Cache container

Сурагч өөрийн backend системийн container architecture зурна.

**Хичээлийн төгсгөлд сурагч ойлгосон байх**
- Container гэж юу вэ
- Docker яагаад хэрэгтэй
- Image vs Container
- Dockerfile хэрхэн ажилладаг
- Docker Compose ямар асуудал шийддэг

**Практик — Backend + Frontend хамт**
Доорх бүтэц нь энэ фолдерт бэлэн болсон:
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `docker-compose.yml`

**Асгах командууд**
```bash
docker compose up --build
```

**Шалгах**
- Backend: `http://localhost:4000/`
- Health: `http://localhost:4000/health`
- Frontend: `http://localhost:5173/`

**Тайлбар**
- `backend` нь Express дээр ажиллаж байгаа энгийн API.
- `frontend` нь Vite build хийж `nginx` дээр static байдлаар serve хийнэ.
- `db` (MySQL) болон `redis` нь compose-д орсон ба backend аль хэдийн холбогдсон.

**Backend CRUD endpoint-ууд**
- `GET /students`
- `GET /students/:id`
- `POST /students` (body: `{ "name": "...", "email": "..." }`)
- `PUT /students/:id` (body: `{ "name": "...", "email": "..." }`)
- `DELETE /students/:id`

**Prisma migration (локал ажиллуулах үед)**
```bash
cd backend
npx prisma migrate dev --name init_student
npx prisma generate
```

**.env тохиргоо**
- Локал: `DATABASE_URL="mysql://root:root@localhost:3306/school"`
- Docker: `DATABASE_URL`-г `docker-compose.yml` дээр `db` host-оор өгсөн.

**Seed (faker.js)**
```bash
cd backend
npm install
npm run seed
```

Хэрэв олон өгөгдөл хүсвэл:
```bash
SEED_COUNT=100 npm run seed
```

**Docker compose-оор seed хийх**
```bash
docker compose up --build seed
```

**Frontend demo**
Frontend дээр жишээ UI бэлэн болсон бөгөөд backend‑ийн CRUD‑тай холбогдоно.
