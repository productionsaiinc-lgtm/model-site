const posts = require('../data/posts.json');

function getPosts(req,res){
 res.json(posts);
}

function getCreatorPosts(req,res){
 const result = posts.filter(p => p.creatorId == req.params.creatorId);
 res.json(result);
}

module.exports={getPosts,getCreatorPosts};
