const {
  Curso,
  CursoCalificacion,
  Estudiante,
  Matricula,
  Periodo,
  Persona,
  CarreraProfesional,
  Usuario,
} = require("../config/relations");

const { sequelize } = require("../config/database");
const { QueryTypes } = require("sequelize");

// const PDF = require('pdfkit');
const PDF = require("pdfkit-construct");

const getMatricula = async (req, res) => {
  try {
    const CodigoEstudiante = req.query.CodigoEstudiante;

    const estudiante = await Estudiante.findOne({
      include: [
        {
          model: Persona,
          attributes: ["Nombres", "Paterno", "Materno"],
        },

      ],
      where: { Codigo: CodigoEstudiante }

    });

    const matriculas = await Matricula.findAll({
      attributes: {
        exclude: ["Observacion", "Habilitado", "PorcentajeAsistencia"],
      },
      where: { CodigoEstudiante },
    });

    const cursosCalificacion = await CursoCalificacion.findAll({
      attributes: ["Codigo"],
      include: [
        {
          model: Curso,
          attributes: [
            "Codigo",
            "Nombre",
            "Creditos",
            "Nivel",
            "Semestre",
            "CodigoCurso",
            "CodigoCarreraProfesional",
          ],
          where: {
            CodigoCarreraProfesional: estudiante.CodigoCarreraProfesional,
          },
        },
        {
          model: Periodo,
          attributes: ["Codigo", "InicioMatricula", "FinMatricula"],
          where: { Estado: true },
        },
      ],
    });

    const periodo = await Periodo.findOne({
      where: { estado: true },
    });

    res.json({
      ok: true,
      estudiante,
      matriculas,
      cursosCalificacion,
      periodo,
    });
  } catch (error) {
    res.json({
      Estado: "Error al cargar matriculas, " + error,
    });
  }
};

const buscarEstudiante = async (req, res) => {
  try {
    const { CodigoSunedu } = req.query;
    let estudiante = await Estudiante.findOne({
      include: [
        {
          model: Persona,
          attributes: {
            exclude: ["DNI", "FechaNacimiento", "Sexo", "RutaFoto"],
          },
        },
      ],
      where: { CodigoSunedu: CodigoSunedu },
    });

    res.json({
      mensaje: "Encontrado",
      estudiante,
    });
  } catch (error) {
    console.log(error);
  }
};

const crearMatricula = async (req, res) => {
  try {
    const matricula = await Matricula.create({
      CodigoCursoCalificacion: req.body.codigoCursoCalificacion,
      CodigoEstudiante: req.body.codigoEstudiante,
      FechaMatricula: req.body.fechaMatricula,
    });

    res.json({
      Estado: "Guardado con éxito",
      matricula,
    });
  } catch (error) {
    res.json({
      Estado: "Error al guardar, " + error,
    });
  }
};

const eliminarMatricula = async (req, res) => {
  try {
    const matriculaEliminada = await Matricula.destroy({
      where: {
        CodigoCursoCalificacion: req.body.codigoCursoCalificacion,
        CodigoEstudiante: req.body.codigoEstudiante,
      },
    });

    res.json({
      Estado: "Eliminado con éxito",
      matriculaEliminada,
    });
  } catch (error) {
    res.json({
      Estado: "Error al eliminar, " + error,
    });
  }
};

const actualizarMatricula = async (req, res) => {
  try {
    const persona = await Persona.update(
      {
        Paterno: req.body.paterno,
        Materno: req.body.materno,
        Nombres: req.body.nombres,
        RutaFoto: req.body.rutaFoto,
        FechaNacimiento: req.body.fechaNacimiento,
        Sexo: req.body.sexo,
        DNI: req.body.DNI,
        Email: req.body.email,
      },
      {
        where: {
          Codigo: req.body.codigoPersona,
        },
      }
    );

    res.json({
      Estado: "Actualizado con éxito",
      persona,
      docente,
    });
  } catch (error) {
    res.json({
      Estado: "Error al Actualizar, " + error,
    });
  }
};

const getMatriculaByCurso = async (req, res) => {
  try {
    const curso = await Curso.findOne({
      attributes: ["Codigo", "Nombre"],
      include: [
        {
          model: CursoCalificacion,
          attributes: [
            "Codigo",
            "EstadoNotas",
            "EstadoRecuperacion",
            "EstadoAplazado",
          ],
          where: { Codigo: req.query.codCurso },
          include: [
            {
              model: Periodo,
              attributes: ["Codigo", "Estado"],
              where: { Estado: true },
            },
          ],
        },
        {
          model: CarreraProfesional,
          attributes: ["Codigo"],
        },
      ],
    });

    const registroMatricula = await sequelize.query(
      `select e.CodigoSunedu, m.CodigoEstudiante, m.CodigoCursoCalificacion, concat(p.Paterno,' ', p.Materno,' ', p.Nombres) as Alumno, m.Nota1, m.Nota2, m.Nota3, m.Nota4, m.NotaRecuperacion, m.NotaFinal, m.NotaAplazado, m.PorcentajeAsistencia 
    from curso c join cursocalificacion cc
    on c.Codigo = cc.CodigoCurso join matricula m
    on cc.Codigo = m.CodigoCursoCalificacion join periodo pd
    on cc.CodigoPeriodo = pd.Codigo join estudiante e
    on m.CodigoEstudiante = e.Codigo join persona p
    on e.CodigoPersona = p.Codigo
    where cc.Codigo = '${req.query.codCurso}' and pd.Estado = 1
    order by Alumno ASC;`,
      { type: QueryTypes.SELECT }
    );

    res.json({
      curso,
      registroMatricula,
    });
  } catch (error) {
    res.json({
      error: error + "",
    });
  }
};

const updateNotas = async (req, res) => {
  const n1 = req.body.Nota1;
  try {
    const matricula = await Matricula.update(
      {
        Nota1: req.body.Nota1,
        Nota2: req.body.Nota2,
        Nota3: req.body.Nota3,
        Nota4: req.body.Nota4,
        NotaRecuperacion: req.body.NotaRecuperacion,
        NotaAplazado: req.body.NotaAplazado,
        NotaFinal: req.body.NotaFinal,
      },
      {
        where: {
          CodigoEstudiante: req.body.CodigoEstudiante,
          CodigoCursoCalificacion: req.body.CodigoCursoCalificacion,
        },
      }
    );
    res.json({
      Matricula: matricula,
      Estado: "Actualizado con éxito",
    });
  } catch (error) {
    res.json({
      Estado: "Error" + error,
    });
  }
};


const obtenerConstancia = async (req, res) => {
  console.log("Recibido:", req.query);

  const estudiante = await Estudiante.findOne({
    attributes: ["CodigoSunedu", "AnioIngreso"],
    include: [
      {
        model: Persona,
        attributes: ["Nombres", "Paterno", "Materno", "Email"],
      },
      {
        model: CarreraProfesional,
        attributes: ["NombreCarrera"],
      },
    ],
    where: { Codigo: req.query.c },
  });

  const matriculas = await Matricula.findAll({
    attributes: {
      exclude: ["Observacion", "Habilitado", "PorcentajeAsistencia"],
    },
    include: [
      {
        model: CursoCalificacion,
        include: [
          {
            model: Curso,
            attributes: ["Codigo", "Nombre", "Creditos", "Nivel", "Semestre"],
          },
        ],
      },
    ],
    where: { CodigoEstudiante: req.query.c },
  });

  console.log("EEstudiante:", estudiante);
  console.log("MMatricula:", matriculas);

  const doc = new PDF({
    size: "A4",
    margins: { top: 20, left: 10, right: 10, bottom: 20 },
    bufferPages: true,
  });

  const filename = "ConstanciaMatriculaEstudiante.pdf";

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
  doc.setDocumentHeader({ height: "29%" }, () => {
    // Agregar el logo con un tamaño más pequeño
    doc.image("uploads/logoE.png", 40, 22, { width: 70 });

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

    doc.fontSize(16).text("CONSTANCIA DE MATRÍCULA", { align: "center", lineGap: 5 });

    doc
      .fontSize(8)
      .fillColor("blue")
      .text(
        `Fecha de generación: ${new Date().toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}`,
        { align: "center", lineGap: 5 }
      );
    doc
      .fontSize(6)
      .fillColor("red")
      .text(' Esta Constancia de Matricula "NO" Tiene Valor Oficial, al no Contar con el Sello Correspondiente.',
        { align: "center", lineGap: 25 }
      );

    doc.fontSize(11).fillColor("black").text(`DATOS DEL ESTUDIANTE:`, {
      align: "left",
      indent: 50,
      lineGap: 10,
    });

    doc.font("Helvetica-Bold").text(`Codigo Sunedu:  `, {
      align: "left",
      indent: 50,
      continued: true,
    });

    doc.font("Helvetica").text(estudiante.dataValues.CodigoSunedu, {
      align: "left",
      indent: 50,
      lineGap: 5,
    });

    doc.font("Helvetica-Bold").text(`Nombres y Apellidos:  `, {
      align: "left",
      indent: 50,
      continued: true,
    });

    doc
      .font("Helvetica")
      .text(
        estudiante.dataValues.Persona.Nombres +
          " " +
          estudiante.dataValues.Persona.Paterno +
          " " +
          estudiante.dataValues.Persona.Materno,
        {
          align: "left",
          indent: 50,
          lineGap: 5,
        }
      );

    doc.font("Helvetica-Bold").text(`Email:  `, {
      align: "left",
      indent: 50,
      continued: true,
    });

    doc.font("Helvetica").text(estudiante.dataValues.Persona.Email, {
      align: "left",
      indent: 50,
      lineGap: 5,
    });

    doc.font("Helvetica-Bold").text(`Especialidad:  `, {
      align: "left",
      indent: 50,
      continued: true,
    });

    doc.font("Helvetica").text(estudiante.dataValues.CarreraProfesional.NombreCarrera, {
      align: "left",
      indent: 50,
      lineGap: 5,
    });
  });


  let cursos = [];

  if (matriculas.length > 0) {
    cursos = matriculas.map((matricula) => ({
      Codigo: matricula.dataValues.CursoCalificacion.Curso.Codigo,
      Curso: matricula.dataValues.CursoCalificacion.Curso.Nombre,
      Nivel: matricula.dataValues.CursoCalificacion.Curso.Nivel,
      Semestre: matricula.dataValues.CursoCalificacion.Curso.Semestre,
      Creditos: matricula.dataValues.CursoCalificacion.Curso.Creditos,
      Fecha: new Date(matricula.dataValues.FechaMatricula).toLocaleDateString(
        "es-ES",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      ),
    }));
  }else {
    cursos= [ {
      Codigo: '',
      Curso: '',
      Nivel: '',
      Semestre: '',
      Creditos: '',
      Fecha: '',
    }]
  }

  console.error("CCu", cursos);

  doc.addTable(
    [
      { key: "Codigo", label: "Codigo", align: "left" },
      { key: "Curso", label: "Curso", align: "left" },
      { key: "Nivel", label: "Nivel", align: "left" },
      { key: "Semestre", label: "Semestre", align: "left" },
      { key: "Creditos", label: "Créditos", align: "left" },
      { key: "Fecha", label: "Fecha", align: "left" },
    ],
    cursos,
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

  // // set the footer to render in every page
  // doc.setDocumentFooter({}, () => {
  //   doc
  //     .lineJoin("miter")
  //     .rect(0, doc.footer.y, doc.page.width, doc.footer.options.heightNumber)
  //     .fill("#c2edbe");

  //   doc
  //     .fill("#7416c8")
  //     .fontSize(8)
  //     .text("Hello world footer", doc.footer.x, doc.footer.y + 10);
  // });

  doc.render();

  doc.end();
};

module.exports = {
  getMatricula,
  crearMatricula,
  actualizarMatricula,
  eliminarMatricula,
  buscarEstudiante,
  getMatriculaByCurso,
  updateNotas,
  obtenerConstancia,
};
