import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({ 
    storage,
    limits:{
        fieldSize:5*1024*1024
    },
    fileFilter:(req,file,cb)=>{
        const allowedTypes = [
            "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];
        if(allowedTypes.includes(file.mimetype)){
            cb(null,true);
        }
        else {
            cb(new Error("Unsupported file type"));
        }

    }

});