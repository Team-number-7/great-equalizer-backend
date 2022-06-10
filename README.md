# Great Equalizer backend

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
