import type { ApiError } from "./types";

type RequestConfig = RequestInit & {
  params?: Record<string, string>;
};

class ApiClient {
  private baseURL: string = import.meta.env.VITE_API_URL;
  private tokenGetter: (() => Promise<string | null>) | null = null;

  constructor(baseURL: string = import.meta.env.VITE_API_URL || "/api") {
    this.baseURL = baseURL;
  }

  /**
   * Set the token getter function (should be called from Auth0 integration)
   */
  setTokenGetter(getter: () => Promise<string | null>) {
    this.tokenGetter = getter;
  }

  private async getAuthToken(): Promise<string | null> {
    if (!this.tokenGetter) return null;
    try {
      return await this.tokenGetter();
    } catch (error) {
      console.error("Failed to get auth token:", error);
      return null;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = {
        message: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };

      try {
        const errorData = await response.json();
        error.message = errorData.message || error.message;
        error.statusCode = errorData.statusCode;
      } catch {
        // If response is not JSON, use default error message
      }

      throw error;
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return response.json();
    }

    // If the response is an image (binary), return a Blob so callers
    // can convert it to a File or handle it as needed.
    if (contentType?.startsWith("image/") || contentType === "application/octet-stream") {
      return (await response.blob()) as unknown as T;
    }

    return response.text() as T;
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const token = await this.getAuthToken();

    const { params, ...restConfig } = config ?? {};
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : "";

    const response = await fetch(`${this.baseURL}${endpoint}${queryString}`, {
      ...restConfig,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...restConfig.headers,
      },
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const token = await this.getAuthToken();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...config,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...config?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async postFormData<T>(endpoint: string, formData: FormData, config?: RequestConfig): Promise<T> {
    const token = await this.getAuthToken();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...config,
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...config?.headers,
      },
      body: formData,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const token = await this.getAuthToken();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...config,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...config?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const token = await this.getAuthToken();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...config,
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...config?.headers,
      },
    });

    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();
