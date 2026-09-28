/**
 * Convert a File or Blob to base64 string without data prefix
 */
export async function fileToBase64(file: File | Blob): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const match = result.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        resolve({
          mimeType: match[1],
          base64: match[2],
        });
      } else {
        // Fallback
        resolve({
          mimeType: file.type || 'image/jpeg',
          base64: result.split(',')[1] || result,
        });
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Fetch an image URL (e.g. from local assets or public) and convert to base64
 */
export async function urlToBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(url);
  const blob = await response.blob();
  return fileToBase64(blob);
}
