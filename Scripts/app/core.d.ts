declare namespace Application {
    export function getSummernoteValue (): any;

    export function replaceUrlParameters (url: string, params: {[key: string]: any}): string;

    export function resolveUrl(url: string, urlParameters?: {[key: string]: any}): string;

    export function addAntiForgeryToken(data: any): any;

    export function toggleLoading(param: string): void;

    export function beginLoading(): void;

    export function endLoading(): void;
    
    export function error(message: string): void;
    
    export function makeGetParams(a, traditional): string;
    
    export function getWindowWidth(): number;

    export function calculateTextContainerWidth(text: string, maxWidth: number, fontSize: number): number;

    export const Math: {
        'равно': (a, b) => boolean,
        'не равно': (a, b) => boolean,
        'больше':(a, b) => boolean,
        'больше или равно': (a, b) => boolean,
        'меньше': (a, b) => boolean,
        'меньше или равно': (a, b) => boolean,
    };

    export const Boolean: {
        'и': (a, b) => boolean,
        'или': (a, b) => boolean,
    };

    export function createHiddenChartContainer(chartOptions: {[key: string]: any}): any;

    export function getHiddenChartContainer(chartOptions: {[key: string]: any}): any;
    
    export function destroyHiddenChartContainer(): any;
    
    export function selectHandbookVal(args: {[key: string]: any}): void;
    
    export function selectSearchVal(args: {[key: string]: any}): void;
    
    export const widgetTypes: {
        text: any,
        chart: any,
    };
    
    export const rootUrl: string;

    export const isOperatorRole: boolean;

    export const isManagerRole: boolean;

    export const isAdminRole: boolean;
    
    export const isAnalystRole: boolean;
    
    export let userRoles: Array<string>;
    
    export const title: string;
    
    export const isGisp: boolean;
    
    export const managersDesktop: {
        isAdmin: boolean,
        isAnalyst: boolean,
        isManager: boolean
    };

    export let user: {
        title: string,
        login: string
    }

    export let userOU: {
        id: number,
        fullAccess: boolean,
        name: string
    }

    export let flexmonster: {
        dataSource: string,
        licenceKey: string
    }

    export let memberUpdateModes: {
        Calculation: { id: 1, text: 'Расчет' },
        Manual: { id: 2, text: 'Ручной' },
        Automatic: { id: 3, text: 'Автоматический' },
    }

    export function getMemberUpdateMode(id: any);
}

declare module "core" {
    export = Application;
}