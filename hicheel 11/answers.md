## Library Management System - Written Answers

### TASK Compare 1 - Monolith architecture-ийн давуу тал 3
1. Хийхэд амар, эхлүүлэхэд хурдан.
2. Deploy хийхэд амар (нэг app).
3. Debug хийхэд амар (нэг codebase).

### TASK Compare 2 - Monolith architecture-ийн сул тал 3
1. Томрох тусам удирдахад хэцүү.
2. Нэг хэсгийн алдаа бүх системд нөлөөлнө.
3. Scale хийхэд бүх app-г хамт scale хийх шаардлагатай.

### TASK Compare 3 - Microservice architecture-ийн давуу тал 3
1. Service тус бүрийг тусад нь scale хийж болно.
2. Team тус тусдаа ажиллах боломжтой.
3. Fault isolation сайн (нэг service унаад бусад нь ажиллаж чадна).

### TASK Compare 4 - Microservice architecture-ийн сул тал 3
1. Олон service удирдах төвөгтэй.
2. Network communication шаардлагатай.
3. Debug хийх төвөгтэй, data consistency асуудал гарна.

### TASK Compare 5 - Library system шиг жижиг системд аль нь илүү тохиромжтой вэ? Яагаад?
Жижиг системд monolith илүү тохиромжтой. Учир нь бүтэц энгийн, хөгжүүлэлт/деплой хурдан, багийн хэмжээ жижиг үед илүү үр ашигтай.

### TASK Compare 6 - Netflix, Uber шиг high-load system-д яагаад microservice илүү тохиромжтой вэ?
High-load үед тус тусын service-үүдийг бие даан scale хийх шаардлагатай болдог. Мөн олон баг зэрэг хөгжүүлэх, fault isolation хийх, өөр өөр технологи ашиглах хэрэгцээтэй байдаг тул microservice илүү тохиромжтой.

### CHALLENGE 3 - Borrow service уналаа гэж үзвэл
Monolith:
Borrow logic ажиллахгүй, нийт системд шууд нөлөөлнө (borrow/return зогсоно, бусад route ч доголдож болзошгүй).

Microservice:
Зөвхөн borrow-service ажиллахгүй; book/user service, gateway бусад endpoint-үүд хэвийн ажиллаж чадна (fault isolation).

### CHALLENGE 4 - Book service дээр ачаалал өсвөл
Monolith:
Нийт app-г бүхлээр нь scale хийх шаардлагатай (CPU/RAM нэмэх эсвэл олон instance).

Microservice:
Зөвхөн book-service-ийг тусад нь scale хийж болно (горизонталь scale).
