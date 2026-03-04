export const uploadDocument = async (file, type) => {
    // Simulate network request and storage upload delay
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!file) {
                reject(new Error("No file provided"));
            } else {
                // Return a fake URL depending on the file name/type
                const fileName = file.name || `fake_${type.toLowerCase()}_file.pdf`;
                resolve(`https://mock-storage.invalid/thesis-documents/${fileName}`);
            }
        }, 1500);
    });
};
