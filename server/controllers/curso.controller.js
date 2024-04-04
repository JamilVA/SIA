const {
  Curso,
  CursoCalificacion,
  CarreraProfesional,
} = require("../config/relations");

const { sequelize } = require("../config/database");
const { QueryTypes } = require("sequelize");

const PDF = require("pdfkit-table");

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
    console.log(error)
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
        from CarreraProfesional cp join Curso c on cp.Codigo = c.CodigoCarreraProfesional join CursoCalificacion cc 
        on c.Codigo = cc.CodigoCurso join Periodo p on p.Codigo = cc.CodigoPeriodo join Docente d on cc.CodigoDocente = d.Codigo 
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

const setHeader = (doc, carreraprofesional) => {
  doc.image("public/logo-escuela.jpg", 40, 15, { width: 80 });
  doc.image("public/logo-sunedu.png", doc.page.width - 40 - 80, 15, {
    width: 80,
  });

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("ESCUELA SUPERIOR DE FORMACIÓN ARTÍSTICA PÚBLICA", 0, 20, {
      align: "center",
      lineGap: 10,
    });
  doc
    .fontSize(12)
    .text("MARIO URTEAGA ALVARADO", { align: "center", lineGap: 20 });

  doc.fontSize(10).text("LISTA DE CURSOS", { align: "center", lineGap: 5 });

  doc
    .fontSize(8)
    .fillColor("blue")
    .text("Especialidad: " + carreraprofesional.dataValues.NombreCarrera, {
      align: "center",
    });

  doc
    .moveTo(30, 70)
    .lineTo(doc.page.width - 30, 70)
    .lineWidth(1.5)
    .stroke("#000000");

  doc.fillColor("black");
};

const obtenerListaCursos = async (req, res) => {
  try {
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

    let cursos = [];

    if (listaCursos.length > 0) {
      cursos = listaCursos.map((curso) => ({
        Codigo: curso.dataValues.Codigo,
        Curso: curso.dataValues.Nombre,
        Nivel: curso.dataValues.Nivel,
        Semestre: curso.dataValues.Semestre,
        Creditos: curso.dataValues.Creditos,
        Tipo: curso.dataValues.Tipo,
        HorasTeoria: curso.dataValues.HorasTeoria,
        HorasPractica: curso.dataValues.HorasPractica,
        Prerequisito: curso.dataValues.CodigoCurso
          ? curso.dataValues.CodigoCurso
          : "NO",
      }));
    } else {
      cursos = [
        {
          Codigo: "",
          Curso: "",
          Nivel: "",
          Semestre: "",
          Tipo: "",
          HorasTeoria: "",
          HorasPractica: "",
          Creditos: "",
          Prerequisito: "",
        },
      ];
    }

    const doc = new PDF({
      size: "A4",
      margins: { top: 20, left: 10, right: 10, bottom: 20 },
      autoFirstPage: false,
      bufferPages: true,
    });

    doc.on("pageAdded", () => {
      setHeader(doc, carreraprofesional);
      doc.page.margins = { top: 120, left: 10, right: 10, bottom: 20 };

    });

    doc.addPage();

    const table = {
      headers: [
        { key: "Codigo", label: "CÓDIGO", align: "left", width: 50 },
        { key: "Curso", label: "CURSO", align: "left", width: 200 },
        { key: "Nivel", label: "N", align: "left", width: 20 },
        { key: "Semestre", label: "S", align: "left", width: 20 },
        { key: "Creditos", label: "CR", align: "left", width: 20 },
        { key: "Tipo", label: "TIPO", align: "left", width: 40 },
        { key: "HorasTeoria", label: "HT", align: "left", width: 30 },
        { key: "HorasPractica", label: "HP", align: "left", width: 30 },
        {
          key: "Prerequisito",
          label: "PREREQUISITO",
          align: "left",
          width: 90,
        },
      ],
      rows: cursos.map((curso) => Object.values(curso)),
      options: {
        x: 45,
        divider: {
          header: { disabled: true },
          horizontal: { disabled: false },
        },
      },
    };

    doc.moveDown(1);

    doc.table(table, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font("Helvetica").fontSize(8);
      },
    });

    doc.pipe(res);

    doc.end();
  } catch (error) {
    console.error("Error al generar la lista de cursos:", error);
    res.status(500).send("Error al generar la lista de cursos");
  }
};


module.exports = {
  getCurso,
  crearCurso,
  actualizarCurso,
  getCursosByDP,
  buscarCurso,
  obtenerListaCursos,
};
