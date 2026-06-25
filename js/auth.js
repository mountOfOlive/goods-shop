const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getSession() {
  const { data } = await _supabase.auth.getSession();
  return data.session;
}

async function requireLogin() {
  const session = await getSession();
  if (!session) {
    location.href = "/goods-shop/auth.html";
    return null;
  }
  return session;
}

async function logout() {
  await _supabase.auth.signOut();
  location.href = "/goods-shop/auth.html";
}

async function renderHeader(requireAuth = false) {
  const session = await getSession();
  const nav = document.getElementById("nav");
  if (!nav) return;

  if (session) {
    nav.innerHTML = `
      <a href="/goods-shop/">상품</a>
      <a href="/goods-shop/orders.html">내 주문</a>
      <span class="nav-email">${session.user.email}</span>
      <button onclick="logout()" class="btn-text">로그아웃</button>
    `;
  } else {
    nav.innerHTML = `
      <a href="/goods-shop/">상품</a>
      <a href="/goods-shop/auth.html">로그인</a>
    `;
  }

  if (requireAuth && !session) {
    location.href = "/goods-shop/auth.html";
  }
}
