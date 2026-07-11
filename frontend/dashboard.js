document.addEventListener("DOMContentLoaded", async () => {
 const stats = document.querySelector(".grid");
 if(!stats) return;

 stats.innerHTML = `
 <div class="card"><h3>Content</h3><p>Create and manage posts</p><button>Upload</button></div>
 <div class="card"><h3>Subscribers</h3><p>Manage memberships</p></div>
 <div class="card"><h3>Revenue</h3><p>Track earnings</p></div>
 `;
});
