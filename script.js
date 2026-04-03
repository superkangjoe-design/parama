const whatsappNumber = "628211240029";
const defaultOrderMessage =
  "Halo admin Parama, saya tertarik dengan Parama Special Cream For Man. Mohon info paket terbaik, stok terbaru, dan cara pemesanannya.";
const pageOrderMessage = document.body.dataset.orderMessage?.trim() || defaultOrderMessage;
const trackingConfig = window.trackingConfig || {};
const currencyFormatter = new Intl.NumberFormat("id-ID");

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

const productCards = Array.from(document.querySelectorAll("[data-product-card]"));
const buyerTypeOptions = Array.from(document.querySelectorAll("[data-buyer-type-option]"));
const selectedProductName = document.getElementById("selected-product-name");
const selectedProductType = document.getElementById("selected-product-type");
const selectedProductPrice = document.getElementById("selected-product-price");
const selectedPaymentNote = document.getElementById("selected-payment-note");
const checkoutLink = document.getElementById("checkout-link");
const checkoutNote = document.getElementById("checkout-note");
const initialSelectedCard =
  productCards.find((card) => card.classList.contains("is-selected")) || productCards[0];

const checkoutState = {
  product:
    initialSelectedCard
      ? {
          id: initialSelectedCard.dataset.productId || "",
          packageLabel: initialSelectedCard.dataset.packageLabel || "Paket Satuan",
          name: initialSelectedCard.dataset.productName || "Parama 1 Pieces",
          type: initialSelectedCard.dataset.productType || "Pembelian satuan",
          price: Number(initialSelectedCard.dataset.productPrice || 0),
        }
      : null,
  buyerType: buyerTypeOptions[0]?.dataset.buyerType || "direct",
  buyerLabel: buyerTypeOptions[0]?.dataset.buyerLabel || "Pembeli Langsung",
};

function formatCurrency(amount) {
  return `Rp${currencyFormatter.format(amount)}`;
}

function getCheckoutMessage() {
  if (!checkoutState.product) {
    return pageOrderMessage;
  }

  const packageName = checkoutState.product.name.replace("Parama ", "");

  if (checkoutState.buyerType === "reseller") {
    return `Halo Admin Parama, saya ingin memesan ${checkoutState.product.packageLabel} (${packageName}) sebagai reseller. Mohon info harga reseller, minimal order, total biaya, dan nomor rekeningnya.`;
  }

  return `Halo Admin Parama, saya ingin memesan ${checkoutState.product.packageLabel} (${packageName}) sebagai pembeli langsung. Mohon info total biaya dan nomor rekeningnya.`;
}

function updateCheckoutUI() {
  if (!checkoutState.product) {
    return;
  }

  selectedProductName.textContent = `${checkoutState.product.packageLabel} (${checkoutState.product.name.replace("Parama ", "")})`;
  selectedProductType.textContent = checkoutState.product.type;
  selectedProductPrice.textContent = formatCurrency(checkoutState.product.price);
  selectedPaymentNote.textContent =
    `Setelah klik tombol pesan, Anda akan langsung masuk ke WhatsApp admin sebagai ${checkoutState.buyerLabel.toLowerCase()} dengan format order otomatis.`;
  checkoutNote.textContent =
    `Pesan WhatsApp siap dikirim untuk ${checkoutState.product.packageLabel} (${checkoutState.product.name.replace("Parama ", "")}) sebagai ${checkoutState.buyerLabel.toLowerCase()}.`;

  const checkoutMessage = getCheckoutMessage();
  const orderLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(checkoutMessage)}`;
  checkoutLink?.setAttribute("href", orderLink);
  checkoutLink?.setAttribute("target", "_blank");
  checkoutLink?.setAttribute("rel", "noreferrer");
}

productCards.forEach((card) => {
  card.querySelector("[data-select-product]")?.addEventListener("click", () => {
    productCards.forEach((item) => item.classList.remove("is-selected"));
    card.classList.add("is-selected");

    checkoutState.product = {
      id: card.dataset.productId || "",
      packageLabel: card.dataset.packageLabel || "Paket",
      name: card.dataset.productName || "Parama Special Cream For Man",
      type: card.dataset.productType || "Paket",
      price: Number(card.dataset.productPrice || 0),
    };

    updateCheckoutUI();

    if (typeof window.fbq === "function") {
      window.fbq("track", "ViewContent", {
        content_name: checkoutState.product.name,
        content_category: checkoutState.product.type,
        value: checkoutState.product.price,
        currency: "IDR",
      });
    }

    if (typeof window.ttq !== "undefined") {
      window.ttq.track("ViewContent", {
        content_name: checkoutState.product.name,
        content_type: "product",
        value: checkoutState.product.price,
        currency: "IDR",
      });
    }
  });
});

buyerTypeOptions.forEach((option) => {
  option.addEventListener("click", () => {
    buyerTypeOptions.forEach((item) => item.classList.remove("is-active"));
    option.classList.add("is-active");
    checkoutState.buyerType = option.dataset.buyerType || "direct";
    checkoutState.buyerLabel = option.dataset.buyerLabel || "Pembeli Langsung";
    updateCheckoutUI();
  });
});

checkoutLink?.addEventListener("click", () => {
  if (!checkoutState.product) {
    return;
  }

  if (typeof window.fbq === "function") {
    window.fbq("track", "InitiateCheckout", {
      content_name: checkoutState.product.name,
      value: checkoutState.product.price,
      currency: "IDR",
    });
  }

  if (typeof window.ttq !== "undefined") {
    window.ttq.track("InitiateCheckout", {
      content_name: checkoutState.product.name,
      value: checkoutState.product.price,
      currency: "IDR",
    });
  }
});

updateCheckoutUI();

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
