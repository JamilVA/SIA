const Docente = require('../models/docente.model');
const Persona = require('../models/persona.model');

Docente.belongsTo(Persona, {foreignKey: 'CodigoPersona'});
Persona.hasOne(Docente, {foreignKey: 'CodigoPersona'});

const getDocente = async (req, res) => {
    const docentes = await Docente.findAll({
        include: Persona
    });

    res.json({
        ok: true,
        docentes,
    });
}

const crearDocente = async (req, res) => {
    try {
        const persona = await Persona.create(
            {
                codigo: null,
                paterno: req.body.paterno,
                materno: req.body.materno,
                nombres: req.body.nombres,
                rutaFoto: req.body.rutaFoto,
                fechaNacimiento: req.body.fechaNacimiento,
                sexo: req.body.sexo,
                DNI: req.body.DNI,
                email: req.body.email,
            }
        )

        const docente = await Docente.create(
            {
                Codigo: null,
                CodigoInterno: req.body.codigoInterno,
                CondicionLaboral: req.body.condicionLaboral,
                Estado: true,
                CodigoPersona: persona.codigo
            })

        res.json({
            "Estado": "Guardado con éxito",
            persona,
            docente
        })
    } catch (error) {
        res.json({
            "Estado": "Error al guardar, " + error,
        })
    }
}

const actualizarDocente = async (req, res) => {
    try {
        const persona = await Persona.update(
            {
                paterno: req.body.paterno,
                materno: req.body.materno,
                nombres: req.body.nombres,
                rutaFoto: req.body.rutaFoto,
                fechaNacimiento: req.body.fechaNacimiento,
                sexo: req.body.sexo,
                DNI: req.body.DNI,
                email: req.body.email,
            },{
                where:{
                    codigo:req.body.codigo,
                }
            }
        )

        const docente = await Docente.update(
            {
                CodigoInterno: req.body.codigoInterno,
                CondicionLaboral: req.body.condicionLaboral,
                Estado: req.body.estado,
            },{
                where:{
                    CodigoPersona:req.body.codigo,
                }
            })

        res.json({
            "Estado": "Actualizado con éxito",
            persona,
            docente
        })
    } catch (error) {
        res.json({
            "Estado": "Error al Actualizar, " + error,
        })
    }
}


module.exports = {
    getDocente,
    crearDocente,
    actualizarDocente
}