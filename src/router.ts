export class Router {

    hash: string = location.hash.startsWith('#') ? location.hash.substr(1) : null;

    constructor() {
        console.log(this.hash);
    }

    onInit(fn: (str: string) => void) {
        fn(this.hash);
    }

    onRoute(fn: (str: string) => void) {
        window.onhashchange = function () {
            const hash = location.hash.replace('#', '');
            fn(hash);
        }
    }

    route(hash: string) {
        location.hash = hash;
    }
}