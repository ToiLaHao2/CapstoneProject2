const logger = require("./logger");

async function findByIdOrThrow(Model, id, options = {}) {
    const { selectFields, errorMessage, errorStatusCode } = options;

    try {
        // Tạo query để tìm tài liệu
        const query = Model.findById(id);
        if (selectFields) query.select(selectFields); // Chỉ lấy các trường cần thiết nếu có

        const document = await query;

        // Ném lỗi nếu không tìm thấy tài liệu
        if (!document) {
            const error = new Error(
                errorMessage || `${Model.modelName} with ID ${id} not found`
            );
            error.statusCode = errorStatusCode || 404;
            throw error;
        }

        // Trả về tài liệu nếu tìm thấy
        return document;
    } catch (error) {
        // Xử lý lỗi ngoài mong muốn (như lỗi kết nối)
        throw error.statusCode
            ? error
            : {
                  message: "Error finding document",
                  statusCode: 500,
                  details: error.message,
              };
    }
}

async function findOneOrThrow(Model, condition, options = {}) {
    const { selectFields, errorMessage, errorStatusCode } = options;

    try {
        // Tạo query để tìm tài liệu
        const query = Model.findOne(condition);
        if (selectFields) query.select(selectFields); // Chỉ lấy các trường cần thiết nếu có

        const document = await query;

        // Ném lỗi nếu không tìm thấy tài liệu
        if (!document) {
            const error = new Error(
                errorMessage ||
                    `${Model.modelName} not found for the given condition`
            );
            error.statusCode = errorStatusCode || 404;
            throw error;
        }

        // Trả về tài liệu nếu tìm thấy
        return document;
    } catch (error) {
        // Xử lý lỗi ngoài mong muốn (như lỗi kết nối)
        throw error.statusCode
            ? error
            : {
                  message: "Error finding document",
                  statusCode: 500,
                  details: error.message,
              };
    }
}

const deleteMultipleDocuments = async (Model, ids) => {
    try {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            throw new Error("Invalid ID array");
        }

        // Xóa tất cả các documents có ID trong danh sách
        const result = await Model.deleteMany({ _id: { $in: ids } });

        return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
        logger.error("Error deleting documents:", error);
        return { success: false, message: error.message };
    }
};

module.exports = { findByIdOrThrow, findOneOrThrow, deleteMultipleDocuments };
