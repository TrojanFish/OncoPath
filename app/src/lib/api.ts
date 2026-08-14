const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function register(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Registration failed");
  }
  return response.json();
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Login failed");
  }
  return response.json();
}

export async function generateReport(profile: any) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const hasValidToken = token && token !== "null" && token !== "undefined" && token.trim() !== "";
  
  const response = await fetch(`${API_BASE_URL}/analysis/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(hasValidToken ? { "Authorization": `Bearer ${token}` } : {})
    },
    body: JSON.stringify(profile)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to generate report");
  }
  
  return response.json();
}

export async function getCases() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/cases/`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch cases");
  }
  
  return response.json();
}

export async function fetchStats() {
  const response = await fetch(`${API_BASE_URL}/stats`);
  if (!response.ok) return null;
  return response.json();
}

export async function fetchFactors() {
  const response = await fetch(`${API_BASE_URL}/evidence/factors`);
  if (!response.ok) return [];
  return response.json();
}

export async function createCase(data: { age?: number; gender?: string; surgery_type?: string }) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/cases/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create case");
  }
  return response.json();
}

export async function updateCase(caseId: string, data: { age?: number; gender?: string; surgery_type?: string }) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/cases/${caseId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update case");
  }
  return response.json();
}

export async function deleteCase(caseId: string) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/cases/${caseId}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to delete case");
  }
  return response.ok;
}
