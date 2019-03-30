import { IRegionDetail, ISchool } from "./data";

declare const BMap;

export class MapManager {

    static zoomLevel = 15;
    bMap = new BMap.Map("container");
    overlays: any[] = [];

    constructor() {
        this.bMap.enableScrollWheelZoom();
    }

    center(x: number, y: number): void {
        this.bMap.centerAndZoom(new BMap.Point(x, y), MapManager.zoomLevel);
    }

    showRegion(region: IRegionDetail) {
        for (const school of region.schools) {
            this.drawSchool(school);
        }
    }
    private drawSchool(school: ISchool) {

        if (typeof school.value === 'string') {
            school.value = [school.value];
        }

        for (const path of school.value) {
            this.drawShape(path, school.title);
        }
    }
    static shapePolygonStyle = { strokeWeight: 2, strokeOpacity: 0.5 };
    private drawShape(value: string, title: string, markerStr?: string): void {

        const data = value.split(';').map(s => s.split(',').map(Number));

        let center: number[] = null;
        if (markerStr) {
            center = markerStr.split(',').map(Number);
        } else {
            center = data.reduce(function (sum, p) {
                sum[0] += p[0];
                sum[1] += p[1];
                return sum;
            }, [0, 0]).map(v => v / data.length);
        }

        const marker = new BMap.Marker(
            new BMap.Point(center[0], center[1])
        );
        this.bMap.addOverlay(marker);
        const label = new BMap.Label(title, { offset: new BMap.Size(20, -10) });
        marker.setLabel(label);

        const polygon = new BMap.Polygon(
            data.map(p => new BMap.Point(p[0], p[1])),
            MapManager.shapePolygonStyle
        );
        this.bMap.addOverlay(polygon);

        this.overlays.push(marker);
        this.overlays.push(polygon);
    }

    clear(): void {
        for (const overlay of this.overlays) {
            this.bMap.removeOverlay(overlay);
        }
    }
}