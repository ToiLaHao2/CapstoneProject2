async function findByIdOrThrow(Model, id, options = {}) {
    const { selectFields, errorMessage } = options;

    try {
        const query = Model.findById(id);
        if (selectFields) query.select(selectFields);

        const document = await query;
        if (!document) {
            throw new Error(
                errorMessage || `${Model.modelName} with ID ${id} not found`
            );
        }
        return document;
    } catch (error) {
        throw new Error(error.message || "Error finding document");
    }
}

async function findOneOrThrow(Model, condition, options = {}) {
    const { selectFields, errorMessage } = options;

    try {
        const query = Model.findOne(condition);
        if (selectFields) query.select(selectFields);

        const document = await query;
        if (!document) {
            throw new Error(errorMessage || `${Model.modelName} not found`);
        }
        return document;
    } catch (error) {
        throw new Error(error.message || "Error finding document");
    }
}
