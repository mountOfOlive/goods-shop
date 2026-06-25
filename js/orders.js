(async () => {
  const session = await requireLogin();
  if (!session) return;

  await renderHeader();

  const { data: orders, error } = await _supabase
    .from("orders")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  const container = document.getElementById("orders");

  if (error || !orders) {
    container.innerHTML = '<p class="empty-msg">주문 내역을 불러오지 못했습니다.</p>';
    return;
  }

  if (orders.length === 0) {
    container.innerHTML = '<p class="empty-msg">주문 내역이 없습니다.<br><a href="index.html">상품 보러 가기</a></p>';
    return;
  }

  container.innerHTML = `<div class="order-list">${orders.map(o => `
    <div class="order-card">
      <div>
        <div class="order-name">${o.product_name}</div>
        <div class="order-date">${new Date(o.created_at).toLocaleString("ko-KR")}</div>
        <div class="order-qty">수량: ${o.quantity}개</div>
      </div>
      <div style="text-align:right">
        <div class="order-amount">${o.total_amount.toLocaleString()}원</div>
        <div class="order-status">${o.status === "paid" ? "결제완료" : o.status}</div>
      </div>
    </div>
  `).join("")}</div>`;
})();
