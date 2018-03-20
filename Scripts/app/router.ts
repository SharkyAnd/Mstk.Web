/// <amd-module name="router" />

import Core = require('core');

export class Route {
    name: string;
    pattern: string;

    constructor (name: string, pattern: string) {
        this.name = name;
        this.pattern = pattern;
    }

    public build(params?: {[key: string]: any}): string {
        return Core.resolveUrl(this.pattern, params);
    }
}

export class Router {
    private appRoutes: {[key: string]: Route} = {
        // From member/passport
        'member.getPassport': new Route(
            'member.getPassport',
            '~/members/{id}/passport'
        ),
        'member.newPassport': new Route(
            'member.newPassport',
            '~/members/new',
        ),
        'member.updatePassport': new Route (
            'member.updatePassport',
            '~/members/{id}/passport',
        ),
        'member.passportXml': new Route (
            'member.passportXml',
            '~/members/{id}/passport.xml',
        ),
        'member.measurementUnitsLookup': new Route (
            'member.measurementUnitsLookup',
            '~/units',
        ),
        'member.sourceSystemsLookup': new Route (
            'member.sourceSystemsLookup',
            '~/sources',
        ),
        'member.toggleActuality': new Route (
            'member.toggleActuality',
            '~/members/{id}/toggleActuality'
        ),
        'member.getUnitMeasure': new Route(
            'member.getUnitMeasure',
            '~/members/{id}/getUnitMeasure'
        ),
        'member.delete': new Route (
            'member.delete',
            '~/members/{id}/delete'
        ),

        // From member/formula
        'member.getFormula': new Route (
            'member.getFormula',
            '~/members/{id}/formula',
        ),
        'member.calculateFormula': new Route (
            'member.calculateFormula',
            '~/members/{id}/formula/calculate',
        ),
        'member.saveFormula': new Route (
            'member.saveFormula',
            '~/members/{id}/formula/save',
        ),
        'members.periods': new Route(
            'member.periods',
            '~/watch/periods'
        ),
        'members.dimensions.autoselect': new Route(
            'members.dimensions.autoselect',
            '~/watch/{memberId}/dimensions/autoselect'
        ),
        'members.clearFormulaValues': new Route(
            'members.clearFormulaValues',
            '~/members/{id}/formula/clear'
        ),
    };

    public getRoute(routeName: string, urlParams?: {[key: string]: any}): Route {
        if (!this.appRoutes[routeName]) {
            throw new Error('Unknown route name ' + routeName);
        }

        return this.appRoutes[routeName];
    }

    public getRoutePattern(routeName: string): string {
        return this.getRoute(routeName).pattern;
    }

    public buildRoute(routeName: string, urlParams?: {[key: string]: any}): string {
        return this.getRoute(routeName).build(urlParams);
    }
}

export default new Router();