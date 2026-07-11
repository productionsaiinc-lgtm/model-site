const creators = require('../data/creators.json');

function getCreators(req,res){
 res.json(creators);
}

function getCreator(req,res){
 const creator = creators.find(c => c.id == req.params.id);
 if(!creator) return res.status(404).json({error:'Creator not found'});
 res.json(creator);
}

module.exports={getCreators,getCreator};
