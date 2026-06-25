(async () => {
  const session = await requireLogin();
  if (!session) return;

  await renderHeader();

  const container = document.getElementById("content");

  // 관리자 여부 확인
  const { data: profile } = await _supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", session.user.id)
    .single();

  if (!profile?.is_admin) {
    container.innerHTML = '<p class="empty-msg">관리자만 접근할 수 있습니다.</p>';
    return;
  }

  const { data: orders, error } = await _supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !orders) {
    container.innerHTML = '<p class="empty-msg">데이터를 불러오지 못했습니다.</p>';
    return;
  }

  if (orders.length === 0) {
    container.innerHTML = '<p class="empty-msg">결제 내역이 없습니다.</p>';
    return;
  }

  const total = orders.reduce((s, o) => s + o.total_amount, 0);

  container.innerHTML = `
    <p style="margin-bottom:16px;color:var(--text-sub);font-size:14px">
      총 ${orders.length}건 · 합계 <strong style="color:var(--primary)">${total.toLocaleString()}원</strong>
    </p>
    <div class="admin-table-wrap">
      <table>
        <thead>
          <tr>
            <th>주문일시</th>
            <th>구매자</th>
            <th>상품명</th>
            <th>수량</th>
            <th>금액</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>${orders.map(o => `
          <tr>
            <td>${new Date(o.created_at).toLocaleString("ko-KR")}</td>
            <td style="font-size:12px;color:var(--text-sub)">${o.user_id.slice(0,8)}…</td>
            <td>${o.product_name}</td>
            <td>${o.quantity}</td>
            <td>${o.total_amount.toLocaleString()}원</td>
            <td><span class="order-status">${o.status === "paid" ? "결제완료" : o.status}</span></td>
          </tr>
        `).join("")}</tbody>
      </table>
    </div>
  `;
})();
