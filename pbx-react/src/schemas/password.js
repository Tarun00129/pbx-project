import * as yup from 'yup';

const getSchema = (i18n) => yup
    .string()
    .required(i18n.t('schemas.password.requiredMessage'))
    .min(8, i18n.t('schemas.password.minimumCharactersMessage', {count: 8}))
    .matches(/\d+/, {
        message: i18n.t('schemas.password.includeNumberMessage'),
    })
    .matches(/[a-zA-Z]+/, {
        message: i18n.t('schemas.password.includeLetterMessage'),
    })
;

export default getSchema;
