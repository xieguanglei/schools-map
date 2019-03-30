import { ajax } from "./tiny-libs/ajax";

export interface ISchool {
    title: string,
    value: string[],
}

export interface IRegionDetail {
    center: [number, number]
    schools: ISchool[]
}

export interface IRegionIndex {
    id: string,
    name: string;
}

export interface IData {
    index: Map<string, IRegionIndex>,
    details: Map<string, IRegionDetail>
}


export class DataManager {

    data: IData = {
        index: new Map(),
        details: new Map()
    }

    async regionIndexList(): Promise<Map<string, IRegionIndex>> {

        if (this.data.index.size === 0) {
            const text = await ajax('./data/index.json');
            const data = JSON.parse(text) as IRegionIndex[];
            for (const region of data) {
                this.data.index.set(region.id, region);
            }
        }

        return this.data.index;
    }

    async regionDetail(id: string): Promise<IRegionDetail> {
        if (!this.data.index.has(id)) {
            return null;
        }

        if (!this.data.details.has(id)) {
            const text = await ajax(`./data/${id}.json`);
            const data = JSON.parse(text) as IRegionDetail;
            this.data.details[id] = data;
        }
        return this.data.details[id];
    }

    async firstRegion(): Promise<IRegionIndex & IRegionDetail> {
        for (const [id, regionIndex] of this.data.index) {
            const regionDetail = await this.regionDetail(id);
            return { ...regionIndex, ...regionDetail };
        }
        return null;
    }

}