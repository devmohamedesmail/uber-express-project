# Uber Backend API

A complete Node.js/TypeScript backend application for an Uber-like ride-sharing platform with authentication, database integration, and RESTful APIs.

## 🚀 Features

- **Complete Authentication System**: Register, Login, Logout, Profile management
- **Secure Password Handling**: bcrypt encryption with salt hashing
- **JWT Authentication**: Stateless authentication with JSON Web Tokens
- **MySQL Database**: Sequelize ORM for database operations
- **TypeScript**: Full type safety and modern JavaScript features
- **Express.js**: Fast and minimalist web framework
- **Environment Configuration**: dotenv for environment variable management
- **Hot Reload**: Development server with automatic restart on file changes

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **MySQL** (v8 or higher)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd uber-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=uber
   DB_PORT=3306

   # Server Configuration
   PORT=3000

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Set up MySQL Database**
   ```bash
   # Start MySQL service
   brew services start mysql  # macOS
   # or
   sudo systemctl start mysql  # Linux

   # Create database
   mysql -u root -p
   CREATE DATABASE uber;
   exit
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:3000`

## 📁 Project Structure

```
uber-backend/
├── src/
│   ├── config/
│   │   └── db.ts              # Database configuration
│   ├── controllers/
│   │   └── auth_controllors.ts # Authentication controllers
│   ├── middleware/
│   │   └── auth.ts            # JWT authentication middleware
│   ├── models/
│   │   └── User.ts            # User model (Sequelize)
│   ├── routes/
│   │   └── auth.ts            # Authentication routes
│   ├── types/
│   │   └── express.d.ts       # TypeScript type extensions
│   └── index.ts               # Main application entry point
├── .env                       # Environment variables
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## 🔗 API Endpoints

### Base URL
```
http://localhost:3000/auth
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| POST | `/logout` | Logout user | Yes |
| GET | `/profile` | Get user profile | Yes |
| PUT | `/update` | Update user info | Yes |
| DELETE | `/delete` | Delete account | Yes |

## 📖 API Documentation

### 1. Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "idenfier": "john@example.com",
  "password": "password123"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "idenfier": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "idenfier": "john@example.com",
  "password": "password123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "idenfier": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Get User Profile
**GET** `/auth/profile`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (Success - 200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "idenfier": "john@example.com"
  }
}
```

### 4. Update User Information
**PUT** `/auth/update`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body (all fields optional):**
```json
{
  "name": "John Smith",
  "idenfier": "johnsmith@example.com",
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

### 5. Delete Account
**DELETE** `/auth/delete`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "password": "password123"
}
```

## 🔧 Scripts

- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm test` - Run tests (placeholder)

## 🔐 Security Features

- **Password Encryption**: All passwords are hashed using bcrypt with salt
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all endpoints
- **Environment Variables**: Sensitive data stored in environment variables
- **CORS Ready**: CORS middleware included (commented, ready to enable)

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | localhost |
| `DB_USER` | MySQL username | root |
| `DB_PASSWORD` | MySQL password | (empty) |
| `DB_NAME` | Database name | uber |
| `DB_PORT` | MySQL port | 3306 |
| `PORT` | Server port | 3000 |
| `JWT_SECRET` | JWT signing secret | (required) |

## 🧪 Testing with cURL

### Register a new user:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","idenfier":"john@example.com","password":"password123"}'
```

### Login:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"idenfier":"john@example.com","password":"password123"}'
```

### Get Profile (replace YOUR_TOKEN):
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Make sure MySQL is running
   - Check database credentials in `.env`
   - Ensure the database exists

2. **Module Import Errors**
   - Run `npm install` to install dependencies
   - Check Node.js version (v18+ required)

3. **TypeScript Errors**
   - Make sure all dependencies are installed
   - Check `tsconfig.json` configuration

4. **JWT Token Errors**
   - Ensure `JWT_SECRET` is set in `.env`
   - Check token format in Authorization header

## 🚀 Deployment

### Production Setup

1. Set `NODE_ENV=production` in your environment
2. Use a strong `JWT_SECRET`
3. Set up proper database credentials
4. Enable CORS for your frontend domain
5. Use a process manager like PM2

### Example PM2 Configuration:
```json
{
  "name": "uber-backend",
  "script": "npm start",
  "env": {
    "NODE_ENV": "production",
    "PORT": 3000
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Your Name - Initial work

## 🔮 Future Enhancements

- [ ] Ride booking system
- [ ] Driver management
- [ ] Real-time location tracking
- [ ] Payment integration
- [ ] Rating and review system
- [ ] Admin dashboard
- [ ] Push notifications
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Rate limiting
- [ ] API documentation with Swagger

## 📞 Support

If you have any questions or issues, please create an issue in the repository or contact [your-email@example.com].

---

**Happy Coding! 🚗💨**
# uber-express-project
# uber-express-project
