import { getGuestId } from "./guest";

const API_BASE_URL = "/api";

export async function register(email: string, password: string) {
  const guestId = getGuestId();
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ email, password, guestId }),
  });
  
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.detail || data.error || "注册失败，请检查账号格式");
  }
  return data;
}

export async function login(email: string, password: string) {
  const guestId = getGuestId();
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ email, password, guestId }),
  });
  
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.detail || data.error || "登录失败，账号或密码错误");
  }
  return data;
}

export async function logout() {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "same-origin",
    });
  } catch (err) {
    console.warn("Logout request failed:", err);
  }
}

export async function getCurrentUser() {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const hasValidToken = token && token !== "null" && token !== "undefined" && token.trim() !== "";

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: "same-origin",
      headers: {
        ...(hasValidToken ? { "Authorization": `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.authenticated ? data.user : null;
  } catch (err) {
    console.warn("Failed to check current user session:", err);
    return null;
  }
}

export async function generateReport(profile: any) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const hasValidToken = token && token !== "null" && token !== "undefined" && token.trim() !== "";
  
  const response = await fetch(`${API_BASE_URL}/generate-report`, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(hasValidToken ? { "Authorization": `Bearer ${token}` } : {})
    },
    body: JSON.stringify(profile)
  });

  if (!response.ok) {
    let errorMsg = "生成报告失败";
    try {
      const error = await response.json();
      errorMsg = error.detail || error.error || errorMsg;
    } catch {
      try {
        errorMsg = (await response.text()) || errorMsg;
      } catch {
        // ignore
      }
    }
    throw new Error(errorMsg);
  }
  
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const rawText = await response.text();
  return {
    evidence_summary: rawText,
    rawMarkdown: rawText,
    risk_level: profile.riskLevel || "standard"
  };
}

export async function getCases() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const hasValidToken = token && token !== "null" && token !== "undefined" && token.trim() !== "";

  const response = await fetch(`${API_BASE_URL}/profile`, {
    credentials: "same-origin",
    headers: {
      ...(hasValidToken ? { "Authorization": `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    throw new Error("获取病例档案失败");
  }
  
  return response.json();
}

export async function fetchStats() {
  const response = await fetch(`${API_BASE_URL}/studies`, {
    credentials: "same-origin"
  });
  if (!response.ok) return null;
  return response.json();
}

export async function fetchFactors() {
  const response = await fetch(`${API_BASE_URL}/graph`, {
    credentials: "same-origin"
  });
  if (!response.ok) return [];
  return response.json();
}

