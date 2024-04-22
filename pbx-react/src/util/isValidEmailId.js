import * as yup from 'yup';

/**
 * Check if this is a valid email address with the given domains.
 *
 * @param {string} emailId
 * @param {array}  validDomains
 *
 * @return {boolean}
 */
const isValidEmailId = (emailId, validDomains = []) => {

    const emailSchema = yup
        .string()
        .email()
    ;

    for (let i = 0; i < validDomains.length; i++) {
        const domain = '@' + validDomains[i].trim();
        if (emailSchema.isValidSync(emailId) && emailId.indexOf(domain) > 0) {
            return true;
        }
    }
    return false;

};

export default isValidEmailId;
