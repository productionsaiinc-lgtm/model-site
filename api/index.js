const express = require('express');
const router = express.Router();

const creators = require('./creators');
const posts = require('./posts');
const subscriptions = require('./subscriptions');

router.get('/creators', creators.getCreators);
router.get('/creators/:id', creators.getCreator);

router.get('/posts', posts.getPosts);
router.get('/posts/creator/:creatorId', posts.getCreatorPosts);

router.get('/subscriptions', subscriptions.getSubscriptions);
router.get('/subscriptions/check/:fanId/:creatorId', subscriptions.checkSubscription);

module.exports = router;
