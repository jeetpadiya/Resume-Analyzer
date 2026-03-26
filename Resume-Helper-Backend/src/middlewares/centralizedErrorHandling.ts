export const errorHandler = (err:any, req:any, res:any, next:any) => {
    res.json(500).json({
        success: false,
        message: err.message || "Internal Server Error"
    })
}