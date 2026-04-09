const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req,file,cb)=> {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if(mimetype && extname){
        return cb(null,true);
    }else{
        cb(new Error('Only image and video files are allowed'));

    }
};

const upload = multer({
    storage,
    limits: {fileSize: 100*1024*1024},
    fileFilter,
});

module.exports = upload;
