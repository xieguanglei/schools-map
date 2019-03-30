
export function ajax(url): Promise<string> {

    return new Promise((resolve, reject) => {

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == XMLHttpRequest.DONE) {
                if (xmlhttp.status == 200) {
                    resolve(xmlhttp.responseText);
                }
                else if (xmlhttp.status == 400) {
                    reject();
                }
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    })

}