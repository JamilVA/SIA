const generarPDF = require("../helpers/pdf")
const { Matricula, Estudiante, Persona } = require("../config/relations")


const getMatriculados = async (codigoCurso) => {
    try {
        const matriculados = await Matricula.findAll({
            where: { CodigoCursoCalificacion: codigoCurso },
            attributes: [],
            include: [
                {
                    model: Estudiante,
                    include: Persona
                }
            ]

        })

      return matriculados 
    } catch (error) {
        console.error(error)
        throw new Error("Error al obtener la lista de matriculados")
    }
}

const getPDFMatriculados = async (req, res) => {
    try {
        const data = await getMatriculados(req.query.codigoCurso)
        await generarPDF(data, res)      
    } catch (error) {
        console.error(error)       
    }
    
}

module.exports = {
    getPDFMatriculados
}