'use client';
import React, { useState, useEffect, useRef, use } from 'react';
import axios from 'axios';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';

import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import Link from 'next/link';

import { Message } from 'primereact/message';

export default function Matricula() {
    const usuario = {
        Email: 'darlyn@email.com',
        CodigoSunedu: 'MU75500598'
    };

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
        Estado: false,
        Denominacion: '',
        InicioMatricula: '',
        FinMatricula: ''
    };

    const pagoVacio = {
        Codigo: '',
        EstadoPago: '',
        CodigoEstudiante:'',
        Estudiante: {
            Codigo:'',
            Email:''
        },
    };

    const [matriculaDialog, setMatriculaDialog] = useState(false);
    const [pagosDialog, setPagosDialog] = useState(false);
    const [deleteMatriculaDialog, setDeleteMatriculaDialog] = useState(false);
    const [matriculaHabilitada, setMatriculaHabilitada] = useState(false);

    const [matricula, setMatricula] = useState(matriculaVacia);
    const [cursoCalificacion, setCursoCalificaion] = useState(cursoCVacio);
    const [estudiante, setEstudiante] = useState(estudianteVacio);
    const [periodoActual, setPeriodoActual] = useState(periodoVacio);

    const [matriculas, setMatriculas] = useState<(typeof matricula)[]>([]);
    const [pagos, setPagos] = useState<(typeof pagoVacio)[]>([]);
    const [cursosCalificacion, setCursosCalificacion] = useState<(typeof cursoCalificacion)[]>([]);

    const [cursosLlevar, setCursosLlevar] = useState<(typeof cursoCalificacion)[]>([]);
    const [cursosMatriculados, setCursosMatriculados] = useState<(typeof cursoCalificacion)[]>([]);

    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]> | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');

    useEffect(() => {
        const cargarDatos = async (usuario: any) => {
            try {
                const { data } = await axios.get('http://localhost:3001/api/matricula', {
                    params: {
                        Email: usuario.Email
                    }
                });
                const { estudiante, matriculas, periodo, cursosCalificacion } = data;
                setEstudiante(estudiante);
                setMatriculas(matriculas);
                setPeriodoActual(periodo);
                setCursosCalificacion(cursosCalificacion);
                console.log(data);
            } catch (e) {
                console.error(e);
            }
        };
        const cargarPagos = async (usuario: any) => {
            try {
                const result = await axios.get('http://localhost:3001/api/pago/pagosEstudiante', {
                    params: {
                        Email: usuario.Email
                    }
                });

                setPagos(result.data.pagos);
                console.log('Pagos del Estudiante', result.data.pagos);
            } catch (e) {
                console.error(e);
            }
        };
        cargarPagos(usuario);
        cargarDatos(usuario);
    }, []);

    useEffect(() => {
        comprobarMatricula();
    }, [periodoActual]);

    useEffect(() => {
        if (cursosCalificacion.length > 0) {
            const cursosMatriculados = buscarCursosMatriculados();
            setCursosMatriculados(cursosMatriculados);

            const cursosLlevar = buscarCursosLlevar(cursosMatriculados);
            setCursosLlevar(cursosLlevar);
        }
    }, [cursosCalificacion, matriculas, estudiante]);

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

            console.log(cursosMatriculados);
            const cursosDisponibles = cursosAbiertos.filter((curso) => {
                return !cursosMatriculados.some((c) => c.Codigo === curso.Codigo);
            });
            return cursosDisponibles;
        } else {
            console.log('Hola, alumno nuevo');
            const cursosAbiertos: (typeof cursoCalificacion)[] = cursosCalificacion.filter((c) => c.Curso.Nivel == 1 && c.Curso.Semestre == 1);

            console.log(cursosMatriculados);
            const cursosDisponibles = cursosAbiertos.filter((curso) => {
                return !cursosMatriculados.some((c) => c.Codigo === curso.Codigo);
            });

            return cursosDisponibles;
        }
    };

    const buscarCursosMatriculados = () => {
        const mA = matriculas.filter((m: any) => m.CodigoCursoCalificacion.slice(-3) === periodoActual.Codigo).map((m: any) => m.CodigoCursoCalificacion);
        const cursosMatriculados = cursosCalificacion.filter((c: any) => mA.includes(c.Codigo));
        return cursosMatriculados;
    };

    const comprobarMatricula = () => {
        const inicioMatricula = new Date(periodoActual.InicioMatricula);
        const finMatricula = new Date(periodoActual.FinMatricula);
        const currentDate = new Date();

        console.log('Inicio de Matricula', inicioMatricula), console.log('Fin de Matricula', finMatricula), console.log('Fecha Actual', currentDate);
        setMatriculaHabilitada((currentDate >= inicioMatricula && currentDate <= finMatricula) && pagos.some(p => p.Estudiante !=null));
        
    };

    const crearMatricula = async (rowData: any) => {
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

    const hidePagosDialog = () => {
        setPagosDialog(false);
    };

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

    const openDialogPagos = () => {
        setPagosDialog(true);
    };

    const confirmDeleteMatricula = (curso: any) => {
        setCursoCalificaion(curso);
        setDeleteMatriculaDialog(true);
    };

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

    const codigoPagoBodyTemplate = (rowData: any) => {
        return rowData.Codigo;
    };

    const conceptoPagoBodyTemplate = (rowData: any) => {
        return rowData.ConceptoPago.Denominacion;
    };

    const montoPagoBodyTemplate = (rowData: any) => {
        return rowData.ConceptoPago.Monto;
    };

    const estadoPagoBodyTemplate = (rowData: any) => {
        return rowData.Curso.EstadoPago;
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
                <Button
                    label="Actualizar"
                    icon="pi pi-refresh"
                    className="p-button-warning"
                    onClick={() => {
                        setCursosMatriculados(buscarCursosMatriculados);
                    }}
                />
            </div>
        </div>
    );

    const header3 = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Matrícula en el periodo {periodoActual.Denominacion}</h4>
            <div className="flex flex-wrap gap-2">
                <Button label="Constancia de Matrícula" icon="pi pi-file-pdf" className="p-button-warning" onClick={buscarCursosMatriculados} />
            </div>
        </div>
    );

    const header4 = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Pagos del Estudiante {periodoActual.Denominacion}</h4>
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

    const pagosDialogFooter = () => {
        return (
            <React.Fragment>
                <Button label="Cerrar" icon="pi pi-check" severity="danger" onClick={() => hidePagosDialog()} />
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

    const headerCard = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-center">
            <div className="flex flex-wrap gap-2 mt-4">
                <Link href="/estudiante/estudiante-pagos">
                    <Button label="Pagos" icon="pi pi-money-bill" className="p-button-info p-button-sm" />{' '}
                </Link>
            </div>
        </div>
    );

    const footer = (
        <span>
            <small>Email: {estudiante.Persona.Email}</small>
        </span>
    );

    return (
        <div className="grid">
            <div className="col-3">
                <Card title={estudiante.Persona.Nombres} subTitle={estudiante.Persona.Paterno + ' ' + estudiante.Persona.Materno} style={{ width: '100%' }} footer={footer} header={headerCard}></Card>
            </div>
            <div className="col-9">
                <Toast ref={toast} />
                {matriculaHabilitada && (
                    <>
                        <div className="card">
                            <DataTable
                                ref={dt}
                                value={cursosLlevar}
                                dataKey="Codigo"
                                emptyMessage="No se han encontrado cursos a matricular"
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
                                emptyMessage="No se han encontrado cursos matriculados"
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
                    </>
                )}
                {!matriculaHabilitada && (
                    <>
                        <Message
                            style={{
                                border: 'solid',
                                borderWidth: '0 0 0 6px'
                            }}
                            className="w-full justify-content-start"
                            severity="error"
                            content={'Su matrícula no esta habilitada, revisar fechas de matricula y pagos correspondientes'}
                        />

                        <br />
                        <br />

                        <div className="card">
                            <DataTable
                                ref={dt}
                                value={cursosMatriculados}
                                dataKey="Codigo"
                                emptyMessage="No se han encontrado cursos matriculados"
                                paginator
                                rows={5}
                                rowsPerPageOptions={[5, 10, 25]}
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} cursos matriculados"
                                globalFilter={globalFilter}
                                header={header3}
                            >
                                <Column field="Codigo" header="Codigo" body={codigoBodyTemplate} style={{ minWidth: '6rem' }}></Column>
                                <Column field="Curso.Nombre" header="Curso" body={cursoBodyTemplate} sortable style={{ minWidth: '16rem' }}></Column>
                                <Column header="Nivel" body={nivelBodyTemplate} style={{ minWidth: '4rem' }}></Column>
                                <Column header="Semestre" body={semestreBodyTemplate} style={{ minWidth: '4rem' }}></Column>
                                <Column header="Creditos" body={creditosBodyTemplate} style={{ minWidth: '4rem' }}></Column>
                            </DataTable>
                        </div>
                    </>
                )}
            </div>
            <Dialog visible={deleteMatriculaDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirmar" modal footer={deleteMatriculaDialogFooter()} onHide={hideDeleteMatriculaDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {cursosCalificacion && <span>¿Esta seguro de que desea eliminar la Matricula?</span>}
                </div>
            </Dialog>
            <Dialog visible={matriculaDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirmar" modal footer={matriculaDialogFooter} onHide={hideMatriculaDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-check-circle mr-3" style={{ fontSize: '2rem' }} />
                    {cursosCalificacion && <span>¿Esta seguro de que desea agrregar la Matricula?</span>}
                </div>
            </Dialog>
            {/* <Dialog visible={pagosDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirmar" modal footer={pagosDialogFooter} onHide={hidePagosDialog}>
                <div className="card">
                    <div className="card">
                        <DataTable
                            ref={dt}
                            value={pagos}
                            dataKey="Codigo"
                            paginator
                            rows={5}
                            rowsPerPageOptions={[5, 10, 25]}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando del {first} al {last} de {totalRecords} pagos"
                            globalFilter={globalFilter}
                            header={header4}
                        >
                            <Column field="Codigo" header="Codigo" body={codigoPagoBodyTemplate} style={{ minWidth: '4rem' }}></Column>
                            <Column field="ConceptoPago.Denominacion" header="Conceto de Pago" body={conceptoPagoBodyTemplate} sortable style={{ minWidth: '16rem' }}></Column>
                            <Column header="Monto" body={montoPagoBodyTemplate} style={{ minWidth: '4rem' }}></Column>
                            <Column header="Estado" body={estadoPagoBodyTemplate} style={{ minWidth: '4rem' }}></Column>
                        </DataTable>
                    </div>
                </div>
            </Dialog> */}
        </div>
    );
}
