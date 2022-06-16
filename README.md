# Great Equalizer backend

[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![CircleCI](https://circleci.com/gh/Team-number-7/great-equalizer-backend/tree/main.svg?style=svg)](https://circleci.com/gh/Team-number-7/great-equalizer-backend/tree/main)

## Stack

- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Express](https://expressjs.com/) - Back end web application framework for Node.js
- [MongoDB](https://www.mongodb.com/) - Document-oriented NoSQL database
- [Docker](https://www.docker.com/) - Containerization platform
- [Jest](https://jestjs.io/) - JavaScript Testing Framework
- [InversifyJS](https://inversify.io/) - Inversion of control container
- [CircleCI](https://circleci.com/) - Continuous Integration and Delivery

## Project structure

```
$PROJECT_ROOT
└── dist
    ├── index.js            # Entry point
    ├── interfaces          # Interfaces
    ├── inversify.config    # IoC Container
    ├── Mongo               # DB class
    ├── Server              # Express app class
    ├── types               # Types
    └── cotrollers    
        └── TransactionController # Controller for app.* methods
```

## Set-up

Define your environment variables:
```bash
cp .env.example .env.production 
```

```bash
cp .env.example .env.development
```

```bash
cp .env.example .env.test
```
Put your values in a new files.


Install dependencies

```bash
npm install 
```

Run tests

```bash
npm run lint
```

```bash
npm run test
```



## Docker

Build Container

```bash
docker build -t containername:tag
```

To start MongoDB  

```bash
docker compose up -d
```


### Scripts

``npm run dev`` - start application in development mode

``npm run start`` - start application in production mode

``npm run build`` - build application into `/dist` directory

``npm run lint`` - run eslint

``npm run eslint:fix`` - run eslint with fixing

``npm run test`` - run jest


