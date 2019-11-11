import { ajax } from "../tiny-libs/ajax";

export interface ISchool {
    title: string,
    value: string[],
}

export interface IRegionDetail {
    center: [number, number]
    schools: ISchool[]
}

export interface IRegionOutline {
    id: string,
    name: string;
}

export type IRegion = IRegionOutline & IRegionDetail;


export class DataManager {

    private regionOutlines: Map<string, IRegionOutline> = new Map();
    private regionDetails: Map<string, IRegionDetail> = new Map();

    async getRegionOultines(): Promise<Map<string, IRegionOutline>> {

        if (this.regionOutlines.size === 0) {
            const text = await ajax('./data/index.json');
            const data = JSON.parse(text) as IRegionOutline[];
            for (const region of data) {
                this.regionOutlines.set(region.id, region);
            }
        }

        return this.regionOutlines;
    }

    async getRegionDetail(id: string): Promise<IRegion> {

        const regionOutlines = await this.getRegionOultines();

        if (!this.regionDetails.has(id)) {
            const text = await ajax(`./data/${id}.json`);
            const data = JSON.parse(text) as IRegionDetail;
            this.regionDetails.set(id, data);
        }
        return { ...regionOutlines.get(id), ...this.regionDetails.get(id) };
    }

    async firstRegionId(): Promise<string> {
        const regionOutlines = await this.getRegionOultines();
        if (regionOutlines.size > 0) {
            return [...regionOutlines.keys()][0];
        }
        return null;
    }
}