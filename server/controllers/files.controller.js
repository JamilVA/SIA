const multer = require('multer');
const { join } = require('path');
const fs = require('fs')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, join(__dirname, '../uploads')); // Directorio de almacenamiento de archivos
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + '-' + file.originalname); // Nombre de archivo único
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // Tamaño máximo permitido para archivos (10 MB en este caso)
}).single('file'); // Nombre del campo en el formulario

const subir = async (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error(err)
            return res.status(500).json({ error: err.message });
        } else if (err) {
            console.error(err)
            return res.status(500).json({ error: err });
        }
        return res.status(200).json(req.file);
    });
}

const descargar = async (req, res) => {
    const fileName = req.query.fileName;

    if (!fileName) {
        return res.status(400).json({ message: 'El nombre del archivo no está especificado en la consulta.' });
    }

    const filePath = join(__dirname, '../uploads/', fileName);

    try {
        //console.log(filePath);
        if (!fs.existsSync(filePath)) {
            res.status(404).json({ message: 'El archivo no existe' });      
        } 
        res.sendFile(filePath)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};


module.exports = { subir, descargar }

