export const processingFilePath = async (file: any, folderName: string | undefined, fileName: string | undefined) => {
    const data = new TextEncoder().encode(`${file.name}-${Date.now()}`);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const uniqueHash = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    return `${folderName}/${uniqueHash}/${fileName ?? file.name}.${file.type.split("/")[1]}`;
};