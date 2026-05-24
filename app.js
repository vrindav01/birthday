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
  const nameField = document.getElementById("cardName");
  const wishField = document.getElementById("cardWish");
  const growField = document.getElementById("cardGrow");
  const memoryField = document.getElementById("cardMemory");

  // Trim whitespace to ensure they didn't just press spacebars
  if (!nameField.value.trim() ||
      !wishField.value.trim() ||
      !growField.value.trim() ||
      !memoryField.value.trim()) {

    alert("దయచేసి అన్ని వివరాలను నింపండి! (Please fill out all the input fields!)");
    return; // Stop execution immediately
  }
  const postcard =
    document.getElementById("postcard");

  // Hide buttons while exporting
  document.querySelector(".action-area")
    .style.display = "none";

  // FIXED: Force recalculate heights for all textareas right before html2canvas runs
  const textareas = document.querySelectorAll(".wish-input");
  textareas.forEach(textarea => {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  });

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
    const previewImage =
      document.getElementById("previewImage");
    const uploadedImageUrl = previewImage.src;
    // Submit structured payload directly to Supabase table
    const { data: dbData, error: dbError } = await supabaseClient
      .from("wishes")
      .insert([
        {
          name: nameField.value.trim(),
          nickname: wishField.value.trim(),
          mischief: growField.value.trim(),
          birthday_wish: memoryField.value.trim(),
          image_url: uploadedImageUrl // <-- Now saving the Base64 string directly here
        }
      ]);

    if(dbError){
      console.log(error);
      alert("Upload failed");
      document.getElementById("loaderOverlay")
        .style.display = "none";
      return;
    }

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

    document.getElementById("loaderBox").style.display = "none";
    document.getElementById("successBox").style.display = "block";

  }, "image/png");
}

// =======================
// AUTO-GROW TEXTAREAS FOR HTML2CANVAS
// =======================

// FIXED: Active and uncommented so fields scale smoothly as the user types
document.addEventListener("DOMContentLoaded", () => {
  const textareas = document.querySelectorAll(".wish-input");

  textareas.forEach(textarea => {
    textarea.addEventListener("input", function() {
      // Reset height to calculate correctly
      this.style.height = "auto";
      // Set height to match the internal scroll height
      this.style.height = (this.scrollHeight) + "px";

      const currentLength = this.value.length;
    const maxLength = this.maxLength; // Reads whatever maxlength is set in HTML (e.g., 90 or 100)

    // If a limit is set and the user reaches it, trigger the alert
    if (maxLength > 0 && currentLength >= maxLength) {
      alert(`Maximum limit of ${maxLength} characters reached!`);
    }
    });
  });
});

// =======================
// PHOTO PREVIEW (HARD AUTOMATIC TOP-CENTER CROP)
// =======================

const photoInput =
  document.getElementById("photoInput");

const previewImage =
  document.getElementById("previewImage");

const uploadLabel = document.getElementById("uploadLabel");

const uploadPlaceholder =
  document.getElementById("uploadPlaceholder");

photoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(event) {
    const img = new Image();
    img.src = event.target.result;

    img.onload = function() {
      // Create a temporary canvas to physically crop the image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set your target box size dimensions (e.g., 400x400 for high resolution)
      const targetSize = 400;
      canvas.width = targetSize;
      canvas.height = targetSize;

      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = img.width;
      let sourceHeight = img.height;

      // Calculate aspect ratio cropping
      const imageRatio = img.width / img.height;

      if (imageRatio > 1) {
        // Landscape image: match height, crop sides equally, align to top
        sourceWidth = img.height;
        sourceX = (img.width - sourceWidth) / 2;
        sourceY = 0; // Lock to top
      } else {
        // Portrait image: match width, lock to top, cut off excess bottom
        sourceHeight = img.width;
        sourceX = 0;
        sourceY = 0; // Force crop from the very top center
      }

      // Draw the cropped image onto the canvas
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, targetSize, targetSize
      );

      // Convert the canvas content back to a perfectly cropped base64 string
      const croppedBase64 = canvas.toDataURL("image/png");

      // Display it in the preview image element
      previewImage.src = croppedBase64;
      previewImage.style.display = "block";

      uploadPlaceholder.style.display = "none";
    };
  };

  reader.readAsDataURL(file);
});