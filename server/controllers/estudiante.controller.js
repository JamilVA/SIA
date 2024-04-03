const { sequelize } = require("../config/database");
const { QueryTypes } = require("sequelize");
const { Estudiante, Persona, Usuario, CarreraProfesional, Matricula, Periodo } = require("../config/relations")
const bcrypt = require('bcryptjs');
const PDF = require("pdfkit-construct");

Estudiante.belongsTo(CarreraProfesional, {
  foreignKey: "CodigoCarreraProfesional",
});

const getEstudiante = async (req, res) => {
  const estudiantes = await Estudiante.findAll({
    include: [
      {
        model: Persona,
        include: [
          {
            model: Usuario,
            attributes: ['Email']
          }
        ]
      },
      {
        model: CarreraProfesional
      }
    ],
  });

  const carreras = await CarreraProfesional.findAll();

  res.json({
    ok: true,
    estudiantes,
    carreras
  });
};

const getEstudiantesMatriculados = async (req, res) => {
  try {
    const estudiantes = await Estudiante.findAll({
      include: [
        {
          model: Matricula,
          attributes:['CodigoEstudiante'],
          include:[
            {
              model: Periodo,
              attributes:['Codigo'],
              where:{Estado: true}
            }
          ]
        },
        {
          model: Persona,
          attributes:['Codigo'],
          include: [
            {
              model: Usuario,
              attributes: ['Email']
            }
          ]
        },
        {
          model: CarreraProfesional,
          attributes:['NombreCarrera'],
        }
      ],
    });

    res.json({
      ok: true,
      estudiantes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en la carga de datos" });
  }
};

const getEstudianteByCodPersona = async (req, res) => {
  try {
    const estudiante = await Estudiante.findOne({
      include: [Persona, CarreraProfesional],
      where: {
        Codigo: req.query.CodigoPersona,
      },
    });

    res.json({
      ok: true,
      estudiante,
    });
  } catch (error) {
    console.log(error);
  }
};

const hash = (password) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);
    console.log(hashPassword)
    return hashPassword;
  } catch (error) {
    console.log(error);
  }
}

const crearEstudiante = async (req, res) => {
  try {
    let _persona = await Persona.findOne({ where: { DNI: req.body.DNI } });
    if (_persona) {
      return res.status(403).json({ error: "El DNI ya existe" });
    }

    let _usuario = await Usuario.findOne({ where: { Email: req.body.Email } });
    if (_usuario) {
      return res.status(403).json({ error: "El email ya existe" });
    }

    const persona = await Persona.create({
      Codigo: null,
      Paterno: req.body.Paterno,
      Materno: req.body.Materno,
      Nombres: req.body.Nombres,
      RutaFoto: req.body.RutaFoto,
      FechaNacimiento: req.body.FechaNacimiento,
      Sexo: req.body.Sexo,
      DNI: req.body.DNI,
      Direccion: req.body.Direccion,
      EmailPersonal: req.body.EmailPersonal,
      Celular: req.body.Celular
    });

    const estudiante = await Estudiante.create({
      Codigo: null,
      CodigoSunedu: req.body.CodigoSunedu,
      CreditosLlevados: req.body.CreditosLlevados,
      CreditosAprobados: req.body.CreditosAprobados,
      AnioIngreso: new Date().getFullYear().toString(),
      Estado: req.body.Estado,
      CodigoPersona: persona.Codigo,
      CodigoCarreraProfesional: req.body.CodigoCarreraProfesional,
    });

    const usuario = await Usuario.create(
      {
        Codigo: null,
        Estado: true,
        CodigoPersona: persona.Codigo,
        CodigoNivelUsuario: 4,
        Email: req.body.Email,
        Password: hash(req.body.DNI)
      });

    res.json({
      Estado: "Guardado con éxito",
      persona,
      estudiante,
      usuario
    });
  } catch (error) {
    console.log(error)
    res.status(403).json({
      error: error,
    });
  }
};

const actualizarEstudiante = async (req, res) => {
  try {
    let _persona = await Persona.findOne({ where: { DNI: req.body.DNI } });
    if (_persona && _persona.Codigo != req.body.CodigoPersona) {
      return res.status(403).json({ error: "El DNI ya existe" });
    }

    let _usuario = await Usuario.findOne({ where: { Email: req.body.Email } });
    if (_usuario && _usuario.CodigoPersona != req.body.CodigoPersona) {
      return res.status(403).json({ error: "El email ya existe" });
    }

    await Persona.update(
      {
        Paterno: req.body.Paterno,
        Materno: req.body.Materno,
        Nombres: req.body.Nombres,
        RutaFoto: req.body.RutaFoto,
        FechaNacimiento: req.body.FechaNacimiento,
        Sexo: req.body.Sexo,
        DNI: req.body.DNI,
        Direccion: req.body.Direccion,
        EmailPersonal: req.body.EmailPersonal,
        Celular: req.body.Celular
      },
      {
        where: {
          Codigo: req.body.CodigoPersona,
        },
      }
    );

    const estudiante = await Estudiante.update(
      {
        CodigoSunedu: req.body.CodigoSunedu,
        CreditosLlevados: req.body.CreditosLlevados,
        CreditosAprobados: req.body.CreditosAprobados,
        AnioIngreso: new Date().getFullYear().toString(),
        Estado: req.body.Estado,
        CodigoCarreraProfesional: req.body.CodigoCarreraProfesional,
      },
      {
        where: {
          Codigo: req.body.Codigo,
        },
      }
    );

    await Usuario.update(
      {
        Email: req.body.Email
      },
      {
        where: {
          CodigoPersona: req.body.CodigoPersona,
        }
      }
    );

    const persona = await Persona.findOne(
      {
        where: {
          Codigo: req.body.CodigoPersona,
        }
      }
    )

    res.json({
      Estado: "Actualizado con éxito",
      persona,
      estudiante,
    });
  } catch (error) {
    res.status(403).json({
      error: error,
    });
  }
};

const buscarEstudiante = async (req, res) => {
  try {
    let estudiante = await Estudiante.findOne({
      where: {
        "$Persona.DNI$": req.query.dni,
      },
      include: Persona,
    });

    res.json({
      mensaje: "Encontrado",
      estudiante,
    });
  } catch (error) {
    console.log(error);
  }
};

const getNotas = async (req, res) => {
  try {
    const matricula = await Matricula.findOne({
      where: {
        CodigoCursoCalificacion: req.query.codigoCurso,
        CodigoEstudiante: req.query.codigoEstudiante
      }
    })
    if (!matricula) {
      return res.status(404).json({ message: 'Las notas no se han encontrado' })
    }
    res.json({ matricula: matricula })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener las notas' })
  }
}

const obtenerListaEstudiantes = async (req, res) => {
  const carreraprofesional = await CarreraProfesional.findOne({
    attributes: ["NombreCarrera"],
    where: { Codigo: req.query.c },
  });

  const listaEstudiantes = await sequelize.query(`select e.CodigoSunedu, p.DNI, e.AnioIngreso, concat(p.Paterno,' ',p.Materno,' ',p.Nombres) as Nombres,
  u.Email, p.FechaNacimiento, p.Sexo, p.EmailPersonal, p.Direccion, p.Celular, e.Estado 
  from Usuario u join Persona p
  on u.CodigoPersona = p.Codigo
  join Estudiante e on p.Codigo = e.CodigoPersona
  where e.CodigoCarreraProfesional = '${req.query.c}'
  order by AnioIngreso ASC, Paterno ASC;`, { type: QueryTypes.SELECT });

  console.log("CCursos:", listaEstudiantes);

  const doc = new PDF({
    size: "A4",
    //layout: "landscape",
    margins: { top: 20, left: 10, right: 10, bottom: 20 },
    bufferPages: true,
  });

  const filename = `ListaEstudiantes${carreraprofesional.dataValues.NombreCarrera}.pdf`;

  const stream = res.writeHead(200, {
    "Content-Type": "application/pdf",
    "Content-disposition": `attachment;filename=${filename}`,
  });

  doc.on("data", (data) => {
    stream.write(data);
  });

  doc.on("end", () => {
    stream.end();
  });

  // set the header to render in every page
  doc.setDocumentHeader({ height: "15%" }, () => {
    // Agregar el logo con un tamaño más pequeño
    doc.image("public/logo-escuela.jpg", 40, 22, { width: 70 });

    // Agregar el nombre de la institución y el nombre del director
    doc
      .font("Helvetica-Bold")
      .fontSize(11)

      .text("ESCUELA SUPERIOR DE FORMACIÓN ARTÍSTICA PÚBLICA", {
        align: "center",
        lineGap: 10,
      });
    doc
      .fontSize(12)
      .text("MARIO URTEAGA ALVADADO", { align: "center", lineGap: 10 });

    doc
      .moveTo(50, 75)
      .lineTo(doc.page.width - 50, 75)
      .lineWidth(1.5)
      .stroke("#000000");

    doc.moveDown(2);

    doc.fontSize(16).text("LISTA DE ESTUDIANTES", { align: "center", lineGap: 5 });

    doc.fontSize(14).fillColor("blue").text('Especialidad: ' + carreraprofesional.dataValues.NombreCarrera, {
      align: "center",
    });
  });


  const estudiantes = listaEstudiantes.map((estudiante) => ({
    CodigoSunedu: estudiante.CodigoSunedu,
    DNI: estudiante.DNI,
    AnioIngreso: estudiante.AnioIngreso,
    Nombres: estudiante.Nombres,
    Email: estudiante.Email,
    FechaNacimiento: estudiante.FechaNacimiento,
    Sexo: estudiante.Sexo,
    EmailPersonal: estudiante.EmailPersonal,
    Direccion: estudiante.Direccion,
    Celular: estudiante.Celular,
    Estado: estudiante.dataValues ? 'ACTIVO' : 'NO ACTIVO',
  }));

  doc.addTable(
    [
      { key: "CodigoSunedu", label: "Cod. SUNEDU", align: "left" },
      { key: "DNI", label: "DNI", align: "left" },
      { key: "AnioIngreso", label: "Ingreso", align: "left" },
      { key: "Nombres", label: "Apellidos y Nombres", align: "left" },
      { key: "Email", label: "Email", align: "left" },
      { key: "Sexo", label: "Sexo", align: "left" },
      /*{ key: "EmailPersonal", label: "EmailPersonal", align: "left" },
      { key: "Direccion", label: "Dirección", align: "left" },
      { key: "Celular", label: "Celular", align: "left" },
      { key: "Estado", label: "Estado", align: "left" },*/
    ],
    estudiantes,
    {
      border: { size: 0.1, color: "#cdcdcd" },
      width: "fill_body",
      cellsPadding: 10,
      marginLeft: 45,
      marginRight: 45,
      headColor: "#ffffff",
      headAlign: "left",
      headBackground: "#002479",
      headHeight: 20,
      cellsPadding: 5,
    }
  );

  doc.render();
  doc.end();
};

module.exports = {
  getEstudiante,
  getEstudiantesMatriculados,
  crearEstudiante,
  actualizarEstudiante,
  buscarEstudiante,
  getNotas,
  getEstudianteByCodPersona,
  obtenerListaEstudiantes
};
