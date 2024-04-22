import componentGenerator from './generators/component/component-generator.mjs';
import storeGenerator from './generators/store/store-generator.mjs';
import routeGenerator from './generators/route/route-generator.mjs';
import addTranslationGenerator from './generators/add-translation/add-translation-generator.mjs';

export default (plop) => {

    plop.setGenerator('component', componentGenerator);
    plop.setGenerator('store', storeGenerator);
    plop.setGenerator('route', routeGenerator);
    plop.setGenerator('add translation', addTranslationGenerator);

};
