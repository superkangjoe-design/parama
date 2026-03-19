const whatsappNumber = "628112424010";
const defaultOrderMessage =
  "Halo admin Parama, saya tertarik dengan Parama Special Cream For Man. Mohon info paket terbaik, stok terbaru, dan cara pemesanannya.";
const pageOrderMessage = document.body.dataset.orderMessage?.trim() || defaultOrderMessage;
const trackingConfig = window.trackingConfig || {};

if (
  typeof window.fbq === "function" &&
  trackingConfig.metaPixelId &&
  trackingConfig.metaPixelId !== "PASTE_META_PIXEL_ID"
) {
  window.fbq("init", trackingConfig.metaPixelId);
  window.fbq("track", "PageView");
}

if (
  typeof window.ttq !== "undefined" &&
  trackingConfig.tiktokPixelId &&
  trackingConfig.tiktokPixelId !== "PASTE_TIKTOK_PIXEL_ID"
) {
  window.ttq.load(trackingConfig.tiktokPixelId);
  window.ttq.page();
}

document.querySelectorAll("[data-order-link]").forEach((link) => {
  const orderMessage = link.dataset.orderMessage?.trim() || pageOrderMessage;
  const orderLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderMessage)}`;
  link.setAttribute("href", orderLink);
  link.setAttribute("target", "_blank");
  link.setAttribute("rel", "noreferrer");
  link.addEventListener("click", () => {
    if (typeof window.fbq === "function") {
      window.fbq("track", "Contact");
      window.fbq("trackCustom", "WhatsAppClick", {
        destination: "WhatsApp",
        product: "Parama Special Cream For Man",
      });
    }

    if (typeof window.ttq !== "undefined") {
      window.ttq.track("ClickButton", {
        content_name: "Parama Special Cream For Man",
        content_type: "product",
        button_name: "WhatsApp Order",
      });
      window.ttq.track("Contact");
    }
  });
});

document.getElementById("copy-order")?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(pageOrderMessage);
    const note = document.getElementById("order-note");
    if (note) {
      note.textContent = "Template order berhasil disalin. Tinggal kirim ke calon pembeli atau admin.";
    }
    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", "CopyOrderTemplate", {
        product: "Parama Special Cream For Man",
      });
    }
    if (typeof window.ttq !== "undefined") {
      window.ttq.track("ClickButton", {
        content_name: "Parama Special Cream For Man",
        button_name: "Copy Order Template",
      });
    }
  } catch (error) {
    const note = document.getElementById("order-note");
    if (note) {
      note.textContent =
        "Clipboard tidak tersedia di browser ini. Template order: " + pageOrderMessage;
    }
  }
});

document.getElementById("year").textContent = new Date().getFullYear();

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  {
    threshold: 0.16,
  }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
