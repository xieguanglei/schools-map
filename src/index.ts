import "./index.less";
import { jQuery as $ } from "./tiny-libs/jquery";
import { DataManager } from "./data";
import { PageManager } from "./page";
import { DialogManager } from "./tiny-libs/dialog";
import { wait } from "./tiny-libs/wait";
import { MapManager } from "./map";
import { DrawManager, IDrawData } from "./draw";

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

    const regions = await dataManager.regionIndexList();
    pageManager.fillRegions(regions);

    const region = await dataManager.firstRegion();
    pageManager.setCurrentRegion(region);

    mapManager.center(region.center[0], region.center[1]);
    mapManager.showRegion(region);

    pageManager.onStartDraw(() => drawManager.startDraw());

    // const regionData = {};

    // const $regionList = $('#region-list');

    // const $regionContainer = $('#region-container');
    // const $regionCurrent = $('#region-current');
    // const $drawState = $('#draw-state');
    // const $startDraw = $('#start-draw');
    // const $outputDraw = $('#output-draw');
    // const $clearDraw = $('#clear-draw');

    // const text = await ajax('./data/index.json');

    // const data = JSON.parse(text) as { name: string, id: string }[];

    // console.log(data);

    // data.forEach(function (item) {
    //     regionData[item.id] = item;
    //     const $li = $(`<a class="dropdown-item" href="#${item.id}">${item.name}</a>`);
    //     $regionList.append($li);
    // });

    // if (location.hash) {
    //     onHashChange();
    // } else {
    //     if (data.length > 0) {
    //         const item = data[0];
    //         location.hash = item.id;
    //     }
    // }

}