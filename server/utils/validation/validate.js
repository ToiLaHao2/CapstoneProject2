async function validateFields(data, rules) {
    for (const field of rules.requiredFields) {
        if (!data[field]) {
            return { valid: false, error: `${field} is required.` };
        }
    }

    if (data.checkMessage !== rules.checkMessage) {
        return { valid: false, error: `Wrong message from wrong app` };
    }

    if (rules.minLength) {
        for (const [field, minLen] of Object.entries(rules.minLength)) {
            if (data[field] && data[field].length < minLen) {
                return {
                    valid: false,
                    error: `${field} must be at least ${minLen} characters`
                };
            }
        }
    }

    if (rules.maxLength) {
        for (const [field, maxLen] of Object.entries(rules.maxLength)) {
            if (data[field] && data[field].length > maxLen) {
                return {
                    valid: false,
                    error: `${field} must be no more than ${maxLen} characters`
                };
            }
        }
    }

    // Kiểm tra regex
    if (rules.regex) {
        for (const [field, pattern] of Object.entries(rules.regex)) {
            if (data[field] && !pattern.test(data[field])) {
                return { valid: false, error: `${field} is invalid` };
            }
        }
    }

    // Tất cả hợp lệ
    return { valid: true };
}

module.exports = { validateFields };
