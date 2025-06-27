const baseURL = "https://easyrentapi0.runasp.net";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

async function _get(urlPath) {
  const response = await fetch(`${baseURL}${urlPath}`, {
    method: "GET",
    headers: JSON_HEADERS,
  });

  if (!response.ok) throw new Error(`GET failed: ${response.status}`);
  return await response.json();
}

async function _post(urlPath, data) {
  const response = await fetch(`${baseURL}${urlPath}`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error(`POST failed: ${response.status}`);

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text || null;
  }
}

async function _put(urlPath, data) {
  const response = await fetch(`${baseURL}${urlPath}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error(`PUT failed: ${response.status}`);
  return await response.json();
}

async function _delete(urlPath) {
  const response = await fetch(`${baseURL}${urlPath}`, {
    method: "DELETE",
    headers: JSON_HEADERS,
  });

  if (!response.ok) throw new Error(`DELETE failed: ${response.status}`);
  return await response.json();
}

export { _get, _post, _put, _delete };
export const axiosClient = {
  get: _get,
  post: _post,
  put: _put,
  delete: _delete,
};
