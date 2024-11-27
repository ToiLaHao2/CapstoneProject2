async function validateFields(data, rules) {
    for (const field of rules.requiredFields) {
        if (!data[field]) {
            return { valid: false, error: `${field} is required.` };
        }
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
