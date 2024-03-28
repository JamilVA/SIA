const { Persona} = require("../config/relations")

const crearPersona = async (req, res = response) => {
    try {

        const paterno = req.body.paterno;
        const materno = req.body.materno;
        const nombres = req.body.nombres;
        const rutaFoto = req.body.rutaFoto;
        const fechaNacimiento = req.body.fechaNacimiento;
        const sexo = req.body.sexo;
        const DNI = req.body.DNI;
        const correo = req.body.correo;

        const persona = new Persona(req.body);

        await persona.save();

        res.json({
            ok: true,
            persona
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: ''
        });
    }
}

const getPersona = async (req, res) => {
    try {
        const persona = await Persona.findOne(
            {
                where: {
                    Codigo: req.query.codPersona
                }
            }
        );
        res.json({
            ok: true,
            persona,
        });
    } catch (error) {
        console.log(error)
        res.json({
            ok: false,
            Error: error,
        })
    }
}

module.exports = {
    getPersona,
    crearPersona,
}