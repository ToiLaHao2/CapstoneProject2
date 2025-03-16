async function validateFields(data, rules) {
    const requiredFieldError = validateRequiredFields(
        data,
        rules.requiredFields
    );
    if (requiredFieldError) return requiredFieldError;

    const checkMessageError = validateCheckMessage(data, rules.checkMessage);
    if (checkMessageError) return checkMessageError;

    const minLengthError = validateMinLength(data, rules.minLength);
    if (minLengthError) return minLengthError;

    const maxLengthError = validateMaxLength(data, rules.maxLength);
    if (maxLengthError) return maxLengthError;

    const regexError = validateRegex(data, rules.regex);
    if (regexError) return regexError;

    return { valid: true };
}

function validateRequiredFields(data, requiredFields) {
    for (const field of requiredFields) {
        if (data[field] === undefined || data[field] === null) {
            return { valid: false, error: `${field} is required.` };
        }
    }
    return null;
}

function validateCheckMessage(data, checkMessage) {
    if (data.checkMessage !== checkMessage) {
        return { valid: false, error: `Wrong message from wrong app` };
    }
    return null;
}

function validateMinLength(data, minLengthRules) {
    if (minLengthRules) {
        for (const [field, minLen] of Object.entries(minLengthRules)) {
            if (data[field] && data[field].length < minLen) {
                return {
                    valid: false,
                    error: `${field} must be at least ${minLen} characters`,
                };
            }
        }
    }
    return null;
}

function validateMaxLength(data, maxLengthRules) {
    if (maxLengthRules) {
        for (const [field, maxLen] of Object.entries(maxLengthRules)) {
            if (data[field] && data[field].length > maxLen) {
                return {
                    valid: false,
                    error: `${field} must be no more than ${maxLen} characters`,
                };
            }
        }
    }
    return null;
}

function validateRegex(data, regexRules) {
    if (regexRules) {
        for (const [field, pattern] of Object.entries(regexRules)) {
            if (data[field] && !pattern.test(data[field])) {
                return { valid: false, error: `${field} is invalid` };
            }
        }
    }
    return null;
}

module.exports = { validateFields };
