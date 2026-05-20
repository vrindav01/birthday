// =======================
// SUPABASE CONFIG
// =======================

const SUPABASE_URL = "https://mgydpxdsotopjgpbyjnr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1neWRweGRzb3RvcGpncGJ5am5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NDk3OTMsImV4cCI6MjA5NDAyNTc5M30.PJGdPc2r8a2rDUkW1qwWd1lxWNaMnQYa6FYTv-4NmQ4";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// =======================
// GENERATE & UPLOAD
// =======================

async function generateWishCard(){

  const postcard =
    document.getElementById("postcard");

  // Hide buttons while exporting
  document.querySelector(".action-area")
    .style.display = "none";

  await document.fonts.ready;

  const canvas = await html2canvas(postcard, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff"
  });

  document.querySelector(".action-area")
    .style.display = "block";
document.getElementById("loaderOverlay")
  .style.display = "flex";
  canvas.toBlob(async (blob) => {

    const fileName =
      `wish-${Date.now()}.png`;

    // Upload to Supabase
    const { data, error } =
      await supabaseClient
      .storage
      .from("wishes")
      .upload(fileName, blob);

    if(error){
      console.log(error);
      alert("Upload failed");
      document.getElementById("loaderOverlay")
        .style.display = "none";
      return;
    }

    const { data: publicData } =
      supabaseClient
      .storage
      .from("wishes")
      .getPublicUrl(fileName);
//document.getElementById("loaderOverlay")
//  .style.display = "none";
    // Reload page after short delay
//    setTimeout(() => {
//      window.location.reload();
//    }, 1200);

document.getElementById("loaderBox").style.display = "none";
    document.getElementById("successBox").style.display = "block";

  }, "image/png");
}

// =======================
// PHOTO PREVIEW
// =======================

const photoInput =
  document.getElementById("photoInput");

const previewImage =
  document.getElementById("previewImage");

const uploadPlaceholder =
  document.getElementById("uploadPlaceholder");

photoInput.addEventListener("change", (e) => {

  const file = e.target.files[0];

  if(!file) return;

  const reader = new FileReader();

  reader.onload = function(event){

    previewImage.src = event.target.result;

    previewImage.style.display = "block";

    uploadPlaceholder.style.display = "none";

  };

  reader.readAsDataURL(file);

});