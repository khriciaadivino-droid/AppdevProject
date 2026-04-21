import { NativeModules } from 'react-native';

const DEV_API_PORTS = ['9000', '8000'];

const getDevServerHost = () => {
  const scriptURL = NativeModules?.SourceCode?.scriptURL;
  if (!scriptURL) {
    return null;
  }

  const hostMatch = scriptURL.match(/^https?:\/\/([^/:]+)(?::\d+)?/i);
  return hostMatch?.[1] || null;
};

const buildBaseUrls = () => {
  if (!__DEV__) {
    return ['http://localhost:8000/api'];
  }

  const devHost = getDevServerHost();
  const hosts = [];

  if (devHost) {
    hosts.push(devHost);
  }

  hosts.push('10.0.2.2', 'localhost', '127.0.0.1');

  const urls = [];
  for (const host of hosts) {
    for (const port of DEV_API_PORTS) {
      const url = `http://${host}:${port}/api`;
      if (!urls.includes(url)) {
        urls.push(url);
      }
    }
  }

  return urls;
};

const BASE_URLS = buildBaseUrls();

const fetchWithBaseUrlFallback = async (paths, options) => {
  const requestPaths = Array.isArray(paths) ? paths : [paths];
  let lastError = null;

  for (const path of requestPaths) {
    for (const baseUrl of BASE_URLS) {
      try {
        const response = await fetch(`${baseUrl}${path}`, options);

        if (response.status === 404) {
          continue;
        }

        return response;
      } catch (error) {
        lastError = error;
      }
    }
  }

  throw lastError || new Error('Network request failed. API server is unreachable.');
};

const getHeaders = (token = null) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};


export async function authLogin({ email, password }) {
  try {
    const response = await fetchWithBaseUrlFallback(['/auth/login', '/login'], {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Login failed: ${response.status}`);
    }

    const data = await response.json();

    // Expected response format: { user: {...}, token: '...' }
    // Adjust based on your actual API response structure
    return {
      id: data.user?.id || data.id,
      email: data.user?.email || data.email,
      name: data.user?.name || data.name,
      token: data.token,
      loginTime: new Date().toISOString(),
      ...data.user, // Include any additional user fields
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function authRegister({ email, password, name }) {
  try {
    const response = await fetchWithBaseUrlFallback('/auth/register', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Registration failed: ${response.status}`);
    }

    const data = await response.json();

    return {
      id: data.user?.id || data.id,
      email: data.user?.email || data.email,
      name: data.user?.name || data.name,
      token: data.token,
      loginTime: new Date().toISOString(),
      ...data.user,
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

export async function authLogout(token) {
  try {
    const response = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(token),
    });

    if (!response.ok) {
      console.warn('Logout request failed, but continuing with local logout');
    }

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    // Still return success for local logout even if API call fails
    return { success: true };
  }
}

export async function authVerifyToken(token) {
  try {
    const response = await fetch(`${BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: getHeaders(token),
    });

    if (!response.ok) {
      return { valid: false };
    }

    const data = await response.json();
    return { valid: true, user: data.user };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false };
  }
}

export async function getUserProfile(token) {
  try {
    const response = await fetch(`${BASE_URL}/user/profile`, {
      method: 'GET',
      headers: getHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to get profile: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
}

export async function updateUserProfile(token, profileData) {
  try {
    const response = await fetch(`${BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update profile: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
}

export async function changePassword(token, { currentPassword, newPassword }) {
  try {
    const response = await fetch(`${BASE_URL}/user/password`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to change password: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
}

// Likes
export async function likeContent(token, contentId, contentType) {
  try {
    const response = await fetch(`${BASE_URL}/likes`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ contentId, contentType }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to like: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Like error:', error);
    throw error;
  }
}

export async function unlikeContent(token, contentId, contentType) {
  try {
    const response = await fetch(`${BASE_URL}/likes/${contentId}`, {
      method: 'DELETE',
      headers: getHeaders(token),
      body: JSON.stringify({ contentType }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to unlike: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Unlike error:', error);
    throw error;
  }
}

// Warnings/Reports
export async function createWarning(token, warningData) {
  try {
    const response = await fetch(`${BASE_URL}/warnings`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(warningData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create warning: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create warning error:', error);
    throw error;
  }
}

export async function getWarnings(token) {
  try {
    const response = await fetch(`${BASE_URL}/warnings`, {
      method: 'GET',
      headers: getHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to get warnings: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get warnings error:', error);
    throw error;
  }
}

export async function updateWarning(token, warningId, updateData) {
  try {
    const response = await fetch(`${BASE_URL}/warnings/${warningId}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update warning: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update warning error:', error);
    throw error;
  }
}

export async function deleteWarning(token, warningId) {
  try {
    const response = await fetch(`${BASE_URL}/warnings/${warningId}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete warning: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete warning error:', error);
    throw error;
  }
}
