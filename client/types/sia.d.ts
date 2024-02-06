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
}

