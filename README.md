
````markdown
🎵 Hệ Thống Web Âm Nhạc - Spring Boot + React + MySQL

 📌 Mô tả
Dự án xây dựng một hệ thống web âm nhạc hỗ trợ quản lý người dùng, bài hát, danh sách phát, lượt thích, và gợi ý nhạc theo sở thích cá nhân.

---

 📦 Công nghệ sử dụng
--------------------|----------------------
| Thành phần        | Công nghệ           |
|-------------------|---------------------|
| Backend (API)     | Spring Boot         |
| Frontend          | ReactJS             |
| Cơ sở dữ liệu     | MySQL 9.0.1         |
| Công cụ build     | Maven               |
| Ngôn ngữ          | Java 17, JavaScript |
| Trình quản lý gói | npm                 | 
--------------------|----------------------


 ⚙️ Cài đặt hệ thống trên Windows

1. Cài đặt các phần mềm cần thiết
-----------------------------------------------------------------------------------------------------
| Phần mềm     | Tải tại     |                                                                      |
|---------------------------------------------------------------------------------------------------|
| JDK 17       | [https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html]     |
| Maven        | [https://maven.apache.org/download.cgi]                                            |
| MySQL 8.0.33 | [https://downloads.mysql.com/archives/installer/]　　　　　　　　　　　　　　　　　　　|
| Node.js (LTS)| [https://nodejs.org/]                                                              |
| IDE - VS Code| [https://code.visualstudio.com/download]                                           |
-----------------------------------------------------------------------------------------------------


 2. Tạo database trong MySQL

```sql
CREATE DATABASE music_app;
````

---

 🚀 Chạy ứng dụng

 🧩 Backend (Spring Boot)

1. Cấu hình file `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/music_app [tên cơ sở dữ liệu]
spring.datasource.username=root [nhập username trong cơ sở dữ liệu]
spring.datasource.password=your_password [nhập passwordpassword trong cơ sở dữ liệu]
spring.jpa.hibernate.ddl-auto=update
```

2. Build và chạy:

```bash
mvn clean compile
mvn spring-boot:run
```

---

 💻 Frontend (React)

1. Vào thư mục frontend (nơi chứa `package.json`):

```bash
npm install    chỉ cần chạy 1 lần
npm start      khởi chạy React app
```

> ✅ React đã được cấu hình sẵn script trong `package.json`.

---

 🌐 Truy cập

 Giao diện người dùng: [http://localhost:3000](http://localhost:3000)
 API backend: [http://localhost:8080](http://localhost:8080)

---

 📝 Ghi chú

 Đảm bảo MySQL đã chạy trước khi khởi động Spring Boot.
 Các dữ liệu ban đầu có thể được nhập tự động nếu bạn đã cấu hình `data.sql` hoặc `CommandLineRunner`.
 Để chỉnh sửa port, thay đổi trong:

   `React`: file `.env` (nếu có) hoặc cờ `--port`
   `Spring Boot`: file `application.properties`

---

 🧠 Tác giả

 Tên: Trần Khánh Duy
 Email: khazduy2003@gmail.com

```

