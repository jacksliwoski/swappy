export const fileToBase64 = async (filePath: string) =>
  Buffer.from(await (await import("fs/promises")).readFile(filePath)).toString("base64");
