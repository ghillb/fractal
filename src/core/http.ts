export async function fetchWithTimeout(input: string, init: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("timeout"), timeoutMs);
  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal
    });
  } catch (error) {
    if (controller.signal.aborted) {
      const reason = controller.signal.reason ? ` (${String(controller.signal.reason)})` : "";
      throw new Error(`request timed out after ${timeoutMs}ms${reason}`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
