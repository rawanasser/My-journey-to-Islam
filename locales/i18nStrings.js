import i18n from './i18n';

const strings = new Proxy({}, {
    get: (target, key) => {
        return i18n.t(key);
    }
});

export default strings;
