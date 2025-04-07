# Teacher-Student Management API

## Overview
This API provides endpoints for managing teacher-student relationships, including registration, retrieving common students, suspending students, and sending notifications.

## 1.0 Setup

### 1.1 Prerequisites
- Node.js installed
- MySQL database setup
- Docker (optional, for containerization)

### 1.2 Installation of application

Ensure that you have node version 18 or higher installed on your local machine.
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
```
PORT=3001
DB_HOST=your_db_host 
DB_USER=your_db_username
DB_PASS=your_db_password
DB_NAME=teacher_student_db
DB_PORT=your_db_port
```
> If you already have an instance of MySQL running locally, please ensure MySQL is running and make the relevant changes to the database configuration in the provided .env file. If you do not have MySQL on your local machine, you may choose to proceed with the optional database installation in the following section.

 ### 1.3 [Optional] Installation of MySQL database
For your convenience, a docker compose file has been provided for you to run a MySQL container to be used together with the application.
> You will need to have Docker installed on your local machine for the docker compose file to work. Please proceed to https://www.docker.com/ to download Docker.

1. Ensure Docker is installed in your local machine and is running in the background.
2. Check that the .env in the project root folder contains the following values:

```sh
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASS=password
DB_NAME=teacher_student_db
DB_PORT=3306
```
3. Build and start the MySQL container by running the following command in command prompt (Windows) or shell (Mac/Linux)

In application root folder where docker-compose.yml file exist, run this command
```sh
docker-compose up --build -d
```
  
4. Check that the MySQL container is running by entering the following command
```sh
docker  ps  -a
```

5. Verify Database Connection
- To verify the connection to the database within the container, you may run the following in your prompt after the container is running.
```sh
docker exec -it mysql_container mysql -u root -p
```
- Enter the password provided in the above .env
- If connected successfully, you should be able to see similar to the following which shows the MySQL CLI (command-line interface)
```
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 9
Server version: 9.2.0 MySQL Community Server - GPL

Copyright (c) 2000, 2025, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> 
```
- To exit the MySQL CLI, type the following at the mysql> prompt
```
mysql> exit
```

### 1.4 [Optional] Stopping and removing MySQL container
If there is a need to stop MySQL service after the application review, please type the following command in your prompt where the application root folder with docker-compose.yml file exists.
```sh
docker-compose down
```
### 1.5 Seeding and Migration
A SQL file is provided to both migrate the required database schema and to seed data for the tables used by the application. 

> To locate the prepared SQL file, click here [database_schema.sql](/database_schema.sql)
> The SQL schema is required for the application to work.
> The SQL seed data is optional 

To migrate the schema, you may use an MySQL/Database client or the MySQL CLI. The following will outline the steps to run the schema in MySQL CLI. If you are using the provided docker compose file please follow section 1.3.5 to connect to the MySQL CLI.

1. At the mysql> prompt run the following if the database is not yet created. If you are using the provided docker compose file, the database **teacher_student_db** should already be created and this step can be skipped.
```
mysql> create database teacher_student_db;
```
2. After the database is created, you may create the relevant tables with the provided database_schema.sql file. e.g. to create teachers table
```
mysql> use teacher_student_db
Database changed
mysql> CREATE TABLE teachers (
    ->     id INT AUTO_INCREMENT PRIMARY KEY,
    ->     email VARCHAR(255) UNIQUE NOT NULL
    -> );
```
3. Create all the tables in sequence in database_schema.sql, e.g. to create students table
```
mysql> CREATE TABLE students (
    ->     id INT AUTO_INCREMENT PRIMARY KEY,
    ->     email VARCHAR(255) UNIQUE NOT NULL,
    ->     suspended BOOLEAN DEFAULT FALSE
    -> );
```

## 2.0 Running the Application

### 2.1 Starting the application
Run the following command in the command prompt in the application root folder

```sh
npm start
```

### 2.2 Running Tests

To run unit tests:

```sh
npm test
```

### 2.3 Manually testing the API Requests

We recommend to use the  REST Client extension that can be installed in VSCode to test API requests.

#### Steps to Install and Use Rest Client

1. Install the **Rest Client** extension from the VSCode Marketplace.
2. Use a file named `api.http` inside the `src/tests` folder.
3. Click the **Send Request** option above each API request in VSCode to execute it.

> Click here for API testing file [api.http](/src/tests/api.http)

## 3.0 API Endpoint Documentation

### Register Students

**POST**  `/api/register`

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

**GET**  `/api/commonstudents?teacher=teacherken@gmail.com&teacher=teacherjoe@gmail.com`

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

**POST**  `/api/suspend`

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

**POST**  `/api/retrievefornotifications`

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