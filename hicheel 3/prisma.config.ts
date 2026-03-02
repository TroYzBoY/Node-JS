import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: './prisma/schema.prisma',
})
```

---

### 3. `.env` файл шалга

`.env` файлд заавал байх ёстой:
```
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"