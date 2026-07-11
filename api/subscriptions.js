const subscriptions = require('../data/subscriptions.json');

function getSubscriptions(req,res){
 res.json(subscriptions);
}

function checkSubscription(req,res){
 const sub = subscriptions.find(s => s.fanId == req.params.fanId && s.creatorId == req.params.creatorId && s.status === 'active');
 res.json({active:!!sub});
}

module.exports={getSubscriptions,checkSubscription};
