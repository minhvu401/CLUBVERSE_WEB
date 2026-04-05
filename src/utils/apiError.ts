export function parseApiError(errorData: unknown, defaultMsg: string = "Có lỗi xảy ra"): string {
  if (!errorData) return defaultMsg;
  
  if (typeof errorData === "string") {
    try {
      const parsed = JSON.parse(errorData);
      return parseApiError(parsed, defaultMsg);
    } catch {
      return errorData; // Not JSON, return as is
    }
  }

  if (typeof errorData === "object" && errorData !== null) {
    const errObj = errorData as Record<string, unknown>;
    if (typeof errObj.message === "string") return errObj.message;
    if (Array.isArray(errObj.message) && errObj.message.length > 0) return String(errObj.message[0]);
    if (typeof errObj.error === "string") return errObj.error;
  }

  return defaultMsg;
}
