export class HashManager {

    get hash(): string {
        return location.hash.startsWith('#') ? location.hash.substr(1) : ''
    };
    set hash(value: string) {
        location.hash = value;
    }

    onHashChange: (hash: string) => void;

    constructor() {
        window.onhashchange = () => {
            if (this.onHashChange) {
                this.onHashChange(this.hash);
            }
        }
    }
}


export class AppRouter {

    hashManager: HashManager = new HashManager();

    constructor(defaultRegionId: string, onSwitchRegion: (id: string) => void) {

        this.hashManager.onHashChange = onSwitchRegion;

        if (this.hashManager.hash) {
            onSwitchRegion(this.hashManager.hash);
        } else {
            this.hashManager.hash = defaultRegionId;
        }
    }

}