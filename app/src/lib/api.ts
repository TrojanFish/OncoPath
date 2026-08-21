import { getGuestId } from "./guest";

const API_BASE_URL = "/api";

export async function register(email: string, password: string) {
  const guestId = getGuestId();
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    body: JSON.stringify({ email, password, guestId }),
  });
  
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.detail || data.error || "登录失败，账号或密码错误");
  }
  return data;
}

export async function generateReport(profile: any) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const hasValidToken = token && token !== "null" && token !== "undefined" && token.trim() !== "";
  
  const response = await fetch(`${API_BASE_URL}/generate-report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(hasValidToken ? { "Authorization": `Bearer ${token}` } : {})
    },
    body: JSON.stringify(profile)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || error.error || "生成报告失败");
  }
  
  return response.json();
}

export async function getCases() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/profile`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("获取病例档案失败");
  }
  
  return response.json();
}

export async function fetchStats() {
  const response = await fetch(`${API_BASE_URL}/studies`);
  if (!response.ok) return null;
  return response.json();
}

export async function fetchFactors() {
  const response = await fetch(`${API_BASE_URL}/graph`);
  if (!response.ok) return [];
  return response.json();
}
