const users = require('../data/users.json');

function getUser(req,res){
 const user = users.find(u => u.id == req.params.id);
 if(!user) return res.status(404).json({error:'User not found'});
 res.json(user);
}

function checkRole(req,res){
 const user = users.find(u => u.id == req.params.id);
 if(!user) return res.status(404).json({error:'User not found'});
 res.json({role:user.role, verified:user.verified});
}

module.exports={getUser,checkRole};
