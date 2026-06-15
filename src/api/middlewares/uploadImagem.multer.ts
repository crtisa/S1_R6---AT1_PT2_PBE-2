import createMulter from "../configs/produto.multer";

const uploadImage = createMulter({
    folder: 'images',
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    fileSize: 5 * 1024 * 1024 // 5MB
});

export default uploadImage;