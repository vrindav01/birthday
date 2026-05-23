// =======================
// SUPABASE CONFIG
// =======================
const SUPABASE_URL = "https://mgydpxdsotopjgpbyjnr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1neWRweGRzb3RvcGpncGJ5am5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NDk3OTMsImV4cCI6MjA5NDAyNTc5M30.PJGdPc2r8a2rDUkW1qwWd1lxWNaMnQYa6FYTv-4NmQ4";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================================
// METHOD: FETCH ALL ENTRIES AND EXPORT AS A .JSON FILE
// ========================================================
async function downloadAllAsJSON() {
  try {
    // 1. Fetch all elements from your database table
    const { data, error } = await supabaseClient
      .from('wishes')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      alert("No wishes available to download yet!");
      return;
    }

    // 2. Format the retrieved data array into a clean string (indented with 2 spaces)
    const jsonString = JSON.stringify(data, null, 2);

    // 3. Transform the string data array into a native application/json file Blob
    const blob = new Blob([jsonString], { type: "application/json" });

    // 4. Set up an offline temporary hidden link node element in memory
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `all-birthday-wishes-${Date.now()}.json`;

    // 5. Place on document body layout structure, fire click event, and purge node link reference
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadLink.href);

  } catch (error) {
    console.error("Export operation failed:", error);
    alert("డేటాను JSON ఫైల్‌గా డౌన్‌లోడ్ చేయడం విఫలమైంది (Failed to export JSON raw data file)");
  }
}
// ========================================================
// FETCH & DISPLAY DATABASE ENTRIES
// ========================================================
async function fetchWishes() {
  const grid = document.getElementById("wishesGrid");
  const loading = document.getElementById("loading");

  // Pull latest database submissions (newest items listed first)
  const { data, error } = await supabaseClient
    .from('wishes')
    .select('*')
    .order('id', { ascending: false });

  // Hide the loading placeholder text once the database answers
  if (loading) {
    loading.style.display = "none";
  }

  if (error) {
    console.error(error);
    if (grid) {
      grid.innerHTML = `<p style="color:red; text-align:center;">Error pulling records from Supabase database table.</p>`;
    }
    return;
  }

  if (data.length === 0) {
    if (grid) {
      grid.innerHTML = `<p style="text-align:center; color:#999; grid-column: 1/-1;">No data forms submitted yet!</p>`;
    }
    return;
  }

  // Clear previous grid items if any exist
  if (grid) {
    grid.innerHTML = "";

    data.forEach(item => {
      const card = document.createElement("div");
      card.className = "wish-card";

      // Render base64 image data strings straight into img tags natively
      card.innerHTML = `
        <img src="${item.image_url || 'https://via.placeholder.com/300'}" alt="Uploaded User Avatar Crop">
        <div>
          <div class="field-group">
            <p class="field-title">👋 పేరు (Name):</p>
            <p class="field-value">${item.name || ''}</p>
          </div>

          <div class="field-group">
            <p class="field-title">💌 నిక్ నేమ్ (Nickname):</p>
            <p class="field-value">${item.nickname || ''}</p>
          </div>

          <div class="field-group">
            <p class="field-title">🌟 చిలిపి చేష్టలు (Mischief Details):</p>
            <p class="field-value">${item.mischief || ''}</p>
          </div>

          <div class="field-group">
            <p class="field-title">🍭 బర్త్డే విషెస్ (Birthday Wish):</p>
            <p class="field-value">${item.birthday_wish || ''}</p>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }
}

// Execute the fetching routine as soon as the file loads
fetchWishes();