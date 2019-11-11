import { MapManager } from "./map";
import { DialogManager } from "../tiny-libs/dialog/dialog";
import { ISchool } from "./data";
import { wait } from "../tiny-libs/wait";
import { download } from "../tiny-libs/download";

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
    polygons: any[] = [];
    markers: any[] = [];

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
            const shapeValue = await this.pushDraw(schoolTitle);
            if (shapeValue) {
                this.data.schools.push({
                    title: schoolTitle,
                    value: [shapeValue]
                });
                this.saveDrawData();
            }
        }
    };

    async undoDraw() {
        if (this.data && this.data.schools) {
            if (await this.dialog.confirm('你确定要撤回上一次绘图吗？撤回的数据将无法恢复。')) {
                this.markers.pop().remove();
                this.polygons.pop().remove();
                this.data.schools.pop();
                this.saveDrawData();
            }
        } else {
            await this.dialog.alert('尚未开始绘图，无法执行「取消上一次绘图」。');
        }
    };

    async clearDraw() {
        if (await this.dialog.confirm('你确定要清除所有绘图结果吗？被清除的数据将无法恢复。')) {
            while (this.markers.length > 0) {
                this.markers.pop().remove();
            }
            while (this.polygons.length > 0) {
                this.polygons.pop().remove();
            }
            this.data = null;
            this.saveDrawData();
            this.onDrawStatusChange(this.data);
        }
    };

    async outputDraw() {
        if (this.data && this.data.schools.length) {
            if (await this.dialog.confirm(
                '即将导出绘图数据。点击确定将开始下载数据文件，并跳转到 ISSUE 页。' +
                '你可以通过此页面提交绘图数据（当然你也可以不提交），并合并到本网站中。')
            ) {
                download(`学区数据-${this.data.name}`, JSON.stringify(this.data));
                await wait(1000);
                window.open('https://github.com/xieguanglei/schools-map/issues/new');
            }
        } else {
            await this.dialog.alert('你还没有完成学区绘制（至少绘制一所学校的学区），请完成绘制后再导出。')
        }
    }

    private resolve: (str: string) => void;
    async pushDraw(title: string): Promise<string> {
        return new Promise<string>((resolve) => {
            this.resolve = (str: string) => {
                this.drawSchool({ title, value: [str] });
                this.resolve = null;
                resolve(str);
            };
            this.bMapDrawer.open();
        });
    }

    pop() {
        this.polygons.pop().remove();
        this.markers.pop().remove();
    }

    private restoreDrawData(): void {
        const data = localStorage.getItem(DrawManager.LOCAL_STORAGE_KEY);
        if (data) {
            this.data = JSON.parse(data) as IDrawData;
            for (const school of this.data.schools) {
                this.drawSchool(school);
            }
        }
    }
    private saveDrawData(): void {
        if (this.data) {
            localStorage.setItem(DrawManager.LOCAL_STORAGE_KEY, JSON.stringify(this.data));
        } else {
            localStorage.removeItem(DrawManager.LOCAL_STORAGE_KEY);
        }
    }
    private drawSchool(school: ISchool): void {
        for (const value of school.value) {
            const { polygon, marker } = MapManager.drawSchoolShape(this.map.bMap, value, school.title);
            this.polygons.push(polygon);
            this.markers.push(marker);
        }
    }

    private drawComplete(e: any): void {
        const pts = e.overlay.ia;
        const str = pts.map(p => [p.lng, p.lat].join(',')).join(';');
        e.overlay.remove();
        if (this.resolve) {
            this.resolve(str);
        }
    }
}