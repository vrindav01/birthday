// =======================
// SUPABASE CONFIG
// =======================

const SUPABASE_URL = "https://mgydpxdsotopjgpbyjnr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1neWRweGRzb3RvcGpncGJ5am5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NDk3OTMsImV4cCI6MjA5NDAyNTc5M30.PJGdPc2r8a2rDUkW1qwWd1lxWNaMnQYa6FYTv-4NmQ4";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Store image URLs globally
let allImages = [];

// =======================
// LOAD GALLERY
// =======================

async function loadGallery(){

  const galleryGrid =
    document.getElementById("galleryGrid");

  const { data, error } = await supabaseClient
    .storage
    .from("wishes")
    .list("", {
      limit: 100,
      sortBy: {
        column: "created_at",
        order: "desc"
      }
    });

  if(error){
    console.log(error);
    return;
  }

  data.filter(file => file.name.includes("wish"))
.forEach(file => {

    const imageUrl =
      `${SUPABASE_URL}/storage/v1/object/public/wishes/${file.name}`;

    allImages.push(imageUrl);

    const card = document.createElement("div");

    card.className = "card";

    card.innerHTML = `
      <img src="${imageUrl}" loading="lazy" />
    `;

    galleryGrid.appendChild(card);

  });

}

// =======================
// DOWNLOAD ALL AS PDF
// =======================

async function downloadAllAsPDF(){

  if(allImages.length === 0){
    alert("No wishes found");
    return;
  }

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  for(let i = 0; i < allImages.length; i++){

    const imageUrl = allImages[i];

    const img = await loadImage(imageUrl);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

const imgData = canvas.toDataURL("image/png");
    if(i > 0){
      pdf.addPage();
    }

// A4 page size
const pageWidth = 210;
const pageHeight = 297;

// Margins
const margin = 10;

// Available area
const maxWidth = pageWidth - margin * 2;
const maxHeight = pageHeight - margin * 2;

// Image ratio
const imgRatio = img.width / img.height;

// Calculate best fit without cropping
let renderWidth = maxWidth;
let renderHeight = renderWidth / imgRatio;

// If height exceeds page
if(renderHeight > maxHeight){
  renderHeight = maxHeight;
  renderWidth = renderHeight * imgRatio;
}

// Center image
const x = (pageWidth - renderWidth) / 2;
const y = (pageHeight - renderHeight) / 2;

pdf.addImage(
  imgData,
  "JPEG",
  x,
  y,
  renderWidth,
  renderHeight
);

  }

  pdf.save("birthday-wishes.pdf");

}

// =======================
// IMAGE LOADER
// =======================

function loadImage(url){

  return new Promise((resolve, reject) => {

    const img = new Image();

    img.crossOrigin = "anonymous";

    img.onload = () => resolve(img);

    img.onerror = reject;

    img.src = url;

  });

}

loadGallery();