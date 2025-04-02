# Teacher-Student Management API

## Overview
This API provides endpoints for managing teacher-student relationships, including registration, retrieving common students, suspending students, and sending notifications.

## Setup
### Prerequisites
- Node.js installed
- MySQL database setup
- Docker (optional, for containerization)

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/anisha91/teacher_student_api_assessment
   cd teacher_student_api_assessment
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure environment variables in `.env`:
   ```sh
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=teacher_student_db
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```sh
   npm start
   ```

## API Endpoints
### Register Students
**POST** `/api/register`
#### Request Body:
```json
{
  "teacher": "teacherken@gmail.com",
  "students": ["studentjon@gmail.com", "studentjane@gmail.com"]
}
```
#### Success Response:
```json
{
  "message": "Students registered successfully."
}
```

### Retrieve Common Students
**GET** `/api/commonstudents?teacher=teacherken@gmail.com&teacher=teacherjoe@gmail.com`
#### Success Response:
```json
{
  "students": [
    "commonstudent1@gmail.com",
    "commonstudent2@gmail.com"
  ]
}
```

### Suspend a Student
**POST** `/api/suspend`
#### Request Body:
```json
{
  "student": "studentjon@gmail.com"
}
```
#### Success Response:
```json
{
  "message": "Student suspended successfully."
}
```

### Retrieve for Notifications
**POST** `/api/retrievefornotifications`
#### Request Body:
```json
{
  "teacher": "teacherken@gmail.com",
  "notification": "Hello students! @studentagnes@gmail.com @studentmiche@gmail.com"
}
```
#### Success Response:
```json
{
  "recipients": [
    "studentbob@gmail.com",
    "studentagnes@gmail.com",
    "studentmiche@gmail.com"
  ]
}
```

## API Testing with Rest Client in VSCode
To test the API, you can use the [REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) in VSCode.

### Steps to Install and Use Rest Client
1. Install the **Rest Client** extension from the VSCode Marketplace.
2. Create a new file named `api.http` inside the `src/tests` folder.
3. Add API requests in the following format:

```http
### Register Students
POST http://localhost:3001/api/register
Content-Type: application/json

{
  "teacher": "teacherken@gmail.com",
  "students": ["studentjon@gmail.com", "studentjane@gmail.com"]
}

### Retrieve Common Students
GET http://localhost:3001/api/commonstudents?teacher=teacherken@gmail.com&teacher=teacherjoe@gmail.com

### Suspend a Student
POST http://localhost:3001/api/suspend
Content-Type: application/json

{
  "student": "studentjon@gmail.com"
}
```
# Send Notification
POST http://localhost:3000/api/retrievefornotifications
Content-Type: application/json

{
  "teacher": "teacherken@gmail.com",
  "notification": "Hello @studentagnes@gmail.com"
}

###

# Get All Notifications for a Teacher
GET http://localhost:3001/api/notifications?teacher=teacherken@gmail.com
Content-Type: application/json

4. Click the **Send Request** option above each API request in VSCode to execute it.

## Running Tests
To run unit tests:
```sh
npm test
```

## Deployment
To deploy with Docker:
```sh
docker-compose up --build
```

To test with Docker:
```sh
 docker-compose run test
```