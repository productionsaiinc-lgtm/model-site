const API_URL = "https://model-site-alpha.vercel.app/api";

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
