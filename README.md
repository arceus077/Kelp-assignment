# Kelp Assignment

## Description
Kelp Assignment is a web application built with Node.js, Express, and PostgreSQL. It's designed to demonstrate a simple server setup that can handle CRUD operations, manage connections to a PostgreSQL database, and provide a foundation for further development.

## Features
- RESTful API endpoints
- Integration with PostgreSQL for data storage (Support for both local and remote PostgreSQL instances)
- CSV file processing to JSON for database insertion
- Environment variable management with dotenv

## Prerequisites
Before you begin, ensure you have met the following requirements:
- Node.js installed (v18.18 or later recommended), execute:
    nvm use
- PostgreSQL installed and running on your machine if using local database
- npm (Node Package Manager)

## Installation
To install Kelp Assignment, follow these steps:

1. Clone the repository:
- git clone https://github.com/arceus077/Kelp-assignment.git
2. Install the necessary dependencies:
- npm install

## Configuration
Add/Edit environment-specific values in .env file, if using a local PostgreSQL or a custom CSV file

For example:
- DB_HOST=localhost
- DB_USER=myuser
- DB_PASS=mypassword
- DB_NAME=mydatabase
- CSV_FILE_PATH=./data.csv

## Running the Application
To run the application in development mode with Nodemon, execute:
- npm run dev

To start the application normally, use:
- npm start

## API Endpoints
GET /age-distribution: Fetches age distribution data from a CSV file, stores it in the database, and returns the data. Also, consoles the age distribution data for quick viewing.
