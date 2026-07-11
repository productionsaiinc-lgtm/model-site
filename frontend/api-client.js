const API_URL = "http://localhost:3000/api";

async function loadCreators(){
  const response = await fetch(`${API_URL}/creator/list`);
  return await response.json();
}

async function loadCreator(id){
  const response = await fetch(`${API_URL}/creator/${id}`);
  return await response.json();
}

async function loadCreatorPosts(id){
  const response = await fetch(`${API_URL}/creator/${id}/posts`);
  return await response.json();
}

window.NovaAPI = {
  loadCreators,
  loadCreator,
  loadCreatorPosts
};
