export const saveAs = function(blob: Blob, name: string) {
    const element = document.createElement("a");
    const url = window.URL.createObjectURL(blob);
    element.href = url;
    element.download = name;
    element.click();
    window.URL.revokeObjectURL(url);
};