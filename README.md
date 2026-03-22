# DevTree Backend
A backend API for DevTree, a platform that allows users to create customized profiles with links and manage their online presence.

## Project Description

DevTree is a "link tree" application (similar to Linktree) that allows users to:

- **Create customized profiles** with name, email, handle, and description
- **Manage links** associated with their profile
- **Upload profile images** using Cloudinary integration
- **Search for users** by their handle
- **Secure authentication** with JWT

## Prerequisites

- **Node.js** >= 22.0.0
- **npm** or equivalent
- **MongoDB** (local or remote connection)
- **Cloudinary** account for image management (optional)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd devtree/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Configure the following variables:
   ```env
   PORT=4000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/devtree
   JWT_SECRET=your_secure_jwt_secret
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

## Available Scripts

```bash
# Development with hot reload
npm run dev

# Compile TypeScript
npm run build

# Start compiled server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Project Structure

```
src/
├── config/           # Configuration files (DB, CORS, Cloudinary)
├── controllers/      # Controller logic
├── middleware/       # Middlewares (authentication, validations)
├── models/           # Mongoose models (User)
├── utils/            # Utilities (JWT, authentication, slugs)
├── tests/            # Test configuration
├── router.ts         # Route definitions
├── server.ts         # Express configuration
└── index.ts          # Entry point
```

## Main Endpoints

### Authentication

- **POST** `/api/auth/register` - Register a new user
  ```json
  {
    "handle": "john_doe",
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- **POST** `/api/auth/login` - Login
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

### User Profile (Requires authentication)

- **GET** `/api/user` - Get authenticated user's profile
- **PATCH** `/api/user` - Update profile information
  ```json
  {
    "handle": "new_handle",
    "name": "New Name",
    "description": "My description"
  }
  ```

- **PATCH** `/api/user/links` - Update profile links
  ```json
  {
    "links": [
      {
        "title": "My Blog",
        "url": "https://example.com"
      }
    ]
  }
  ```

- **POST** `/api/user/image` - Upload profile image

### Public Search

- **GET** `/api/:handle` - Get public profile of a user
- **POST** `/api/:search` - Search for user by handle

## Technologies Used

### Backend
- **Express.js** - Web framework
- **TypeScript** - Typed language
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **express-validator** - Data validation

### Storage
- **MongoDB** - NoSQL database
- **Cloudinary** - Image storage service

### Testing
- **Vitest** - Test runner
- **Supertest** - HTTP testing
- **mongodb-memory-server** - In-memory database for tests

### Development
- **Nodemon** - Automatic reload in development
- **TypeScript** - Static typing
- **ts-node** - Run TypeScript directly

## Data Models

### User
```typescript
{
  handle: string          // Unique user identifier
  name: string            // Full name
  email: string           // Unique email
  password: string        // Hashed password
  description: string     // Profile description
  image: string          // Profile image URL
  links: string          // JSON with user links
}
```

## Authentication

- Protected routes require a valid JWT token in the header:
  ```
  Authorization: Bearer <token>
  ```
- Tokens are generated when registering or logging in
- The token contains the user's `id`

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `MONGODB_URI` | MongoDB connection | `mongodb+srv://...` |
| `JWT_SECRET` | Key for signing tokens | `your_secure_secret` |
| `CLOUDINARY_NAME` | Cloudinary account name | `my_account` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - |

## Testing

The project includes unit and integration tests for:

- **Authentication** - Login and registration
- **Controllers** - Routes and business logic
- **Middleware** - Validations and authentication
- **Models** - User behavior

Run tests:
```bash
npm test                    # Single run
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

## CORS

CORS is configured to allow requests from specific origins. Adjust the configuration in `src/config/cors.ts` as needed.

## Contributing

1. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## License

ISC

## Author

Yamil Zavala

---

## Troubleshooting

### MongoDB connection fails
- Verify the `MONGODB_URI` in `.env`
- Ensure the database is accessible
- Check firewall/whitelist in MongoDB Atlas if using cloud

### Validation errors
- Email format must be valid
- Passwords must have a minimum of 8 characters
- Handle cannot be empty

### Cloudinary issues
- Verify that credentials are correct
- Check that the file is being sent correctly

## Support

To report issues, create an issue in the repository.
