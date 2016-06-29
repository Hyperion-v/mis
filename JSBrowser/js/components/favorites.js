browser.on("init", function () {
    "use strict";

    // Retrieve the list of favorites and add them to the UI
    this.readFavorites = () => {
        this.roamingFolder
            .getFileAsync("favorites.json")
            .then(favFile => Windows.Storage.FileIO.readTextAsync(favFile))//读取指定文件的内容并返回文本。
            .done(
                favJSON => {
                    // Read the list of favorites from file
                    let updatedFavs = favJSON ? JSON.parse(favJSON) : [];
                    let favList = [...document.querySelectorAll("#favMenu .favorite")];

                    this.favorites.clear();
                    updatedFavs.forEach(pair => this.favorites.set(pair[0], pair[1]));

                    // Clear the favorites menu
                    favList.forEach(favNode => favNode.remove());

                    // Propagate the favorites menu with the new list
                    let i = 1;
                    for (let pair of this.favorites) {
                        let alt = document.createElement("div");
                        let delay = .06 + .03 * i++;
                        let favEntry = document.createElement("a");
                        let url = pair[0];

                        favEntry.className = "favorite";
                        favEntry.style.transitionDelay = `${delay}s`; //对象过渡延迟时间
                        favEntry.textContent = pair[1].title;  //把URI的TITLE赋给favorite的textContent

                        alt.className = "url";
                        alt.textContent = url;
                        favEntry.appendChild(alt); //将文本追加到元素的最后一个节点

                        favEntry.addEventListener("click", () => {
                            this.closeMenu();
                            this.navigateTo(url);
                        });

                        this.favList.appendChild(favEntry);
                    }
                },
                e => {}
            );
    };

    // Save the list of favorites to file
    this.saveFavorites = () => {
        this.roamingFolder
            .createFileAsync("favorites.json", Windows.Storage.CreationCollisionOption.replaceExisting)
            //↑↑↑↑以所需名称创建新文件或文件夹，并替换任何文件或文件夹（如果已存在具有该名称的文件或文件夹）。
            .then(favFile => Windows.Storage.FileIO.writeTextAsync(favFile, JSON.stringify([...this.favorites])))
            //Windows.Storage.FileIO.writeTextAsync(file, contents).done( /* 你的成功和错误处理程序 */ );

            .done(() => this.readFavorites());
    };

    // Scroll the favorites list to the top
    this.scrollFavoritesToTop = () => {
        this.favList.scrollTop = 0;
    };

    // Show or hide the favorites menu
    this.toggleFavMenu = state => {
        let style = this.favMenu.style;
        let isHidden = typeof state == "boolean" ? state : style.display == "none";
        style.display = isHidden ? "block" : "none";
    };

    // Listen for the add favorite button to save the current page to the list of favorites
    this.addFavButton.addEventListener("click", () => {
        this.favorites.set(this.currentUrl, { "title": this.webview.documentTitle });
        this.saveFavorites();
    });

    // Listen for the favorites button to open the favorites menu
    this.favButton.addEventListener("click", () => {
        this.toggleSettingsMenu(false);
        this.openMenu();
    });

    // Refresh the data
    this.readFavorites();
});
