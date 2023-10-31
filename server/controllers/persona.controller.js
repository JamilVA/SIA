const { response } = require('express');
const Persona = require('../models/Persona')

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
            msg: 'El error eres tu'
        });
    }
}

const getPersona = async (req, res) => {
    //const desde = Number(req.query.desde) || 0;
    //const limite = Number(req.query.limite) || 0;
    const personas = await sequelize.models.Persona.findAll();

    res.json({
        ok: true,
        personas,
    });
}

/*const actualizarMascota = async (req, res) => {
    const uid = req.params.id;
    try {
        const mascotaDB = await Mascota.findById(uid);

        if (!mascotaDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe una mascota con ese id'
            });
        }

        //Codigo previo a la actualizacion 
        const { nombre, dueño, categoria, ...campos } = req.body;

        //actualizacion de datos
        const mascotaActualizada = await Mascota.findByIdAndUpdate(uid, campos, { new: true });

        res.json({
            ok: true,
            mascota: mascotaActualizada
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al actualizar mascota'
        });
    }
}
const eliminarMascota = async (req, res = response) => {
    const id = req.params.id;

    try {
        const atencion = await Atencion.findOne({ mascota: id });
        if (atencion) {
            return res.status(404).json({
                ok: true,
                msg: 'No se puede eliminar porque se encuentra en una atención',
            });
        } else {
            const mascota = await Mascota.findById(id);

            if (!mascota) {
                return res.status(404).json({
                    ok: true,
                    msg: 'La mascota no  fue encontrada por  id',
                });
            }

            await Mascota.findByIdAndDelete(id);

            res.json({
                ok: true,
                msg: 'Mascota borradoLa mascota se ha eliminado'
            });

        }
    } catch (error) {

        console.log(error);

        res.status(500).json({
            ok: false,
            msg: 'La mascota  no puede eliminarse, consulte con el administrador'
        })
    }
}*/
module.exports = {
    getPersona,
    crearPersona,
    // eliminarMascota,
    // actualizarMascota
}