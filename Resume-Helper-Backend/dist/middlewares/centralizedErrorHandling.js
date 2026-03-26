export const errorHandler = (err, req, res, next) => {
    res.json(500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
};
