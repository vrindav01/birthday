// =======================
// SUPABASE CONFIG
// =======================
const SUPABASE_URL = "https://mgydpxdsotopjgpbyjnr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1neWRweGRzb3RvcGpncGJ5am5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NDk3OTMsImV4cCI6MjA5NDAyNTc5M30.PJGdPc2r8a2rDUkW1qwWd1lxWNaMnQYa6FYTv-4NmQ4";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================================
// FETCH ALL ENTRIES AND EXPORT AS A .JSON FILE
// ========================================================
async function downloadAllAsJSON() {
  try {
    const { data, error } = await supabaseClient
      .from('wishes')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      alert("No wishes available to download yet!");
      return;
    }

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });

    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `all-birthday-wishes-${Date.now()}.json`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadLink.href);

  } catch (error) {
    console.error("Export operation failed:", error);
    alert("డేటాను JSON ఫైల్‌గా డౌన్‌లోడ్ చేయడం విఫలమైంది");
  }
}

// ========================================================
// FETCH & RENDER POSTCARD THEMED WISH CARDS
// ========================================================
async function fetchWishes() {
  const grid = document.getElementById("wishesGrid");
  const loading = document.getElementById("loading");

  if (loading) {
    loading.style.display = "block";
    loading.innerText = "Loading Cards ... 🎂";
  }
  if (grid) {
    grid.innerHTML = "";
  }

  try {
    const { data, error } = await supabaseClient
      .from('wishes')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      if (grid) {
        grid.innerHTML = `<p style="text-align:center; color:#999; grid-column: 1/-1;">No cards have been submitted yet!</p>`;
      }
      return;
    }

    if (grid) {
      data.forEach(item => {
        const postCardWrapper = document.createElement("div");
        postCardWrapper.className = "postcard"; // Identical card layout shell

        postCardWrapper.innerHTML = `
          <!-- TOP SECTOR MATCHING INDEX.HTML -->
          <div class="a6-card top-card">
            <div class="top-content">
              <p class="red-text">🎂 హలో, నాకు రెండేళ్లు వచ్చేశాయి. మీకు తెలుసా నాకు ఇప్పుడు పరిగెత్తడం ఎక్కడం దుంకడం అల్లరి చేయడం అన్ని వచ్చేశాయి 🎉</p>
              <p class="green-text">
                నాకు మాట్లాడటం కూడా వస్తుంది కానీ ఇంకా చదవటం రాయటం రాలేదు. అందుకే మీరంతా నా ఈ పుట్టిన రోజుకు మీ ఆశీస్సులను మరియు ఇంకొన్ని విషయాలను ఈ పోస్ట్ కార్డ్ ద్వారా పంపగలరా. మీ ఫోటో ని కూడా పెట్టడం మర్చిపోకండి 💖
              </p>
            </div>

            <!-- IMAGE CONTAINER PLACEMENT -->
            <div class="kid-photo-box-display">
              <img src="${item.image_url || 'https://via.placeholder.com/300x350?text=No+Photo'}" alt="User Avatar Image">
            </div>
          </div>

          <!-- BOTTOM SECTOR MATCHING INDEX.HTML -->
          <div class="a6-card bottom-card">
            <div class="wish-grid">

              <div class="label">మీ పేరు</div>
              <div class="wish-display-box">${item.name || ''}</div>

              <div class="label">నేను మిమ్మల్ని ఏమని పిలవాలి</div>
              <div class="wish-display-box">${item.nickname || ''}</div>

              <div class="label">నేను ఈ సంవత్సరం ఎలాంటి చిలిపి చేష్టలను నేర్చుకుని మా అమ్మ నాన్నలకు కోపం తెప్పించాలి</div>
              <div class="wish-display-box">${item.mischief || ''}</div>

              <div class="label">బర్త్డే విషెస్</div>
              <div class="wish-display-box" style="border-color: #ff6f91;">${item.birthday_wish || ''}</div>

            </div>
          </div>
        `;
        grid.appendChild(postCardWrapper);
      });
    }

  } catch (error) {
    console.error("Rendering process failed:", error);
    if (grid) {
      grid.innerHTML = `<p style="color:red; text-align:center; grid-column: 1/-1;">Error loading card assets from database.</p>`;
    }
  } finally {
    if (loading) {
      loading.style.display = "none";
    }
  }
}