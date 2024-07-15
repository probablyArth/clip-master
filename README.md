# clip-master

## Overview
`clip-master` is an application that offers REST APIs for managing video files, including features for uploading, trimming, merging, and sharing videos.

## Getting Started

These instructions will help you set up the project on your local machine for development and testing purposes.

### Prerequisites
- Node.js (v18 or higher)
- Yarn (v1.22 or higher)

## Features
- User Authentication
- Admin Management
- Video Upload
- Video Trimming
- Video Merging
- Video Download

## Technologies Used
- Node.js
- Express.js
- TypeScript
- SQLite (via Prisma ORM)
- fluent-ffmpeg for video processing
- Swagger for API Documentation

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/probablyarth/clip-master.git
    cd clip-master
    ```

2. Install the dependencies:

    ```bash
    yarn
    ```

3. Set up the database:

    ```bash
    npx prisma migrate dev
    ```

4. Copy environment variables to .env:

    ```bash
    cp .env.example .env
    ```

### Running the Application

1. Start the development server:

    ```bash
    yarn dev
    ```

2. The server will be running on `http://localhost:8000`.

### Linting:

    To run the linter:  

    ```bash
    yarn lint    
    ```

### Running tests:

1. To run the test suite:
    
    ```bash
    yarn test
    ```

### Building for Production

1. Build the application:

    ```bash
    yarn build
    ```

2. Start the production server:

    ```bash
    yarn start
    ```

### API Documentation

The API documentation is available via Swagger UI. You can access it at: https://app.swaggerhub.com/apis/BINODLABS/clip_master/1.0.0

## LICENSE
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
