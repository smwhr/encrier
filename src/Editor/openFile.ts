export const openFile = async function(accept = "*", multiple = false):Promise<{
    filename: string;
    content: string;
}> {
    return new Promise((resolve) => {
        const fileInput = document.createElement("input");
              fileInput.setAttribute("type", "file");

        fileInput.addEventListener("change", () => {
            if(fileInput.files?.length || 0 > 0 && fileInput.files !== null){
                const inkFile = fileInput.files[0];
                textFromFile(inkFile).then((content)=>{
                    resolve({filename: inkFile.name, content});
                })
            }
            fileInput.remove()
        })
        fileInput.click();
    });
}

const textFromFile = async function(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result as string);
        reader.readAsText(file); 
    });
}