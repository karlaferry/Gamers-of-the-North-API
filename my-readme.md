# Gamers of the North API

## Background

**Gamers of the North** is the very first API project I created during my Northcoders Bootcamp. It supplies and serves information on boardgames and its categories, reviews, comments, and users.

Data was supplied by Northcoders, and I did the rest including:

- creation and seeding of databases using PostgreSQL and JavaScript, and connecting them
- creation of routers, controllers and modules, using the MVC design pattern
- handling requests and errors
- unit and integration testing using jest and supertest
- hosting with Heroku

## API

You may access the API [**HERE**](https://gamersofthenorth.herokuapp.com/api).

### Requirements

- Node minimum v12, recommended v14
- PostgreSQL v14.1
- Any API client, recommended: [Insomnia](https://insomnia.rest/download)

### Try It Out!

1. Fork this repo by clicking the **Fork** icon on the upper right.
2. Clone your forked repo by pasting this in your terminal:

```zsh
git clone https://github.com/YOUR_GIT_USERNAME/nc_games.git
```

> Make sure you are in the folder you want this repo to live in before cloning.

3. Install dependencies and devDependencies by running `npm install` in your terminal. These are all already in the package.json file.

4. Create these two .env files in the root folder. Dotenv will be using these .env files to connect you to the right database.

```
.env.test
.env.development
```

5. Now that our environment is ready, it's time to run the scripts. To begin, run the following in your terminal:

```
npm run start
npm run setup-dbs
```

> `npm run setup-dbs` creates the required databases for you, and `npm run start` instructs a local port to start listening.

6.  To make requests, open your preferred API client and make the requests there. Please refer to [`https://gamersofthenorth.herokuapp.com/api`](https://gamersofthenorth.herokuapp.com/api) for the request methods and paths available.
7.  To test the code, run `npm test` in your terminal.
8.  To stop the script, click anywhere in your terminal and press `CTRL+C` (for Windows and Mac).
