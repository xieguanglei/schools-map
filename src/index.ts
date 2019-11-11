import { jQuery as $ } from "./tiny-libs/jquery";
import { DialogManager } from "./tiny-libs/dialog/dialog";
import { DataManager } from "./managers/data";
import { PageManager } from "./managers/page/page";
import { MapManager } from "./managers/map";
import { DrawManager, IDrawData } from "./managers/draw";
import { AppRouter } from "./managers/router";

import "./common.less";

$(document).ready(init);

async function init() {

    const dialogManager = new DialogManager();
    
    const dataManager = new DataManager();
    const pageManager = new PageManager();
    const mapManager = new MapManager();
    const drawManager = new DrawManager(
        mapManager,
        dialogManager,
        function (data: IDrawData) { pageManager.setDrawStatus(data); }
    );

    pageManager.fillRegions(await dataManager.getRegionOultines());

    pageManager.onStartDraw(() => drawManager.startDraw());
    pageManager.onUndoDraw(() => drawManager.undoDraw());
    pageManager.onClearDraw(() => drawManager.clearDraw());
    pageManager.onOutputDraw(() => drawManager.outputDraw());

    new AppRouter(
        await dataManager.firstRegionId(),
        async function(regionId: string) {
            const region = await dataManager.getRegionDetail(regionId);
            if (region) {
                pageManager.setCurrentRegion(region);
                mapManager.clear();
                mapManager.center(region.center[0], region.center[1]);
                mapManager.showRegion(region);
            }
        }
    );
}