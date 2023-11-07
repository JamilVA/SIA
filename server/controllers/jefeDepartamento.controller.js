const JefeDepartamento = require('../models/jefeDepartamento.model');
const Persona = require('../models/persona.model');

JefeDepartamento.belongsTo(Persona, {foreignKey: 'CodigoPersona'});
Persona.hasOne(JefeDepartamento, {foreignKey:'CodigoPersona'});

const getJefeDepartamento = async (req, res) => {
    const jefesDepartamento = await JefeDepartamento.findAll({
        include: Persona
    });

    res.json({
        ok: true,
        jefesDepartamento,
    });
}

const crearJefeDepartamento = async (req, res) => {
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

        const jefeDepartamento = await JefeDepartamento.create(
            {
                Codigo: null,
                Departamento: req.body.departamento,
                FechaAlta: new Date(),
                Estado: true,
                CodigoPersona: persona.codigo
            })

        res.json({
            "Estado": "Guardado con éxito",
            persona,
            jefeDepartamento
        })
    } catch (error) {
        res.json({
            "Estado": "Error al guardar, " + error,
        })
    }
}

const actualizarJefeDepartamento = async (req, res) => {
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

        const jefeDepartamento = await JefeDepartamento.update(
            {
                Departamento: req.body.departamento,
                FechaBaja: req.body.FechaBaja,
                Estado: req.bod.estadp,
            },{
                where:{
                    CodigoPersona:req.body.codigo,
                }
            })

        res.json({
            "Estado": "Actualizado con éxito",
            persona,
            jefeDepartamento
        })
    } catch (error) {
        res.json({
            "Estado": "Error al Actualizar, " + error,
        })
    }
}


module.exports = {
    getJefeDepartamento,
    crearJefeDepartamento,
    actualizarJefeDepartamento
}