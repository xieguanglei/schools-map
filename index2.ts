declare const BMap;
declare const BMapLib;
declare const $;
declare const bootbox;
declare const clipboard;
declare const BMAP_DRAWING_POLYGON;

interface IShape {
    marker: any,
    polygon: any
}

interface ISchool {
    name: string,
    value: string[],
    shapes?: IShape[]
}

interface IRegion {
    id: string,
    name: string,
    schools?: ISchool[]
}

interface IRegionData {
    [key: string]: IRegion
}

interface IDrawingSchool {
    name: string,
    value: string[]
}

interface IDrawingData {
    name: string,
    schools?: IDrawingSchool[]
}


const regionData: IRegionData = {};

let isDrawing = false;
let drawingData: IDrawingData = null;


const $regionContainer = $('#region-container');
const $regionCurrent = $('#region-current');
const $regionList = $('#region-list');
const $drawState = $('#draw-state');
const $startDraw = $('#start-draw');
const $outputDraw = $('#output-draw');
const $clearDraw = $('#clear-draw');

const map = new BMap.Map("container");
map.enableScrollWheelZoom();

const drawingManager = new BMapLib.DrawingManager(map, {
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
drawingManager.setDrawingMode(BMAP_DRAWING_POLYGON);
drawingManager.addEventListener('overlaycomplete', drawComplete);

map.centerAndZoom(new BMap.Point(120.124207, 30.30317), 15);


window.onhashchange = onHashChange;
tryResolveDraw();
ajax('./data/index.json', indexFetched);
$startDraw.click(startDraw);
$clearDraw.click(clearDraw);
$outputDraw.click(outputDraw);


function tryResolveDraw() {
    const drawCacheText = localStorage.getItem('draw_cache');

    if (drawCacheText) {
        const drawCache = JSON.parse(drawCacheText) as IDrawingData;

        drawingData = drawCache;

        if (drawingData.schools) {
            drawingData.schools.forEach(item => {
                drawShape(item.value[0], item.name);
            })
        }

        isDrawing = true;
        $drawState.text(`正在绘制${drawingData.name}`);
    }
}

function startDraw(): void {

    if (!isDrawing) {

        bootbox.prompt({
            title: '区域名',
            message: '请输入即将绘图的区域名称（如杭州市西湖区）',
            animate: false,
            callback: function (text: string) {
                if (text) {
                    drawingData = {
                        name: text,
                        schools: []
                    };
                    $drawState.text(`正在绘制${text}`);
                    drawingManager.open();
                }
            }
        });
        isDrawing = true;
    } else {
        drawingManager.open();
    }

}

function clearDraw(): void {

    bootbox.confirm({
        animate: false,
        title: '提示',
        message: '是否清除已绘数据',
        callback: (yes) => {
            if (yes) {
                isDrawing = false;
                $drawState.text('');
                localStorage.removeItem('draw_cache');
            }
        }
    })
}

function drawComplete(e: any): void {

    const pts = e.overlay.ia;
    const str = pts.map(p => [p.lng, p.lat].join(',')).join(';');

    bootbox.prompt({
        title: '学校名',
        message: '请输入此学区所属学校的名称',
        animate: false,
        callback: function (text: string) {
            drawingData.schools.push({
                name: text,
                value: [str]
            });

            drawShape(str, text, null, 'red');

            e.overlay.remove();

            saveDrawingData();
        }
    })
}

function indexFetched(text: string): void {

    const data = JSON.parse(text) as { name: string, id: string }[];

    data.forEach(function (item) {
        regionData[item.id] = item;
        const $li = $(`<a class="dropdown-item" href="#${item.id}">${item.name}</a>`);
        $regionList.append($li);
    });

    if (location.hash) {
        onHashChange();
    } else {
        if (data.length > 0) {
            const item = data[0];
            location.hash = item.id;
        }
    }
}

function onHashChange(): void {

    const hash = location.hash.replace('#', '');

    if (regionData[hash]) {
        $regionCurrent.text(regionData[hash].name);
        initRegion(regionData[hash]);
    } else {
        bootbox.alert({
            title: '错误',
            message: '未找到区域数据！',
            animate: false,
            callback: function () { }
        })
    }
}

function initRegion(item: IRegion): void {

    ajax(`./data/${item.id}.json`, function (text) {

        const data = JSON.parse(text) as { title: string, value: string | string[], marker?: string }[];

        item.schools = data.map(function (area) {
            return drawSchoolArea(area);
        });
    })
}

function drawSchoolArea(
    item: { title: string, value: string | string[], marker?: string }
): ISchool {

    if (typeof item.value === 'string') {
        item.value = [item.value];
    }

    const shapes = item.value.map(function (value): IShape {

        return drawShape(value, item.title, item.marker ? item.marker : null);

    });

    return { name: item.title, value: item.value, shapes };
}

function drawShape(value: string, title: string, markerStr?: string, color = 'blue'): IShape {


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
    map.addOverlay(marker);
    const label = new BMap.Label(title, { offset: new BMap.Size(20, -10) });
    marker.setLabel(label);

    const polygon = new BMap.Polygon(
        data.map(
            p => new BMap.Point(p[0], p[1])
        ),
        {
            strokeColor: color,
            strokeWeight: 2,
            strokeOpacity: 0.5
        }
    );

    map.addOverlay(polygon);

    return {
        marker,
        polygon
    }
}

function saveDrawingData() {
    if (drawingData) {
        localStorage.setItem('draw_cache', JSON.stringify(drawingData));
    }
}

function outputDraw() {

    clipboard.writeText(JSON.stringify(drawingData)).then(function () {

        bootbox.alert({
            animate: false,
            title: '导出',
            message: '数据已经复制到你的剪切板，即将跳转到 Issue 页提交数据。',
            callback: () => {
                open('https://github.com/xieguanglei/schools-map/issues/new');
            }
        })
    })

}


function ajax(
    url: string,
    onSuccess: (text: string) => void,
    onError?: () => void
): void {

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                onSuccess(xmlhttp.responseText);
            } else if (xmlhttp.status == 400) {
                onError && onError();
            }
        }
    };

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}
