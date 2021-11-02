# 304CEM Book Lending service

This project was created as part of University curriculum

All tasks from the brief are complete. 
Project built using MySQL 8

This project is already set up and working in my codio box.

If you're running this locally for the first time, you have to run a command to set up tables in the database. First create the database and run `npm devDB:setup`. This command will create the necessary tables in the database. Default db name is 'books_db'.

If your mysql password is different, don't forget to change it inside package.json scripts

🐌 The tests takes a long time to run (40s in codio), so be patient! It is because the database is re-created before each test. This would be way faster if MySQL would work properly if ran in-memory like SQLite. 

```bash

# Install
npm i 

#Run
npm start

#Generate and view docs
npm run docs

#Tests
npm run test

#Drop db tables
npm run devDB:drop

#Create db tables
npm run devDB:setup

```
