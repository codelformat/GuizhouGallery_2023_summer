import * as THREE from "three";
import gsap from "gsap"
import { PAINTINGS_INFO, numOfPoints, DOCUMENTARY_INDEX, DOCUMENTARY_VIDEO_INDEX, sizes} from "./Constraints";
import { spotLights } from "./lights";

interface Point {
	position: THREE.Vector3;
	element: HTMLElement;
}

export class Interactions {

	/* 预览文案相关 */
	private preview_tooltip: HTMLElement;
	private preview_tips: HTMLElement;

	/* 画展详情相关 */
	private boards_dialog: HTMLElement;
	private boards_container: HTMLElement;
	private boards_content: HTMLElement;
	private boards_title: HTMLElement;
	private boards_author: HTMLElement;
	private boards_describe: HTMLElement;
	private boards_img: HTMLImageElement;
	private boards_close_btn: HTMLElement;
	private click_intersects: THREE.Intersection[] = [];
	private click_raycaster = new THREE.Raycaster();
	private raycast_objects: THREE.Object3D[] = [];
	private raycast_objects_with_walls: THREE.Object3D[] = [];

	// private camera: THREE.Camera;
	private raycaster: THREE.Raycaster = new THREE.Raycaster();
	private points: Point[] = [];
	private pointIndex: number = 0;

	constructor(raycast_objects: THREE.Object3D[], raycast_objects_with_walls: THREE.Object3D[], points: Point[], camera: THREE.Camera) {

		this.preview_tooltip = document.querySelector("#preview-tooltip")!;
		this.preview_tips = document.querySelector("#preview-tips")!;

		this.boards_dialog = document.querySelector("#boards-info")!;
		this.boards_container = document.querySelector("#boards-info .boards-container")!;
		this.boards_content = document.querySelector("#boards-info .boards-container .content")!;
		this.boards_title = document.querySelector(".boards-container .info .title")!;
		this.boards_author = document.querySelector(".boards-container .info .author")!;
		this.boards_describe = document.querySelector(".boards-container .info .describe")!;
		this.boards_img = document.querySelector(".boards-container .img img")!;
		this.boards_close_btn = document.querySelector("#boards-info .boards-container .close")!;

		this.raycast_objects = raycast_objects;
		this.raycast_objects_with_walls = raycast_objects_with_walls;
		console.log(this.raycast_objects_with_walls)
		//this.camera = camera;
		this.points = points;

		this.raycaster.far = 3;
		this.click_raycaster.far = 3;

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
		this.boards_content.scrollTo({ top: 0, left: 0, behavior: "smooth" });
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

	showPreviewTooltip(msg: string, show_preview_tips = true) {
		this.preview_tooltip.style.opacity = "1";
		if (show_preview_tips) {
			this.preview_tips.style.opacity = "1";
		}
		if (this.preview_tooltip.innerText === msg) return;
		this.preview_tooltip.innerText = msg;
	}

	hidePreviewTooltip() {
		this.preview_tooltip.style.opacity = "0";
		this.preview_tips.style.opacity = "0";
	}

	fadeInObject(object3D: THREE.Object3D, spotlight:THREE.SpotLight, duration = 1) {
		// Set initial opacity to 0 to prepare for fade-in
		// object3D.material.opacity = 0;
		// object3D.visible = true; // Make sure the object is visible
	  
		// Start fading in the object using GSAP's TweenMax
		gsap.to([object3D.material, spotlight], {
		  opacity: 1, // Fade in to fully opaque
		  power: 20,
		  duration: duration, // How long should the fade-in take?
		  onComplete: () => {
			// Optionally, you can set the opacity back to 1 if you plan to reuse the object
			object3D.material.opacity = 1;
			spotlight.power = 30;
		  }
		});
	  }

	paintingClickInteractions(mouse_point: THREE.Vector2, camera: THREE.Camera) {
		this.click_raycaster.setFromCamera(mouse_point, camera);
		this.click_intersects = this.click_raycaster.intersectObjects(this.raycast_objects, true);

		if (this.click_intersects.length && this.click_intersects[0].object.name[0] === '竖') {
			const match_index = this.click_intersects[0].object.name.match(/\d+/);
			const paintingIndex = parseInt(match_index[0]);

			this.showBoardsBox(PAINTINGS_INFO[paintingIndex].title, PAINTINGS_INFO[paintingIndex].author,
				PAINTINGS_INFO[paintingIndex].describe, PAINTINGS_INFO[paintingIndex].img_src);
		}
	}

    paintingInteractions(sceneReady: boolean, camera: THREE.Camera) {
		let videoPlayFlag:boolean = false;
		let match_index: any;
		// Update points only when the scene is ready
		if (sceneReady) {
			// console.log(raycast_objects);
			// raycaster.setFromCamera(hover_point, camera);
			let rayDir = new THREE.Vector3(0, 0, 0);
			camera.getWorldDirection(rayDir);
			rayDir.y = 0;
			this.raycaster.set(camera.position, rayDir.normalize());
	
			const intersects = this.raycaster.intersectObjects(this.raycast_objects_with_walls, true);
			//console.log(intersects);
			// console.log(intersects);
			if (intersects.length) {
				//console.log('AAA')
				if (intersects[0].object.name[0] === '竖') {
					match_index = intersects[0].object.name.match(/\d+/);
	
					this.pointIndex = Number(match_index[0]);
					this.fadeInObject(this.raycast_objects[this.pointIndex - 1], spotLights[this.pointIndex - 1]);
					this.showPreviewTooltip(PAINTINGS_INFO[this.pointIndex].title);
					this.preview_tips.innerHTML = "提示：点击此画可查看详情"
					//intersects[0].object.opacity = 1;
					// console.log(intersects[0].object);
					videoPlayFlag = false;
				}
				else if(intersects[0].object.name[0] != '2'){
					this.pointIndex = DOCUMENTARY_INDEX;
					this.showPreviewTooltip("《姊妹箫纪录片》");
					this.preview_tips.innerHTML = "提示：按F播放视频"
					//intersects[0].object.opacity = 1;
					videoPlayFlag = true;
				}
				// for (let i = 1; i <= numOfPoints; i++) {
				// 	if (i == this.pointIndex)
				// 		continue;
				// 	this.hidePreviewTooltip();
				// 	//raycast_objects[i - 1].opacity = 0;
				// }
			}
	
			// Intersect found
			else {
				this.hidePreviewTooltip();
			}
		}

		return videoPlayFlag;
	}

}
