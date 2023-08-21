export class Interactions {

	/* 画展详情相关 */
	private boards_dialog: HTMLElement;
	private boards_container: HTMLElement;
	private boards_content: HTMLElement;
	private boards_title: HTMLElement;
	private boards_author: HTMLElement;
	private boards_describe: HTMLElement;
	private boards_img: HTMLImageElement;
	private boards_close_btn: HTMLElement;

	constructor() {

		this.boards_dialog = document.querySelector("#boards-info")!;
		this.boards_container = document.querySelector("#boards-info .boards-container")!;
		this.boards_content = document.querySelector("#boards-info .boards-container .content")!;
		this.boards_title = document.querySelector(".boards-container .info .title")!;
		this.boards_author = document.querySelector(".boards-container .info .author")!;
		this.boards_describe = document.querySelector(".boards-container .info .describe")!;
		this.boards_img = document.querySelector(".boards-container .img img")!;
		this.boards_close_btn = document.querySelector("#boards-info .boards-container .close")!;

		this.boards_close_btn.addEventListener("click", this.hideBoardsBox.bind(this));
	}

	showBoardsBox(title: string, author: string, describe: string, img_src: string) {
		if (this.boards_dialog.style.visibility === "visible") return;
		this.boards_dialog.style.visibility = "visible";
		this.boards_container.style.opacity = "1";
		this.boards_title.innerText = title;
		this.boards_author.innerText = author;
		this.boards_describe.innerHTML = describe;
		this.boards_img.src = img_src;
		this.boards_content.scrollTo({top: 0, left: 0, behavior: "smooth"});
	}

	hideBoardsBox(e: any) {
		this.boards_dialog.style.visibility = "hidden";
		this.boards_container.style.opacity = "0";
		this.boards_title.innerText = "";
		this.boards_author.innerText = "";
		this.boards_describe.innerHTML = "";
		this.boards_img.src = "";
		// 阻止冒泡，防止被window上的raycaster处理
		e.stopPropagation();
	}

}
