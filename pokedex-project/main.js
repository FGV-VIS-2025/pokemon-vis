const folderImage = document.getElementById("folder");

folderImage.addEventListener("mouseenter", () => {
    folderImage.src = "../assets/open_folder.png";
});

folderImage.addEventListener("mouseleave", () => {
    folderImage.src = "../assets/folder.png";
});