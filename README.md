# Music Streaming Backend

A scalable, real-time music streaming backend built with Node.js, Express, MongoDB, and Socket.io.

## Features

- **Song Management**: Upload (MP3 + Thumbnails), Paginate, and Filter by Category.
- **Real-time Sync**: Sync playback (play, pause, seek) across all users in a room (Max 5).
- **Efficient Streaming**: Serve MP3 files using HTTP range headers to avoid loading the full file at once.
- **Scalability**: Indexed category field, response compression, and modular room management (migratable to Redis).
- **Security**: Basic rate limiting and file type validation.

## Tech Stack

- **Node.js** & **Express.js**
- **MongoDB** (Mongoose)
- **Socket.io** (Synchronization)
- **Multer** (File uploads)
- **Compression** (gzip)

## Project Structure

```text
├── config/             # Database configuration
├── controllers/        # Route logic
├── middleware/         # Security, uploads, & error handlers
├── models/             # Song schema
├── routes/             # API routes
├── services/           # Business logic (Streaming, Rooms)
├── sockets/            # Real-time event handling
├── uploads/            # Local storage for files
└── index.js            # Server entry point
```

## Setup & Use

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file from the example:
```bash
cp .env.example .env
```
Update `MONGODB_URI` if necessary.

### 3. Start the Server
```bash
# Development
node index.js
```

## API Endpoints

- `GET /songs`: Get all songs (paged, filterable by `category`)
- `GET /songs/:id`: Get single song metadata
- `POST /songs/upload`: Upload song (`song` as mp3 and `thumbnail` as image)
- `GET /songs/stream/:filename`: Stream song with range support

## Socket Events

Connect to the server and use these events:
- `create_room`: Create a new room with a unique ID.
- `join_room`: Join an existing room (Max 5 users).
- `play`: Sync playback start across members.
- `pause`: Sync playback pause across members.
- `seek`: Sync playback time position.
