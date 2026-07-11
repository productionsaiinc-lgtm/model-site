async function createUpload(){
 const title = document.getElementById('upload-title').value;
 const media = document.getElementById('upload-media').value;

 const response = await fetch('http://localhost:3000/api/uploads', {
  method:'POST',
  headers:{
   'Content-Type':'application/json',
   'x-user-role':'creator'
  },
  body:JSON.stringify({
   creatorId:1,
   title,
   media
  })
 });

 return await response.json();
}

window.createUpload=createUpload;
