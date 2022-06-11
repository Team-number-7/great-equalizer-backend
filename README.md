# Great Equalizer backend

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
