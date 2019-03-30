import "./index.less";
import { jQuery as $ } from "./tiny-libs/jquery";
import { DialogManager } from "./tiny-libs/dialog";
import { DataManager } from "./data";
import { PageManager } from "./page";
import { MapManager } from "./map";
import { DrawManager, IDrawData } from "./draw";
import { Router } from "./router";

$(document).ready(init);

async function init() {

    const router = new Router();
    const dialogManager = new DialogManager();
    const dataManager = new DataManager();
    const pageManager = new PageManager();
    const mapManager = new MapManager();
    const drawManager = new DrawManager(
        mapManager,
        dialogManager,
        function (data: IDrawData) { pageManager.setDrawStatus(data); }
    );

    pageManager.onStartDraw(() => drawManager.startDraw());
    pageManager.onUndoDraw(() => drawManager.undoDraw());
    pageManager.onClearDraw(() => drawManager.clearDraw());
    pageManager.onOutputDraw(() => drawManager.outputDraw());

    const regions = await dataManager.regionIndexList();
    pageManager.fillRegions(regions);

    router.onInit(async (regionName?: string) => {
        if (!regionName) {
            const region = await dataManager.firstRegion();
            router.route(region.id);
        } else {
            await initWithRegion(regionName);
        }
    });

    router.onRoute(initWithRegion);

    async function initWithRegion(regionName: string) {
        const region = await dataManager.specifiedRegion(regionName);
        if (region) {
            pageManager.setCurrentRegion(region);
            mapManager.clear();
            mapManager.center(region.center[0], region.center[1]);
            mapManager.showRegion(region);
        }
    }
}