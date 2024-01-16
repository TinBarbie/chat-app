export function getFileName(filepath) {
    if (!filepath.includes("\\")) return filepath
    return filepath.split("\\")[1]
}

export const isImageFile = (filename) => {
    let found = false
    const exts = ['.gif', '.jpeg', '.png', '.jpg'];
    exts.forEach(ext => {
        if (filename.includes(ext)) {
            found = true
        }
    });
    if (found) {
        return true
    } else {
        console.log("will return false");
        return false;
    }
}
