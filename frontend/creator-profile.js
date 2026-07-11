document.addEventListener("DOMContentLoaded", async () => {
  if (!window.NovaAPI) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return;

  const creator = await NovaAPI.loadCreator(id);
  const posts = await NovaAPI.loadCreatorPosts(id);

  const title = document.querySelector("h2");
  if (title) title.textContent = creator.displayName;

  const profile = document.querySelector(".creator");
  if (profile) {
    profile.innerHTML = `
      <h3>${creator.displayName}</h3>
      <p>${creator.bio}</p>
      <p>$${creator.subscription}/month</p>
      <button>Subscribe</button>
    `;
  }

  const postArea = document.querySelector(".grid");
  if (postArea) {
    postArea.innerHTML = posts.map(post => `
      <div class="card">
        <h3>${post.title}</h3>
        <p>${post.locked ? "Subscribers only" : "Public"}</p>
        <button>${post.locked ? "Unlock" : "View"}</button>
      </div>
    `).join("");
  }
});
