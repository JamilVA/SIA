export declare namespace Sia {
    type Persona = {
        Codigo: number;
        Paterno: string;
        Materno: string;
        Nombres: string;       
    }

    type Periodo = {
        Codigo: string;
        Denominacion: string;
        Estado: boolean | null;
    }

    type Curso = {
        Codigo: string | undefined;
        Nombre: string;
        HorasTeoria: number | null;
        HorasPractica: number | null;
        Creditos: number | null;
        Nivel: number;
        Semestre: number;
        Tipo: string | undefined;
        Estado: boolean | null;
        ConPrerequisito: boolean | null;
        CodigoCurso: string | undefined;
        CodigoCarreraProfesional: number | undefined;
        [key: string]: string | string[] | number | boolean | undefined | null;
    }

    type Docente = {
        Codigo: number;
        CondicionLaboral: string;
        Estado: boolean;
        CodigoPersona: number;
        Persona: Persona | null;
    }
    
    type CursoCalificacion = {
        Codigo: string;
        EstadoAplazado: boolean;
        EstadoRecuperacion: boolean;
        EstadoNotas: boolean;
        RutaSyllabus: string;
        RutaNormas: string;
        RutaPresentacionCurso: string;
        RutaPresentacionDocente: string;
        CodigoDocente: null | number;
        CodigoCurso: string | null;
        CodigoPeriodo: string;
        Docente: Docente | null;
        Curso: Curso | null;
        [key: string]: string | number | boolean | null | Docente | Curso;
    }

    type Student = {
        Codigo: string;
        Paterno: string;
        Materno: string;
        Nombres: string;
        Estado: boolean;
        RutaFoto: string;
        FechaNacimiento: string | Date;
        Sexo: string;
        DNI: string;
        Email: string;
        CodigoSunedu: string;
        CreditosLlevados: number;
        CreditosAprobados: number;
        CodigoCarreraProfesional: number | undefined;
        CodigoPersona: number | undefined;
        Direccion: stringn | null;
        EmailPersonal: string | null,
        Celular: string | null,
        [key: string]: string | number | boolean | string[{}];
    }

    type CarreraProfesional = {
        Codigo: number;
        NombreCarrera: string;
        RutaPlanEstudios: string;
        CodigoJefeDepatamento: number;
    }

    type RegistroMatricula = {
        CodigoSunedu: string,
        CodigoEstudiante: number,
        CodigoCursoCalificacion: string,
        Alumno: string,
        Nota1: number | null,
        Nota2: number | null,
        Nota3: number | null,
        Nota4: number | null,
        NotaRecuperacion: number | null,
        NotaAplazado: number | null,
        NotaDirigido: number | null,
        NotaFinal: number | null,
        PorcentajeAsistencia: number,
        Obs: string,
        Obs: string,
        [key: string]: string | string[] | number | boolean | undefined | null;
    }

    type Acta = {
        Codigo: string,
        FechaGeneracion: string,
        CodigoCursoCalificacion: string,
    }
}

