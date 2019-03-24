var regionData = {};
var isDrawing = false;
var drawingData = null;
var $regionContainer = $('#region-container');
var $regionCurrent = $('#region-current');
var $regionList = $('#region-list');
var $drawState = $('#draw-state');
var $startDraw = $('#start-draw');
var $outputDraw = $('#output-draw');
var $clearDraw = $('#clear-draw');
var map = new BMap.Map("container");
map.enableScrollWheelZoom();
var drawingManager = new BMapLib.DrawingManager(map, {
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
    var drawCacheText = localStorage.getItem('draw_cache');
    if (drawCacheText) {
        var drawCache = JSON.parse(drawCacheText);
        drawingData = drawCache;
        if (drawingData.schools) {
            drawingData.schools.forEach(function (item) {
                drawShape(item.value[0], item.name);
            });
        }
        isDrawing = true;
        $drawState.text("\u6B63\u5728\u7ED8\u5236" + drawingData.name);
    }
}
function startDraw() {
    if (!isDrawing) {
        bootbox.prompt({
            title: '区域名',
            message: '请输入即将绘图的区域名称（如杭州市西湖区）',
            animate: false,
            callback: function (text) {
                if (text) {
                    drawingData = {
                        name: text,
                        schools: []
                    };
                    $drawState.text("\u6B63\u5728\u7ED8\u5236" + text);
                    drawingManager.open();
                }
            }
        });
        isDrawing = true;
    }
    else {
        drawingManager.open();
    }
}
function clearDraw() {
    bootbox.confirm({
        animate: false,
        title: '提示',
        message: '是否清除已绘数据',
        callback: function (yes) {
            if (yes) {
                isDrawing = false;
                $drawState.text('');
                localStorage.removeItem('draw_cache');
            }
        }
    });
}
function drawComplete(e) {
    var pts = e.overlay.ia;
    var str = pts.map(function (p) { return [p.lng, p.lat].join(','); }).join(';');
    bootbox.prompt({
        title: '学校名',
        message: '请输入此学区所属学校的名称',
        animate: false,
        callback: function (text) {
            drawingData.schools.push({
                name: text,
                value: [str]
            });
            drawShape(str, text, null, 'red');
            e.overlay.remove();
            saveDrawingData();
        }
    });
}
function indexFetched(text) {
    var data = JSON.parse(text);
    data.forEach(function (item) {
        regionData[item.id] = item;
        var $li = $("<a class=\"dropdown-item\" href=\"#" + item.id + "\">" + item.name + "</a>");
        $regionList.append($li);
    });
    if (location.hash) {
        onHashChange();
    }
    else {
        if (data.length > 0) {
            var item = data[0];
            location.hash = item.id;
        }
    }
}
function onHashChange() {
    var hash = location.hash.replace('#', '');
    if (regionData[hash]) {
        $regionCurrent.text(regionData[hash].name);
        initRegion(regionData[hash]);
    }
    else {
        bootbox.alert({
            title: '错误',
            message: '未找到区域数据！',
            animate: false,
            callback: function () { }
        });
    }
}
function initRegion(item) {
    ajax("./data/" + item.id + ".json", function (text) {
        var data = JSON.parse(text);
        item.schools = data.map(function (area) {
            return drawSchoolArea(area);
        });
    });
}
function drawSchoolArea(item) {
    if (typeof item.value === 'string') {
        item.value = [item.value];
    }
    var shapes = item.value.map(function (value) {
        return drawShape(value, item.title, item.marker ? item.marker : null);
    });
    return { name: item.title, value: item.value, shapes: shapes };
}
function drawShape(value, title, markerStr, color) {
    if (color === void 0) { color = 'blue'; }
    var data = value.split(';').map(function (s) { return s.split(',').map(Number); });
    var center = null;
    if (markerStr) {
        center = markerStr.split(',').map(Number);
    }
    else {
        center = data.reduce(function (sum, p) {
            sum[0] += p[0];
            sum[1] += p[1];
            return sum;
        }, [0, 0]).map(function (v) { return v / data.length; });
    }
    var marker = new BMap.Marker(new BMap.Point(center[0], center[1]));
    map.addOverlay(marker);
    var label = new BMap.Label(title, { offset: new BMap.Size(20, -10) });
    marker.setLabel(label);
    var polygon = new BMap.Polygon(data.map(function (p) { return new BMap.Point(p[0], p[1]); }), {
        strokeColor: color,
        strokeWeight: 2,
        strokeOpacity: 0.5
    });
    map.addOverlay(polygon);
    return {
        marker: marker,
        polygon: polygon
    };
}
function saveDrawingData() {
    if (drawingData) {
        localStorage.setItem('draw_cache', JSON.stringify(drawingData));
    }
}
function outputDraw() {
    bootbox.alert({
        animate: false,
        title: '导出',
        message: JSON.stringify(drawingData),
        callback: function () {
        }
    });
}
function ajax(url, onSuccess, onError) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                onSuccess(xmlhttp.responseText);
            }
            else if (xmlhttp.status == 400) {
                onError && onError();
            }
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}
