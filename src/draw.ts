import { MapManager } from "./map";
import { DialogManager } from "./tiny-libs/dialog";
import { ISchool } from "./data";
import { wait } from "./tiny-libs/wait";

declare const BMapLib;
declare const BMAP_DRAWING_POLYGON;

export interface IDrawData {
    name: string,
    schools: ISchool[]
}

export class DrawManager {

    static LOCAL_STORAGE_KEY: string = 'map_drawing_data';

    map: MapManager;
    dialog: DialogManager;

    bMapDrawer: any;

    data: IDrawData = null;
    overlays: any[] = [];

    private onDrawStatusChange: (e: IDrawData) => void;

    constructor(mapManager: MapManager, dialog: DialogManager, onDrawStatusChange: (e: IDrawData) => void) {
        this.map = mapManager;
        this.dialog = dialog;
        this.onDrawStatusChange = onDrawStatusChange;
        this.bMapDrawer = new BMapLib.DrawingManager(this.map.bMap, {
            isOpen: false,
            enableDrawingTool: false,
            polygonOptions: {
                strokeColor: "red",
                fillColor: "red",
                strokeWeight: 3,
                strokeOpacity: 0.8,
                fillOpacity: 0.6,
                strokeStyle: 'solid'
            }
        });
        this.bMapDrawer.setDrawingMode(BMAP_DRAWING_POLYGON);
        this.bMapDrawer.addEventListener('overlaycomplete', (e) => this.drawComplete(e));

        this.restoreDrawData();
        if (this.data) {
            this.onDrawStatusChange(this.data);
        }
    };


    async startDraw() {

        if (!this.data) {
            const regionName = await this.dialog.prompt('输入即将绘制的区域的名称（如 杭州市西湖区）：');
            if (regionName) {
                this.data = { name: regionName, schools: [] };
                await wait(200);
                this.onDrawStatusChange(this.data);
                await wait(200);
            } else {
                return;
            }
        }

        const schoolTitle = await this.dialog.prompt('输入即将绘制的学校名称：');
        if (schoolTitle) {
            const shapeValue = await this.pushDraw();
            if (shapeValue) {
                this.data.schools.push({
                    title: schoolTitle,
                    value: [shapeValue]
                });
                this.saveDrawData();
            }
        }
    }

    private resolve: (str: string) => void;
    async pushDraw(): Promise<string> {
        return new Promise<string>((resolve) => {
            this.resolve = (str: string) => {
                this.resolve = null;
                resolve(str);
            };
            this.bMapDrawer.open();
        });
    }

    pop() {
        const overlay = this.overlays.pop();
        overlay.remove();
    }

    private restoreDrawData(): void {
        const data = localStorage.getItem(DrawManager.LOCAL_STORAGE_KEY);
        if (data) {
            this.data = JSON.parse(data) as IDrawData;
        }
    }
    private saveDrawData(): void {
        if (this.data) {
            localStorage.setItem(DrawManager.LOCAL_STORAGE_KEY, JSON.stringify(this.data));
        }
    }

    private drawComplete(e: any): void {
        const pts = e.overlay.ia;
        const str = pts.map(p => [p.lng, p.lat].join(',')).join(';');
        this.overlays.push(e.overlay);
        if (this.resolve) {
            this.resolve(str);
        }
    }
}