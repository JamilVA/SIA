'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import { classNames } from 'primereact/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';

import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';

export default function Matricula() {

    const estudianteVacio = {
        AnioIngreso: '',
        Codigo: 0,
        CodigoCarreraProfesional: 0,
        CodigoPersona: 0,
        CodigoSunedu: '',
        CreditosLlevados: 0,
        CreditosAprobados: 0,
        Estado: '',
        Persona: {
            Codigo: 0,
            DNI: '',
            Email: '',
            Nombres: '',
            Paterno: '',
            Materno: ''
        }
    };

    const matriculaVacia = {
        CodigoCursoCalificacion: '',
        CodigoEstudiante: '',
        FechaMatricula: '',
        NotaFinal: 0
    };

    const cursoCVacio = {
        Codigo: '',
        Curso: {
            Codigo: '',
            CodigoCurso: '',
            Nombre: '',
            Creditos: 0,
            Nivel: 0,
            Semestre: 0,
            CodigoCarreraProfesional: ''
        },
        Periodo: {
            Codigo: ''
        }
    };

    const periodoVacio = {
        Codigo: '',
        Estado: false
    };

    const [matriculaDialog, setMatriculaDialog] = useState(false);
    const [deleteMatriculaDialog, setDeleteMatriculaDialog] = useState(false);

    const [matricula, setMatricula] = useState(matriculaVacia);
    const [cursoCalificacion, setCursoCalificaion] = useState(cursoCVacio);
    const [estudiante, setEstudiante] = useState(estudianteVacio);
    const [inputValue, setInputValue] = useState('');
    const [periodoActual, setPeriodoActual] = useState(periodoVacio);

    const [matriculas, setMatriculas] = useState<(typeof matricula)[]>([]);
    const [cursosCalificacion, setCursosCalificacion] = useState<(typeof cursoCalificacion)[]>([]);

    const [cursosLlevar, setCursosLlevar] = useState<(typeof cursoCalificacion)[]>([]);
    const [cursosMatriculados, setCursosMatriculados] = useState<(typeof cursoCalificacion)[]>([]);

    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]> | null>(null);

    useEffect(() => {}, []);

    useEffect(() => {
        if (cursosCalificacion.length > 0) {
            const cursosMatriculados = buscarCursosMatriculados();
            setCursosMatriculados(cursosMatriculados);

            const cursosLlevar = buscarCursosLlevar(cursosMatriculados);
            setCursosLlevar(cursosLlevar);
        }
    }, [matriculas, cursosCalificacion, estudiante]);

    const buscarCursosLlevar = (cursosMatriculados: (typeof cursoCalificacion)[]) => {
        const ultimaMatricula = matriculas.filter((m: any) => m.CodigoCursoCalificacion.slice(-3) !== periodoActual.Codigo).pop();

        if (ultimaMatricula) {
            const nivelSemestreAnterior = ultimaMatricula.CodigoCursoCalificacion.slice(1, 3);
            const nivelSemestre = nivelSemestreAnterior[1] === '1' ? Number(nivelSemestreAnterior) + 1 : Number(nivelSemestreAnterior) + 9;
            const matriculasAprobadas = matriculas.filter((m) => m.NotaFinal >= 11);

            const cursosAbiertos: (typeof cursoCalificacion)[] = cursosCalificacion
                .filter((c) => c.Curso.Nivel * 10 + c.Curso.Semestre <= Number(nivelSemestre))
                .filter((curso) => !matriculasAprobadas.some((matricula) => matricula.CodigoCursoCalificacion.startsWith(curso.Curso.Codigo)))
                .filter((curso) => {
                    const codigoCursoMatriculaAprobada = matriculasAprobadas.find((matricula) => matricula.CodigoCursoCalificacion.startsWith(curso.Curso.CodigoCurso));
                    return curso.Curso.CodigoCurso === null || codigoCursoMatriculaAprobada;
                });

            console.log('Cursos matriculados', cursosMatriculados);
            const cursosDisponibles = cursosAbiertos.filter((curso) => {
                return !cursosMatriculados.some((c) => c.Codigo === curso.Codigo);
            });
            console.log('cursosAbiertos', cursosAbiertos);
            console.log('Cursos sin matricula', cursosDisponibles);
            return cursosDisponibles;
        } else {
            console.log('Hola, alumno nuevo');
            console.log('Cursos matriculados', cursosMatriculados);

            const cursosAbiertos: (typeof cursoCalificacion)[] = cursosCalificacion.filter((c) => c.Curso.Nivel == 1 && c.Curso.Semestre == 1);
            const cursosDisponibles = cursosAbiertos.filter((curso) => {
                return !cursosMatriculados.some((c) => c.Codigo === curso.Codigo);
            });
            console.log('Cursos sin matricula', cursosDisponibles);
            console.log('cursosAbiertos', cursosAbiertos);
            return cursosDisponibles;
        }
    };

    const buscarCursosMatriculados = () => {
        const matriculasActuales = matriculas.filter((m: any) => m.CodigoCursoCalificacion.slice(-3) === periodoActual.Codigo).map((m: any) => m.CodigoCursoCalificacion);
        const cursosMatriculados = cursosCalificacion.filter((c: any) => matriculasActuales.includes(c.Codigo));
        return cursosMatriculados;
    };

    const buscarEstudiante = async (CodigoSunedu: string) => {
        await axios
            .get('http://localhost:3001/api/matricula/buscarEstudiante', {
                params: {
                    CodigoSunedu: CodigoSunedu
                }
            })
            .then(async (response) => {
                console.log('Estudiante encuntrado:', response.data.estudiante);
                if (response.data.estudiante !== null) {
                    setEstudiante(response.data.estudiante);
                    try {
                        const { data } = await axios.get('http://localhost:3001/api/matricula', {
                            params: {
                                Email: response.data.estudiante.Persona.Email
                            }
                        });
                        const { matriculas, periodo, cursosCalificacion } = data;
                        setMatriculas(matriculas);
                        setPeriodoActual(periodo);
                        setCursosCalificacion(cursosCalificacion);
                        setCursosMatriculados(buscarCursosMatriculados());
                    } catch (e) {
                        console.error(e);
                    }
                } else {
                    setEstudiante(estudianteVacio);
                    toast.current?.show({
                        severity: 'info',
                        summary: 'No encontrado',
                        detail: 'No se ha encontrado ningún estudiante con Codigo: ' + inputValue,
                        life: 3000
                    });
                }
            })
            .catch((error) => {
                console.log(error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operación fallida',
                    detail: 'Ha ocurrido un error al buscar el estudiante',
                    life: 3000
                });
            });
    };

    const crearMatricula = async (rowData: any) => {
        console.log('Curso:', rowData.Codigo);
        console.log('Estudiante:', estudiante.Codigo);
        console.log('Fecha Matricula:', new Date());
        axios
            .post('http://localhost:3001/api/matricula', {
                codigoCursoCalificacion: rowData.Codigo,
                codigoEstudiante: estudiante.Codigo,
                fechaMatricula: new Date()
            })
            .then((response) => {
                console.log(response.data);
                toast.current!.show({ severity: 'success', summary: 'Successful', detail: ' Matriculado con éxito', life: 3000 });
                setCursosLlevar((cursosLlevar) => cursosLlevar.filter((curso) => curso.Codigo !== rowData.Codigo));
                setCursosMatriculados((cursosMatriculados) => [...cursosMatriculados, rowData]);
            });

        setMatriculaDialog(false);
        setCursoCalificaion(cursoCVacio);
    };

    const eliminarMatricula = async (curso: any) => {
        console.log('Datos recibidos para la eliminacion:', estudiante.Codigo, curso.Codigo);
        axios
            .post('http://localhost:3001/api/matricula/eliminar', {
                codigoEstudiante: estudiante.Codigo,
                codigoCursoCalificacion: curso.Codigo
            })
            .then((response) => {
                console.log(response.data);
                toast.current!.show({ severity: 'success', summary: 'Successful', detail: ' Eliminado con éxito', life: 3000 });
                setCursosMatriculados((cursosMatriculados) => cursosMatriculados.filter((c) => c.Codigo !== curso.Codigo));
                setCursosLlevar((cursosLlevar) => [...cursosLlevar, curso]);
                // fetchData();
                setDeleteMatriculaDialog(false);
                setCursoCalificaion(cursoCVacio);
            });
    };

    // const hideDialog = () => {
    //     setSubmitted(false);
    //     setDocenteDialog(false);
    // };

    const hideMatriculaDialog = () => {
        setMatriculaDialog(false);
    };

    const hideDeleteMatriculaDialog = () => {
        setDeleteMatriculaDialog(false);
    };

    const newMatricula = (curso: any) => {
        setCursoCalificaion(curso);
        setMatriculaDialog(true);
    };

    const confirmDeleteMatricula = (curso: any) => {
        setCursoCalificaion(curso);
        setDeleteMatriculaDialog(true);
    };

    // const exportCSV = () => {
    //     dt.current!.exportCSV();
    // };

    const codigoBodyTemplate = (rowData: any) => {
        return rowData.Codigo.slice(0, 5);
    };

    const cursoBodyTemplate = (rowData: any) => {
        return rowData.Curso.Nombre;
    };

    const nivelBodyTemplate = (rowData: any) => {
        return rowData.Curso.Nivel;
    };

    const semestreBodyTemplate = (rowData: any) => {
        return rowData.Curso.Semestre;
    };

    const creditosBodyTemplate = (rowData: any) => {
        return rowData.Curso.Creditos;
    };

    const actionBodyTemplate1 = (rowData: any) => {
        return (
            <React.Fragment>
                <Button label="Agregar" icon="pi pi-plus" className="p-button-success p-button-sm" style={{ padding: '0.75em', fontSize: '0.75em' }} onClick={() => newMatricula(rowData)} />
            </React.Fragment>
        );
    };

    const actionBodyTemplate2 = (rowData: any) => {
        return (
            <React.Fragment>
                <Button label="Eliminar" icon="pi pi-times" className="p-button-danger p-button-sm" style={{ padding: '0.75em', fontSize: '0.75em' }} onClick={() => confirmDeleteMatricula(rowData)} />
            </React.Fragment>
        );
    };

    const header1 = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Cursos a Llevar</h4>
            <div className="flex flex-wrap gap-2">
                <Button
                    label="Horarios"
                    icon="pi pi-calendar"
                    className="p-button-info"
                    onClick={() => {
                        setCursosLlevar(buscarCursosLlevar(cursosMatriculados));
                    }}
                />
                <Button
                    label="Actualizar"
                    icon="pi pi-refresh"
                    className="p-button-warning"
                    onClick={() => {
                        setCursosLlevar(buscarCursosLlevar(cursosMatriculados));
                    }}
                />
            </div>
        </div>
    );

    const header2 = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Cursos Matriculados</h4>
            <div className="flex flex-wrap gap-2">
                <Button label="Actualizar" icon="pi pi-refresh" className="p-button-warning" onClick={() => setCursosMatriculados(buscarCursosMatriculados)} />
            </div>
        </div>
    );

    const deleteMatriculaDialogFooter = () => {
        return (
            <React.Fragment>
                <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteMatriculaDialog} />
                <Button label="Si" icon="pi pi-check" severity="danger" onClick={() => eliminarMatricula(cursoCalificacion)} />
            </React.Fragment>
        );
    };
    const matriculaDialogFooter = () => {
        return (
            <React.Fragment>
                <Button label="No" icon="pi pi-times" outlined onClick={hideMatriculaDialog} />
                <Button label="Si" icon="pi pi-check" severity="success" onClick={() => crearMatricula(cursoCalificacion)} />
            </React.Fragment>
        );
    };

    const user = {
        name: 'Nombre del Usuario',
        jobTitle: 'Carrera Profesional',
        email: 'usuario@example.com'
    };

    const header = <img alt="Profile" src="imagen_del_perfil.jpg" />;

    const footer = (
        <span>
            <small>Email: {user.email}</small>
        </span>
    );

    return (
        <div className="grid">
            <div className="col-3">
                <div>
                    <br />
                    <br />
                    <h4 className="m-0">Buscar estudiante</h4>
                    <br />
                    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                        <span className="block mt-2 md:mt-0">
                            <InputText
                                value={inputValue}
                                autoFocus
                                type="search"
                                placeholder="Ingrese Codigo Sunedu del estudiante"
                                onChange={(e) => {
                                    setInputValue(e.target.value);
                                }}
                            />
                        </span>
                        <Button
                            icon="pi pi-search"
                            className="ml-2  p-input-icon-right"
                            onClick={() => {
                                buscarEstudiante(inputValue);
                            }}
                        />
                    </div>
                </div>
                <h5 className="mb-3">Datos del estudiante</h5>
                <div className="col">
                    <label htmlFor="">Apellidos: </label>
                    <label>
                        {estudiante.Persona.Paterno} {estudiante.Persona.Materno}
                    </label>
                </div>
                <div className="col">
                    <label htmlFor="">Nombres: </label>
                    <label>{estudiante.Persona.Nombres}</label>
                </div>
            </div>
            <div className="col-9">
                <Toast ref={toast} />
                <div className="card">
                    <DataTable
                        ref={dt}
                        value={cursosLlevar}
                        dataKey="Codigo"
                        paginator
                        rows={5}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} cursos a matricular"
                        globalFilter={globalFilter}
                        header={header1}
                    >
                        <Column field="Codigo" header="Codigo" body={codigoBodyTemplate} style={{ minWidth: '4rem' }}></Column>
                        <Column field="Curso.Nombre" header="Curso" body={cursoBodyTemplate} sortable style={{ minWidth: '16rem' }}></Column>
                        <Column header="Nivel" body={nivelBodyTemplate} style={{ minWidth: '4rem' }}></Column>
                        <Column header="Semestre" body={semestreBodyTemplate} style={{ minWidth: '4rem' }}></Column>
                        <Column header="Creditos" body={creditosBodyTemplate} style={{ minWidth: '4rem' }}></Column>
                        <Column body={actionBodyTemplate1} exportable={false} style={{ minWidth: '8rem' }}></Column>
                    </DataTable>
                </div>

                <div className="card">
                    <DataTable
                        ref={dt}
                        value={cursosMatriculados}
                        dataKey="Codigo"
                        paginator
                        rows={5}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} cursos matriculados"
                        globalFilter={globalFilter}
                        header={header2}
                    >
                        <Column field="Codigo" header="Codigo" body={codigoBodyTemplate} style={{ minWidth: '4rem' }}></Column>
                        <Column field="Curso.Nombre" header="Curso" body={cursoBodyTemplate} sortable style={{ minWidth: '16rem' }}></Column>
                        <Column header="Nivel" body={nivelBodyTemplate} style={{ minWidth: '4rem' }}></Column>
                        <Column header="Semestre" body={semestreBodyTemplate} style={{ minWidth: '4rem' }}></Column>
                        <Column header="Creditos" body={creditosBodyTemplate} style={{ minWidth: '4rem' }}></Column>
                        <Column body={actionBodyTemplate2} exportable={false} style={{ minWidth: '8rem' }}></Column>
                    </DataTable>
                </div>
            </div>
            <Dialog visible={deleteMatriculaDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirmar" modal footer={deleteMatriculaDialogFooter()} onHide={hideDeleteMatriculaDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {cursosCalificacion && <span>¿Esta seguro de que desea eliminar la Matricula?</span>}
                </div>
            </Dialog>
            <Dialog visible={matriculaDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirmar" modal footer={matriculaDialogFooter()} onHide={hideMatriculaDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-check-circle mr-3" style={{ fontSize: '2rem' }} />
                    {cursosCalificacion && <span>¿Esta seguro de que desea agrregar la Matricula?</span>}
                </div>
            </Dialog>
        </div>
    );
}
