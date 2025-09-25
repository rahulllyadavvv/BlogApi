# 📝 Blog API

A full-featured **RESTful Blog API** built with **Node.js, Express, and MongoDB**.  
This API provides **secure user authentication, role-based authorization, CRUD operations, comments, likes, bookmarks, advanced admin analytics (via MongoDB aggregation pipelines), OTP-based password reset, and Cloudinary avatar uploads** — making it a **complete backend solution for any blogging platform**.

---

## ✨ Features

### 🔐 Authentication & Security
- **JWT-based Authentication**
- **Access & Refresh Token** with cookies (Session management)
- Secure password hashing with **bcrypt**
- **Role-based Authorization** (Admin / User)

### 👤 User Management
- Register & Login
- Logout with token invalidation
- Update user details (username, email)
- Update password (with old password verification)
- **Forget Password using OTP via Email (Nodemailer + Ethereal)**
- Reset password with OTP
- Upload/Update user avatar with **Cloudinary + Multer**
- View user bookmarks

### 📝 Blog Management
- Create, Read, Update, Delete (CRUD) blogs
- Search & filter blogs (by title, content, category, tags)
- Pagination & sorting
- Get blog by ID with **views count tracking**
- Add/Remove comments
- Add/Remove likes
- Bookmark/Remove bookmark blogs

### 📊 Admin Analytics (Aggregation Pipelines)
Admins can access insights such as:
- **Trending Blogs** (based on views, likes & recency)
- **Most Liked Blogs**
- **Most Commented Blogs**
- **Most Active Authors** (blogs count, total likes, views)
- **Category Distribution**

---

## 🛠 Tech Stack
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB with Mongoose ODM  
- **Authentication:** JWT (Access & Refresh tokens)  
- **Security:** bcrypt, cookies, CORS  
- **Email Service:** Nodemailer + Ethereal (for OTP)  
- **File Uploads:** Multer + Cloudinary (avatars)  
- **Testing:** Postman / Thunder Client  
- **Env Management:** dotenv  

---

## 📂 API Endpoints

### 🔐 Auth Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/` | Register user |
| `POST` | `/api/login` | Login user |
| `POST` | `/api/logout` | Logout user |
| `POST` | `/api/refreshAccessToken` | Refresh access token |
| `POST` | `/api/forgetPassword` | Request OTP for password reset |
| `POST` | `/api/resetPasswordWithOtp` | Reset password with OTP |
| `POST` | `/api/updatePassword` | Update password |
| `POST` | `/api/updateUserDetails` | Update username/email |
| `POST` | `/api/uploadAvatar` | Upload user avatar |

---

### 📝 Blog Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/blogs` | Create blog |
| `GET` | `/api/blogs` | Get all blogs (with pagination, search, filters) |
| `GET` | `/api/blogs/:id` | Get blog by ID (+ increment views) |
| `PUT` | `/api/blogs/:id` | Update blog (only author) |
| `DELETE` | `/api/blogs/:id` | Delete blog (author/admin only) |

---

### 💬 Comment Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/blogs/:id/comments` | Add comment |
| `DELETE` | `/api/blogs/:blogId/comments/:id` | Remove comment (author/admin/comment author) |

---

### 👍 Like Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/blogs/:id/likes` | Like a blog |
| `DELETE` | `/api/blogs/:id/removeLike` | Remove like |

---

### 🔖 Bookmark Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users/bookmarks/:id` | Bookmark blog |
| `DELETE` | `/api/users/bookmarks/:id` | Remove bookmark |
| `GET` | `/api/users/bookmarks` | Get all bookmarks of user |

---

### 📊 Admin Analytics (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics/topliked` | Get top liked blogs |
| `GET` | `/api/analytics/trending` | Get trending blogs |
| `GET` | `/api/analytics/mostCommented` | Get most commented blogs |
| `GET` | `/api/analytics/mostActiveAuthors` | Get most active authors |
| `GET` | `/api/analytics/categoryDistribution` | Get category distribution |

---

# Start development server
npm run dev
