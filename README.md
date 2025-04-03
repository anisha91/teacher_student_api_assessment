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
  PORT=3001
  DB_HOST=localhost
  DB_USER=root
  DB_PASS=password
  DB_NAME=teacher_student_db
  DB_PORT=3306
   ```
4. Start the server:
   ```sh
   npm start
   ```
# If using MySQL Make sure MySQL is running on your machine and using the above mentioned config in .env file.

# If you are using Docker Ensure you have Docker and Docker Compose installed on your system.
 1. Configure the Environment for Docker
 2. Rename .env.example to .env and update the database credentials if needed:
  ```sh
  PORT=3001
  DB_HOST=localhost
  DB_USER=root
  DB_PASS=password
  DB_NAME=teacher_student_db
  DB_PORT=3306
  ```
 3. Build and Start the Containers
  ```sh
  docker-compose up --build -d
  ```
### This will:
Build the Node.js API container.
Set up the MySQL database container.

 4.  To check running containers:
```sh
docker ps -a
```
 5. To Verify Database Connection
    5.1 Access the database inside the container:
    ```sh
    docker exec -it node_project-db-1 mysql -u root -p
    ```
    5.2 Enter the password from .env.

# Stopping and Removing Containers
### To stop running containers:
```sh
docker-compose down
```
### To remove all containers and volumes:
```sh
docker-compose down -v
```
### To test
```sh
docker-compose run test
```

# Seeding and Migration
For the convenience we have provided the schema in database_schema.sql please run the file either in MySQL Client or Docker Container database with MySQL prompt.
## database schema file
Click here [database_schema.sql](/database_schema.sql)

# Running the Application
check if server is running else use
```sh
npm start
```
## Running Tests
To run unit tests:
```sh
npm test
```

# Running API Requests
### Use VS Code REST Client to test API requests in api.http:

#### Steps to Install and Use Rest Client
1. Install the **Rest Client** extension from the VSCode Marketplace.
2. Use a file named `api.http` inside the `src/tests` folder.
3. Click the **Send Request** option above each API request in VSCode to execute it.

Click here for API testing [api.http](/src/tests/api.http)

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
