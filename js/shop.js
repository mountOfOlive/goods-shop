(async () => {
  await renderHeader();

  const session = await getSession();
  const container = document.getElementById("products");

  const { data: products, error } = await _supabase
    .from("products")
    .select("*")
    .order("created_at");

  if (error || !products) {
    container.innerHTML = '<p class="empty-msg">상품을 불러오지 못했습니다.</p>';
    return;
  }

  container.innerHTML = `<div class="products-grid">${products.map(p => `
    <div class="product-card">
      <img src="${p.image_url || 'https://placehold.co/400x400?text=No+Image'}" alt="${p.name}" loading="lazy">
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-price">${p.price.toLocaleString()}원</div>
        <button class="btn-buy" onclick="buy('${p.id}','${p.name}',${p.price})"
          ${session ? "" : "disabled title='로그인 후 구매 가능'"}>
          ${session ? "구매하기" : "로그인 후 구매"}
        </button>
      </div>
    </div>
  `).join("")}</div>`;
})();

async function buy(productId, productName, price) {
  const session = await getSession();
  if (!session) {
    location.href = "auth.html";
    return;
  }

  const toss = TossPayments(TOSS_CLIENT_KEY);
  const orderId = "order_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);

  try {
    await toss.requestPayment("카드", {
      amount: price,
      orderId,
      orderName: productName,
      customerName: session.user.email,
      successUrl: location.origin + "/goods-shop/success.html?productId=" + productId + "&productName=" + encodeURIComponent(productName),
      failUrl: location.origin + "/goods-shop/fail.html",
    });
  } catch (e) {
    if (e.code !== "USER_CANCEL") {
      alert("결제 오류: " + e.message);
    }
  }
}
