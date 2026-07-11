const uploads = require('../data/uploads.json');

function getUploads(req,res){
  res.json(uploads);
}

function getCreatorUploads(req,res){
  const creatorUploads = uploads.filter(u => u.creatorId == req.params.creatorId);
  res.json(creatorUploads);
}

function createUpload(req,res){
  const upload = {
    id: uploads.length + 1,
    creatorId: req.body.creatorId,
    title: req.body.title,
    media: req.body.media,
    status: 'pending'
  };

  uploads.push(upload);
  res.json(upload);
}

module.exports={getUploads,getCreatorUploads,createUpload};
