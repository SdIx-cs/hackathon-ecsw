// Load data from localStorage or initialize
let friends = JSON.parse(localStorage.getItem("greenFriends")) || [];
let posts = JSON.parse(localStorage.getItem("greenPosts")) || [];

// LOCAL STORAGE HELPERS
// Save friends array to localStorage
function saveFriends() {
  localStorage.setItem("greenFriends", JSON.stringify(friends));
}

// Save posts array to localStorage
function savePosts() {
  localStorage.setItem("greenPosts", JSON.stringify(posts));
}

// NAVIGATION
// Navigate back to main activity page
function goChallenge() {
  window.location.href = "home.html";
}

// FRIEND SYSTEM
// Render friends list
function renderFriends() {
  const list = document.getElementById("friendsList");
  list.innerHTML = "";

  friends.forEach((friend, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${friend}
      <button class="remove-btn" data-index="${index}">Remove</button>
    `;
    list.appendChild(li);
  });

  // Attach remove event listeners
  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const idx = e.target.dataset.index;
      friends.splice(idx, 1);
      saveFriends();
      renderFriends();
    });
  });
}

// Add a new friend
function addFriend() {
  const input = document.getElementById("friendInput");
  const name = input.value.trim();
  if (!name) return alert("Please enter a friend code!");
  friends.push(name);
  saveFriends();
  renderFriends();
  input.value = "";
}

// POST & FEED SYSTEM
// Render all posts in feed
function renderPosts() {
  const feed = document.getElementById("feed");
  feed.innerHTML = "";

  posts.forEach((postData, index) => {
    const post = document.createElement("div");
    post.className = "post";

    // Caption
    const caption = document.createElement("p");
    caption.innerText = postData.caption;
    post.appendChild(caption);

    // Image
    if (postData.image) {
      const img = document.createElement("img");
      img.src = postData.image;
      post.appendChild(img);
    }

    // Action buttons: Like & Delete
    const actions = document.createElement("div");
    actions.className = "actions";

    const likeBtn = document.createElement("button");
    likeBtn.className = "like-btn";
    likeBtn.innerText = `💚 Like (${postData.likes})`;
    likeBtn.addEventListener("click", () => {
      posts[index].likes++;
      savePosts();
      renderPosts();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "🗑 Delete";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.addEventListener("click", () => {
      posts.splice(index, 1);
      savePosts();
      renderPosts();
    });

    actions.appendChild(likeBtn);
    actions.appendChild(deleteBtn);
    post.appendChild(actions);

    // Comments section
    const commentsDiv = document.createElement("div");
    postData.comments.forEach(commentText => {
      const comment = document.createElement("p");
      comment.innerText = "🌱 " + commentText;
      commentsDiv.appendChild(comment);
    });

    // Comment input
    const commentInput = document.createElement("input");
    commentInput.className = "comment-input";
    commentInput.placeholder = "Write a comment...";
    commentInput.addEventListener("keypress", function(e) {
      if (e.key === "Enter" && commentInput.value.trim() !== "") {
        posts[index].comments.push(commentInput.value);
        savePosts();
        renderPosts();
      }
    });

    post.appendChild(commentsDiv);
    post.appendChild(commentInput);

    feed.appendChild(post);
  });
}

// Create a new post
function createPost() {
  const captionText = document.getElementById("caption").value;
  const imageInput = document.getElementById("imageInput");

  if (!captionText && imageInput.files.length === 0) {
    return alert("Add a caption or image!");
  }

  const newPost = { caption: captionText, image: null, likes: 0, comments: [] };

  if (imageInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function(e) {
      newPost.image = e.target.result;
      posts.unshift(newPost);
      savePosts();
      renderPosts();
    };
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    posts.unshift(newPost);
    savePosts();
    renderPosts();
  }

  // Reset input fields
  document.getElementById("caption").value = "";
  imageInput.value = "";
}

// EVENT LISTENERS 
document.getElementById("addFriendBtn").addEventListener("click", addFriend);
document.getElementById("goChallengeBtn").addEventListener("click", goChallenge);
document.getElementById("createPostBtn").addEventListener("click", createPost);

// INITIAL RENDER 
renderFriends();
renderPosts();