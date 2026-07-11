document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".grid");
  if(!container || !window.NovaAPI) return;

  const creators = await NovaAPI.loadCreators();

  container.innerHTML = creators.map(c => `
    <div class="creator card">
      <h3>${c.displayName}</h3>
      <p>${c.bio}</p>
      <p>$${c.subscription}/month</p>
      <button onclick="location.href='creator.html?id=${c.id}'">View Profile</button>
    </div>
  `).join("");
});
