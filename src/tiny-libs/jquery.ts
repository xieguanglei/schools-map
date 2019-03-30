

export class JEle {

    ele: Element;

    constructor(ele: Element) { this.ele = ele; }

    ready(fn: () => void) {
        if (this.ele === document.documentElement) {
            window.onload = fn;
        }
    }

    query(selector: string): JEle {
        const ele = this.ele.querySelector(selector);
        return new JEle(ele);
    }

    append(child: JEle): void {
        this.ele.appendChild(child.ele);
    }

    private styleDisplayCache: string;
    visible(value: boolean): void {
        const ele = this.ele as HTMLDivElement;
        if (value) {
            ele.style.display = this.styleDisplayCache || 'block';
        } else {
            if (!this.styleDisplayCache) {
                this.styleDisplayCache = ele.style.display;
            }
            ele.style.display = 'none';
        }
    }

    text(): string;
    text(text: string): void
    text(text?: string): void | string {
        if (typeof text === 'string') {
            this.ele.innerHTML = text;
        } else {
            return this.ele.innerHTML;
        }
    }

    value(): string;
    value(text: string): void;
    value(text?: string): void | string {
        if (this.ele instanceof HTMLInputElement) {
            if (typeof text === 'string') {
                this.ele.value = text;
            } else {
                return this.ele.value;
            }
        }
    }

    private clickCallback: () => void;
    click(fn: () => void) {
        if (this.clickCallback) {
            this.ele.removeEventListener('click', this.clickCallback);
        }
        if (fn) {
            this.ele.addEventListener('click', fn);
            this.clickCallback = fn;
        }
    }
}


export function jQuery(selector: string | Element | Document) {

    if (typeof selector === 'string') {
        if (selector.trim().startsWith('<')) {
            const doc = (new DOMParser()).parseFromString(selector, 'text/html');
            const ele = doc.firstElementChild;
            if (ele) {
                return new JEle(ele);
            }
        } else {
            return new JEle(document.querySelector(selector));
        }
    }
    if (selector instanceof Element) {
        return new JEle(selector);
    }
    if (selector instanceof Document) {
        return new JEle(selector.documentElement);
    }
    return null;
}