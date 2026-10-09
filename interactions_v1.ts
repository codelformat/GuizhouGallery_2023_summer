import * as THREE from "three";
import gsap from "gsap"
import { PAINTINGS_INFO, numOfPoints, DOCUMENTARY_INDEX, DOCUMENTARY_VIDEO_INDEX, ZIMEIXIAO_VIDEO_INDEX, sizes } from "./Constraints";
import { spotLights } from "./lights";
import { outlineEffect } from "./postprocess";

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
	private wall_arr: Array<Array<THREE.Object3D>>;

	// private camera: THREE.Camera;
	private raycaster: THREE.Raycaster = new THREE.Raycaster();
	private raycaster_75: THREE.Raycaster = new THREE.Raycaster();
	private raycaster_45: THREE.Raycaster = new THREE.Raycaster();
	private raycaster_105: THREE.Raycaster = new THREE.Raycaster();
	private raycaster_90: THREE.Raycaster = new THREE.Raycaster();
	private raycaster_135: THREE.Raycaster = new THREE.Raycaster();
	private raycaster_180: THREE.Raycaster = new THREE.Raycaster();
	private video_raycaster: THREE.Raycaster = new THREE.Raycaster();
	private points: Point[] = [];
	private pointIndex: number = 0;
	private rayDir: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

	public wall_shown_flags= new Array(69);

	constructor(raycast_objects: THREE.Object3D[], raycast_objects_with_walls: THREE.Object3D[], wall_arr: Array<Array<THREE.Object3D>>, camera: THREE.Camera) {

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
		this.wall_arr = wall_arr;

		this.raycaster.far = 4;

		this.raycaster_45.far = 4 * Math.sqrt(2);
		this.raycaster_75.far = 5;
		this.raycaster_90.far = 4;
		this.raycaster_105.far = 5;
		this.raycaster_135.far = 4 * Math.sqrt(2);

		this.raycaster_180.far = 4;
		this.video_raycaster.far = 10;
		this.click_raycaster.far = 4;
		this.raycaster.firstHitOnly = true;
		this.raycaster_45.firstHitOnly = true;
		this.raycaster_75.firstHitOnly = true;
		this.raycaster_90.firstHitOnly = true;
		this.raycaster_105.firstHitOnly = true;
		this.raycaster_135.firstHitOnly = true;
		this.raycaster_180.firstHitOnly = true;
		this.click_raycaster.firstHitOnly = true;

		for (let i = 0; i < this.wall_shown_flags.length; i++) {
			this.wall_shown_flags[i] = false;
		}
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

	fadeInObject(object3D: THREE.Object3D, spotlight: THREE.SpotLight, duration = 1) {
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


	intersectsProcess(intersects: any) {

		let match_index: any;
		if (intersects.length) {
			//console.log('AAA')
			if (intersects[0].object.name[0] === '竖') {
				match_index = intersects[0].object.name.match(/\d+/);

				this.pointIndex = Number(match_index[0]);
				// console.log(this.pointIndex);
				this.fadeInObject(this.raycast_objects[this.pointIndex - 1], spotLights[this.pointIndex - 1]);

				// let idx = this.pointIndex - 1;
				// this.wall_shown_flags[Math.floor(idx / 2)] = true;

				// console.log(this.pointIndex);

				// this.showPreviewTooltip(PAINTINGS_INFO[this.pointIndex].title);
				// this.preview_tips.innerHTML = "提示：点击此画可查看详情"
				return { distance: intersects[0].distance, pointIndex: this.pointIndex };
			}
			else if(intersects[0].object.name[0] === '墙'){
				match_index = intersects[0].object.name.match(/\d+/);

				this.pointIndex = Number(match_index[0]);

				let idx = this.pointIndex - 1;
				this.wall_shown_flags[Math.floor(idx / 2)] = true;

				console.log(this.pointIndex);

				return { distance: Infinity, pointIndex: 0 };
			}

		}

		// Intersect found
		else {
			this.hidePreviewTooltip();
			return { distance: Infinity, pointIndex: 0 };
		}

		return { distance: Infinity, pointIndex: 0 };
	}

	videoIntersectsProcess(intersects: any) {
		let videoPlayFlag: boolean = false;
		if (intersects.length) {
			if (intersects[0].object.name[0] === '纪') {
				this.pointIndex = DOCUMENTARY_INDEX;
				this.showPreviewTooltip("《姊妹箫纪录片》");
				this.preview_tips.innerHTML = "提示：按F播放视频"
				//intersects[0].object.opacity = 1;
				videoPlayFlag = true;
			}
			else if (intersects[0].object.name[0] === '姊') {
				this.pointIndex = ZIMEIXIAO_VIDEO_INDEX;
				this.showPreviewTooltip("《姊妹箫宣传片》");
				this.preview_tips.innerHTML = "提示：按G播放视频"

				videoPlayFlag = true;
			}
			else {
				videoPlayFlag = false;
			}
		}
		return videoPlayFlag;
	}



	paintingInteractions(sceneReady: boolean, character_dir: THREE.Vector3, camera: THREE.Camera) {

		// Update points only when the scene is ready
		if (sceneReady) {
			// console.log(raycast_objects);
			// raycaster.setFromCamera(hover_point, camera);
			this.rayDir = new THREE.Vector3(0, 0, 0);
			camera.getWorldDirection(this.rayDir);
			this.rayDir.y = 0;
			this.raycaster.set(camera.position, this.rayDir.normalize());
			this.raycaster_45.set(camera.position, this.rayDir.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4));
			this.raycaster_75.set(camera.position, this.rayDir.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4 * 3));
			this.raycaster_90.set(camera.position, this.rayDir.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2));
			this.raycaster_135.set(camera.position, this.rayDir.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4 * 5));
			this.raycaster_180.set(camera.position, this.rayDir.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI));
			this.video_raycaster.set(camera.position, this.rayDir.normalize());

			const intersects_front = this.raycaster.intersectObjects(this.raycast_objects_with_walls, true);
			const intersects_45 = this.raycaster_45.intersectObjects(this.raycast_objects_with_walls, true);
			const intersects_75 = this.raycaster_75.intersectObjects(this.raycast_objects_with_walls, true);
			const intersects_90 = this.raycaster_90.intersectObjects(this.raycast_objects_with_walls, true);
			const intersects_105 = this.raycaster_105.intersectObjects(this.raycast_objects_with_walls, true);
			const intersects_135 = this.raycaster_135.intersectObjects(this.raycast_objects_with_walls, true);
			const intersects_180 = this.raycaster_180.intersectObjects(this.raycast_objects_with_walls, true);
			const intersects_video = this.video_raycaster.intersectObjects(this.raycast_objects_with_walls, true);

			const front_Info = this.intersectsProcess(intersects_front);
			const deg45_Info = this.intersectsProcess(intersects_45);
			const deg75_Info = this.intersectsProcess(intersects_75);
			const deg90_Info = this.intersectsProcess(intersects_90);
			const deg105_Info = this.intersectsProcess(intersects_105);
			const deg135_Info = this.intersectsProcess(intersects_135);
			const deg180_Info = this.intersectsProcess(intersects_180);

			const distance_arr = [front_Info.distance, deg45_Info.distance, deg75_Info.distance, deg90_Info.distance, 
				deg105_Info.distance, deg135_Info.distance, deg180_Info.distance];
			const min_distance = Math.min(...distance_arr);
			//console.log(distance_arr)
			const min_index = distance_arr.indexOf(min_distance);

			const pointIndex_arr = [front_Info.pointIndex, deg45_Info.pointIndex, deg75_Info.pointIndex, deg90_Info.pointIndex, 
				deg105_Info.pointIndex, deg135_Info.pointIndex, deg180_Info.pointIndex];
			//console.log(pointIndex_arr)
			const pointIndex = pointIndex_arr[min_index];
			// console.log(pointIndex);

			if (pointIndex !== 0) {
				this.pointIndex = pointIndex;
				// console.log(this.pointIndex);
				this.showPreviewTooltip(PAINTINGS_INFO[this.pointIndex].title);
				this.preview_tips.innerHTML = "提示：点击此画可查看详情"
			}


			return this.videoIntersectsProcess(intersects_video);
		}

		return false;
	}

	update(sceneReady: boolean, character_dir: THREE.Vector3, camera: THREE.Camera){
		let flag = this.paintingInteractions(sceneReady, character_dir, camera);

		if(sceneReady){

			for(let i = 0; i < this.wall_shown_flags.length; i ++ ){
				if(this.wall_shown_flags[i]){
					
					outlineEffect.selection.add(this.wall_arr[i][0]);
					outlineEffect.selection.add(this.wall_arr[i][1]);
					console.log(this.wall_arr[i][0], this.wall_arr[i][1])
				}
			}
		}

		return flag;
	}
}
