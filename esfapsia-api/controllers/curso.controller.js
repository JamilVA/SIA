const {
  Curso,
  CursoCalificacion,
  CarreraProfesional,
} = require("../config/relations");

const { sequelize } = require("../config/database");
const { QueryTypes } = require("sequelize");

const PDF = require("pdfkit-construct");

const getCurso = async (req, res) => {
  const cursos = await Curso.findAll({ include: CarreraProfesional });

  const carreras = await CarreraProfesional.findAll();

  res.json({
    ok: true,
    cursos,
    carreras,
  });
};

const crearCurso = async (req, res) => {
  try {
    const curso = await Curso.create({
      Codigo: req.body.Codigo,
      Nombre: req.body.Nombre,
      HorasTeoria: req.body.HorasTeoria,
      HorasPractica: req.body.HorasPractica,
      Creditos: req.body.Creditos,
      Nivel: req.body.Nivel,
      Semestre: req.body.Semestre,
      Tipo: req.body.Tipo,
      Estado: req.body.Estado,
      ConPrerequisito: req.body.ConPrerequisito,
      CodigoCurso: req.body.CodigoCurso,
      CodigoCarreraProfesional: req.body.CodigoCarreraProfesional,
    });

    res.json({
      Estado: "Creado con éxito",
      curso,
    });
  } catch (error) {
    res.json({
      Estado: "Error",
      Error: error,
    });
  }
};

const actualizarCurso = async (req, res) => {
  try {
    const curso = await Curso.update(
      {
        Nombre: req.body.Nombre,
        HorasTeoria: req.body.HorasTeoria,
        HorasPractica: req.body.HorasPractica,
        Creditos: req.body.Creditos,
        Nivel: req.body.Nivel,
        Semestre: req.body.Semestre,
        Tipo: req.body.Tipo,
        Estado: req.body.Estado,
        ConPrerequisito: req.body.ConPrerequisito,
        CodigoCurso: req.body.CodigoCurso,
        CodigoCarreraProfesional: req.body.CodigoCarreraProfesional,
      },
      {
        where: {
          Codigo: req.body.Codigo,
        },
      }
    );

    res.json({
      Estado: "Actualizado con éxito",
      curso,
    });
  } catch (error) {
    res.json({
      Estado: "Error",
    });
  }
};

const buscarCurso = async (req, res) => {
  try {
    const curso = await Curso.findOne({
      include: [
        {
          model: CursoCalificacion,
          where: {
            Codigo: req.query.codigo,
          },
        },
      ],
    });
    if (!curso) {
      return res.json({ message: "Curso no encontrado" });
    }
    res.json({ curso });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al buscar el curso" });
  }
};

const getCursosByDP = async (req, res) => {
  try {
    _codDocente = req.query.CodDocente;
    const cursos = await sequelize.query(
      `select c.Codigo as CodCurso, cc.Codigo as CodCursoCal, c.Nombre, cp.NombreCarrera as Carrera 
        from carreraprofesional cp join curso c on cp.Codigo = c.CodigoCarreraProfesional join cursocalificacion cc 
        on c.Codigo = cc.CodigoCurso join periodo p on p.Codigo = cc.CodigoPeriodo join docente d on cc.CodigoDocente = d.Codigo 
        where d.Codigo = ${
          req.query.CodDocente == undefined ? 0 : _codDocente
        } and p.Estado = 1`,
      { type: QueryTypes.SELECT }
    );

    res.json({
      ok: true,
      cursos,
    });
  } catch (error) {
    res.json({
      Estado: "Error" + error,
    });
  }
};

const obtenerListaCursos = async (req, res) => {
  console.log("Recibido:", req.query);

  const carreraprofesional = await CarreraProfesional.findOne({
    attributes: ["NombreCarrera"],
    where: { Codigo: req.query.c },
  });

  const listaCursos = await Curso.findAll({
    attributes: {
      exclude: ["ConPrerrequisito", "Estado"],
    },
    where: { CodigoCarreraProfesional: req.query.c },
  });

  console.log("CCarrera:", carreraprofesional);
  console.log("CCursos:", listaCursos);

  const doc = new PDF({
    size: "A4",
    margins: { top: 20, left: 10, right: 10, bottom: 20 },
    bufferPages: true,
  });

  const filename = `ListaCursos${carreraprofesional.dataValues.NombreCarrera}.pdf`;

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

    doc.fontSize(16).text("LISTA DE CURSOS", { align: "center", lineGap: 5 });

    doc
      .fontSize(14)
      .fillColor("blue")
      .text("Especialidad: " + carreraprofesional.dataValues.NombreCarrera, {
        align: "center",
      });
  });

  let cursos = [];

  if (listaCursos.length > 0) {
    cursos = listaCursos.map((curso) => ({
      Codigo: curso.dataValues.Codigo,
      Curso: curso.dataValues.Nombre,
      Nivel: curso.dataValues.Nivel,
      Semestre: curso.dataValues.Semestre,
      Tipo: curso.dataValues.Tipo,
      HorasTeoria: curso.dataValues.HorasTeoria,
      HorasPractica: curso.dataValues.HorasPractica,
      Creditos: curso.dataValues.Creditos,
      Prerequisito: curso.dataValues.CodigoCurso
        ? curso.dataValues.CodigoCurso
        : "NO",
    }));
  }else {
    cursos= [ {
      Codigo: '',
      Curso: '',
      Nivel: '',
      Semestre: '',
      Tipo: '',
      HorasTeoria: '',
      HorasPractica: '',
      Creditos: '',
      Prerequisito: '',
    }]
  }

  console.error("CCu", cursos);

  doc.addTable(
    [
      { key: "Codigo", label: "Codigo", align: "left" },
      { key: "Curso", label: "Curso", align: "left" },
      { key: "Nivel", label: "N", align: "left" },
      { key: "Semestre", label: "S", align: "left" },
      { key: "Creditos", label: "Cr", align: "left" },
      { key: "Tipo", label: "Tipo", align: "left" },
      { key: "HorasTeoria", label: "HT", align: "left" },
      { key: "HorasPractica", label: "HP", align: "left" },
      { key: "Prerequisito", label: "Prerequisito", align: "left" },
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

  doc.render();

  doc.end();
};

module.exports = {
  getCurso,
  crearCurso,
  actualizarCurso,
  getCursosByDP,
  buscarCurso,
  obtenerListaCursos,
};
