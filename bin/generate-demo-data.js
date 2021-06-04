#!/usr/bin/env node

(async () => {
const assert = require('assert')
const path = require('path')
const config = require('../config')
const models = require('../models')
assert(!config.isProduction)

const nUsers = 10;
const nArticlesPerUser = 10;

const sequelize = models(path.dirname(__dirname));
await sequelize.sync({force: true})

// Users
const users = [];
for (var i = 0; i < nUsers; i++){
  const user = new sequelize.models.User({
    'username': `user${i}`,
    'email': `user${i}@mail.com`,
  })
  user.setPassword('asdf')
  await user.save()
  users.push(user)
}

// Follows
for (var i = 0; i < nUsers; i++) {
  const user = users[i % nUsers]
  await user.follow(users[(i + 1) % nUsers].id)
  await user.follow(users[(i + 2) % nUsers].id)
}

// Articles and favorites
const articles = [];
for (var i = 0; i < nUsers * nArticlesPerUser; i++){
  const userIdx = i % nUsers
  const article = new sequelize.models.Article({
    title: `My title ${i}`,
    description: `My description ${i}`,
    body: `My **body** ${i}`,
    authorId: users[userIdx].id,
  })
  await article.save()
  await users[(userIdx + 1) % nUsers].favorite(article.id)
  await users[(userIdx + 2) % nUsers].favorite(article.id)
  articles.push(article)
}

await sequelize.close();
})()

