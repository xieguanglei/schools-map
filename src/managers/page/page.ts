import { JEle, jQuery as $ } from "../../tiny-libs/jquery";
import { IRegionOutline } from "../data";
import { IDrawData } from "../draw";

import "./page.less";

import pageHtml from "./page.html";


export class PageManager {

    $navBar: JEle = $(pageHtml);
    $regionList: JEle = this.$navBar.query('#region-list');
    $currentRegion = this.$navBar.query('#current-region');
    $statucDraw = this.$navBar.query('#status-draw');

    $buttonStartDraw = this.$navBar.query('#start-draw');
    $buttonUndoDraw = this.$navBar.query('#undo-draw');
    $buttonOutputDraw = this.$navBar.query('#output-draw');
    $buttonClearDraw = this.$navBar.query('#clear-draw');

    constructor(){
        $(document.body).prepend(this.$navBar);
    }

    fillRegions(allRegions: Map<string, IRegionOutline>): void {

        for (const [key, region] of allRegions) {
            const $item = $(`<a class="dropdown-item" href="#${key}">${region.name}</a>`);
            this.$regionList.append($item);
        }
    }

    setCurrentRegion(region: IRegionOutline): void {
        this.$currentRegion.text(`区域选择:${region.name}`);
    }

    setDrawStatus(data: IDrawData) {
        if (data) {
            this.$statucDraw.text(`绘制中：${data.name}`);
        } else {
            this.$statucDraw.text('绘图');
        }
    }

    onStartDraw(fn: () => void): void { this.$buttonStartDraw.click(fn); }
    onUndoDraw(fn: () => void): void { this.$buttonUndoDraw.click(fn); }
    onOutputDraw(fn: () => void): void { this.$buttonOutputDraw.click(fn); }
    onClearDraw(fn: () => void): void { this.$buttonClearDraw.click(fn); }
}