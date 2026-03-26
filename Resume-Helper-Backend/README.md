# Resume Helper Backend

The backend is an Express + TypeScript API for Resume Helper. It provides user authentication, resume upload and parsing, and ATS-style resume analysis against a job description.

## What It Does

- Registers and logs in users
- Connects to MongoDB with Mongoose
- Accepts authenticated resume uploads
- Parses PDF and DOCX resumes
- Extracts resume data such as skills, education, and experience
- Calculates an ATS-style score from resume content and a job description
- Stores uploaded resumes and analysis results in MongoDB

## Tech Stack

- Node.js
- Express 5
- TypeScript
- MongoDB + Mongoose
- JWT authentication
- Multer for file upload
- `pdf-parse` for PDF extraction
- `mammoth` for DOCX extraction

## Project Structure

```text
src/
  analysis/
    scoringEngine.ts             # ATS scoring logic
  config/
    db.ts                        # MongoDB connection
  controllers/
    UserController.ts            # register/login logic
    resumeController.ts          # upload + parse flow
    analysisController.ts        # ATS analysis flow
  middlewares/
    auth.ts                      # JWT auth middleware
    upload.ts                    # multer memory upload config
    centralizedErrorHandling.ts  # error middleware stub
    rolebasemiddleware.ts        # role-based guard helper
  models/
    UserModel.ts
    resume_model.ts
    analyis_model.ts
  routes/
    userRoutes.ts
    resumeRoutes.ts
  services/
    parser/
      parser_service.ts
      extractors/
        skills.extractor.ts
        education.extractor.ts
        experience.extractor.ts
  server.ts                      # app bootstrap
```

## Environment Variables

Create a `.env` file in the backend folder:

```env
MONGO_URI=mongodb://localhost:27017/resume-helper
PORT=3000
SECRET_KEY=your_jwt_secret
```

Required variables:

- `MONGO_URI`: MongoDB connection string
- `PORT`: API port
- `SECRET_KEY`: JWT signing secret

## Available Scripts

```bash
npm install
npm run dev
npm run build
npm start
```

## Server Startup

Application startup flow:

1. Load environment variables with `dotenv`
2. Create the Express app
3. Enable CORS and JSON body parsing
4. Mount user and resume routes
5. Connect to MongoDB
6. Start listening on the configured port

Base health route:

- `GET /`

Response:

```json
{
  "success": true,
  "message": "Resume Helper API is running"
}
```

## API Routes

Base route prefixes:

- `/api/user`
- `/api/resume`

### Auth Routes

#### `POST /api/user/register`

Registers a new user.

Request body:

```json
{
  "username": "Jeet",
  "email": "jeet@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "message": "User registered successfully",
  "token": "jwt-token",
  "user": {
    "_id": "user-id",
    "name": "Jeet",
    "email": "jeet@example.com"
  }
}
```

#### `POST /api/user/login`

Logs in an existing user and returns a JWT token plus basic profile info.

### Resume Routes

These routes require:

```http
Authorization: Bearer <token>
```

#### `POST /api/resume/upload`

Uploads and parses a resume file.

Accepted mime types:

- `application/pdf`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

Expected form data:

- `file`: uploaded resume

Success response includes the saved resume document.

#### `POST /api/resume/analyze`

Runs ATS-style scoring for a parsed resume.

Request body:

```json
{
  "resumeId": "mongo-document-id",
  "jobDescription": "Looking for a React developer with TypeScript and Node.js experience"
}
```

Success response includes:

- overall score
- label
- breakdown
- suggestions
- missing skills

## Data Models

### User

Fields:

- `username`
- `email`
- `password`
- `role`

### Resume

Fields:

- `user`
- `fileUrl`
- `parsedData`
- `status`

`parsedData` contains:

- `skills`
- `experience`
- `education`
- `projects`
- `rawText`

### Analysis

Fields:

- `resume`
- `score`
- `lable`
- `breakdown`
- `jobDescription`
- `suggestions`
- `missingSkills`

Note: the schema currently uses `lable` instead of `label`, and the frontend expects that same field name.

## Parsing Flow

Resume parsing is handled in `parser_service.ts`.

### PDF

- dynamically imports `pdf-parse`
- extracts raw text from the file buffer
- truncates parsed text before downstream extraction

### DOCX

- uses `mammoth.extractRawText`

### Extractors

Current extractor modules:

- `skills.extractor.ts`
- `education.extractor.ts`
- `experience.extractor.ts`

These generate the structured `parsedData` stored with the resume.

## Scoring Flow

ATS scoring is handled in `analysis/scoringEngine.ts`.

The score is built from weighted sections:

- keyword score
- skill score
- experience score
- format score
- section score
- readability score

The engine also returns:

- a score label
- missing skills
- improvement suggestions

## Authentication

The backend uses JWT-based authentication.

Flow:

1. User registers or logs in
2. Backend signs a JWT with `SECRET_KEY`
3. Frontend stores the token
4. Protected resume routes verify the token in `auth.ts`

## Current Limitations

- Request validation is minimal
- Error handling is not fully centralized yet
- Uploaded files are kept in memory during processing
- `fileUrl` is currently a placeholder value
- Experience extraction is still placeholder logic
- The analysis field name `lable` is misspelled but currently used as part of the existing API contract

## Future Improvements

- Add robust schema validation with Zod or Joi
- Add proper centralized error middleware
- Add persistent file storage instead of placeholder file URLs
- Improve parsing quality for projects and experience
- Add ownership checks for protected resume resources
- Add tests for auth, upload, parsing, and analysis
- Add rate limiting and stronger security hardening

## Development Notes

- The project is configured as ESM with `"type": "module"`
- TypeScript output is emitted to `dist/`
- The development server uses `tsx watch`
- MongoDB connection is established before the server starts listening
