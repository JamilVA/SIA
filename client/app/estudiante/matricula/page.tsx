'use client';
import React, { useState, useEffect, useRef, use } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Perfil from '../../../templates/Perfil';

import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';

export default function Matricula() {
    const { data: session, status } = useSession();

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
        Denominacion: '',
        InicioMatricula: '',
        FinMatricula: ''
    };

    const [matriculaDialog, setMatriculaDialog] = useState(false);
    const [deleteMatriculaDialog, setDeleteMatriculaDialog] = useState(false);
    const [matriculaHabilitada, setMatriculaHabilitada] = useState(false);
    const [periodoActual, setPeriodoActual] = useState(periodoVacio);

    const [cursoCalificacion, setCursoCalificaion] = useState(cursoCVacio);
    const [pagoMatricula, setPagoMatricula] = useState(0);

    const [cursosLlevar, setCursosLlevar] = useState<(typeof cursoCalificacion)[]>([]);
    const [cursosMatriculados, setCursosMatriculados] = useState<(typeof cursoCalificacion)[]>([]);
    const [totalCreditos, setTotalCreditos] = useState(0);
    const [creditosMatriculados, setCreditosMatriculados] = useState(0);

    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]> | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');

    useEffect(() => {
        if (session?.user) {
            cargarPagos();
            cargarPeriodo();
            cargarCursosMatriculados();
        }
    }, [session?.user]);

    useEffect(() => {
        comprobarMatricula();
    }, [periodoActual]);

    useEffect(() => {
        if (matriculaHabilitada) {
            cargarCursosLlevar();
        }
    }, [matriculaHabilitada]);


    const cargarCursosMatriculados = async () => {
        try {
            const { data } = await axios.get('http://localhost:3001/api/matricula/cursosMatriculados', {
                params: {
                    CodigoEstudiante: session?.user.codigoEstudiante
                }
            });
            const { cursosMatriculados, creditosMatriculados } = data;
            setCursosMatriculados(cursosMatriculados);
            setCreditosMatriculados(creditosMatriculados);
            console.log('Cursos Matriculados', data);
        } catch (e) {
            console.error(e);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error en la carga de cursos matriculados',
                life: 3000
            });
        }
    };

    const cargarCursosLlevar = async () => {
        try {
            const { data } = await axios.get('http://localhost:3001/api/matricula/cursosLlevar', {
                params: {
                    CodigoEstudiante: session?.user.codigoEstudiante
                }
            });
            const { cursosLlevar, totalCreditos } = data;
            setCursosLlevar(cursosLlevar);
            setTotalCreditos(totalCreditos);
            console.log('Cursos Llevar', data);
        } catch (e) {
            console.error(e);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error en la carga de cursos a llevar',
                life: 3000
            });
        }
    };

    const cargarPeriodo = async () => {
        try {
            const { data } = await axios.get('http://localhost:3001/api/periodo/vigente', {});
            const { periodo } = data;
            setPeriodoActual(periodo);
            console.log(data);
        } catch (e) {
            console.error(e);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar Periodo Vigente',
                life: 3000
            });
        }
    };

    const cargarPagos = async () => {
        try {
            const result = await axios.get('http://localhost:3001/api/pago/pagosEstudiante', {
                params: {
                    CodigoEstudiante: session?.user.codigoEstudiante
                }
            });
            setPagoMatricula(result?.data?.pagoMatricula?.cantidad);
            console.log('Pagos del Estudiante', result.data);
        } catch (e) {
            console.error(e);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error en la carga de pagos',
                life: 3000
            });
        }
    };

    const comprobarMatricula = () => {
        const inicioMatricula = new Date(periodoActual?.InicioMatricula);
        const finMatricula = new Date(periodoActual?.FinMatricula);
        inicioMatricula.setDate(inicioMatricula.getDate() + 1);
        finMatricula.setDate(finMatricula.getDate() + 1);
        const currentDate = new Date();

        console.log('Matricula Habilitada', currentDate >= inicioMatricula, currentDate <= finMatricula, pagoMatricula);

        setMatriculaHabilitada(currentDate >= inicioMatricula && currentDate <= finMatricula && pagoMatricula > 0);
    };

    const crearMatricula = async (rowData: any) => {
        try {
            if (creditosMatriculados + rowData.Curso.Creditos <= totalCreditos) {
                console.log('Curso Recibido para la matricula:', rowData);
                // axios
                //     .post('http://localhost:3001/api/matricula', {
                //         codigoCursoCalificacion: rowData.Codigo,
                //         codigoEstudiante: session?.user.codigoEstudiante,
                //         fechaMatricula: new Date()
                //     })
                //     .then((response) => {
                //         console.log(response.data);
                //         toast.current!.show({ severity: 'success', summary: 'Successful', detail: ' Matriculado con éxito', life: 3000 });
                //         setCursosLlevar((cursosLlevar) => cursosLlevar.filter((curso) => curso.Codigo !== rowData.Codigo));
                //         setCursosMatriculados((cursosMatriculados) => [...cursosMatriculados, rowData]);
                //         setCreditosMatriculados(creditosMatriculados + rowData?.Curso?.Creditos)
                //     });
                toast.current!.show({ severity: 'success', summary: 'Successful', detail: ' Curso agregado con éxito', life: 3000 });

                setCursosLlevar((cursosLlevar) => cursosLlevar.filter((curso) => curso.Codigo !== rowData.Codigo));
                setCursosMatriculados((cursosMatriculados) => [...cursosMatriculados, rowData]);
                setCreditosMatriculados(creditosMatriculados + rowData?.Curso?.Creditos);

                setMatriculaDialog(false);
                setCursoCalificaion(cursoCVacio);
            } else {
                toast.current!.show({ severity: 'warn', summary: 'Advertencia', detail: 'No puedes superar el total de creditos por ciclo', life: 5000 });
                setMatriculaDialog(false);
                setCursoCalificaion(cursoCVacio);
            }
        } catch (error) {
            console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al registrar matricula',
                life: 3000
            });
        }
    };

    const eliminarMatricula = async (curso: any) => {
        try {
            console.log('Curso Recibido para la eliminacion:', curso);
            // axios
            //     .post('http://localhost:3001/api/matricula/eliminar', {
            //         codigoEstudiante: session?.user.codigoEstudiante,
            //         codigoCursoCalificacion: curso.Codigo
            //     })
            //     .then((response) => {
            //         console.log(response.data);
            //         toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Curso eliminado con éxito', life: 3000 });
            //         setCursosMatriculados((cursosMatriculados) => cursosMatriculados.filter((c) => c.Codigo !== curso.Codigo));
            //         setCursosLlevar((cursosLlevar) => [...cursosLlevar, curso]);
            //         setCreditosMatriculados(creditosMatriculados - curso?.Curso?.Creditos);
            //     });
            toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Curso eliminado con éxito', life: 3000 });
            setCursosMatriculados((cursosMatriculados) => cursosMatriculados.filter((c) => c.Codigo !== curso.Codigo));
            setCursosLlevar((cursosLlevar) => [...cursosLlevar, curso]);
            setCreditosMatriculados(creditosMatriculados - curso?.Curso?.Creditos);
            setDeleteMatriculaDialog(false);
            setCursoCalificaion(cursoCVacio);
        } catch (error) {
            console.error(error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al eliminar matricula',
                life: 3000
            });
        }
    };

    const finalizarMatricula = async () => {
        try {
            axios
                .post('http://localhost:3001/api/matricula/guardarMatriculas', {
                    CodigoEstudiante: session?.user.codigoEstudiante,
                    cursosMatriculados: cursosMatriculados
                })
                .then((response) => {
                    console.log(response.data);
                    // setMatriculaHabilitada(false);
                    // toast.current?.show({
                    //     severity: 'success',
                    //     summary: 'Successful',
                    //     detail: 'Matrícula finalizada con éxito',
                    //     life: 3000
                    // });
                });
        } catch (e) {
            console.error(e);
            // toast.current?.show({
            //     severity: 'error',
            //     summary: 'Error',
            //     detail: 'Error al finalizar la matrícula',
            //     life: 3000
            // });
        }
    };

    const generarConstancia = async () => {
        try {
        } catch (error) {
            console.error(error);
        }
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

    const confirmDeleteMatricula = (curso: any) => {
        setCursoCalificaion(curso);
        setDeleteMatriculaDialog(true);
    };

    const codigoBodyTemplate = (rowData: any) => {
        return rowData.Codigo.slice(0, 6);
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
                <Button label="Agregar" icon="pi pi-plus" className="p-button-success p-button-sm" style={{ padding: '0.75em', fontSize: '0.75em' }} onClick={() => newMatricula(rowData)} disabled={!totalCreditos > !creditosMatriculados} />
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
                <p>
                    Créditos disponibles: <span className="text-primary">{totalCreditos}</span>
                </p>
            </div>
        </div>
    );

    const header2 = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Cursos Matriculados</h4>
            <div className="flex flex-wrap gap-2">
                <p>
                    Créditos matriculados: <span className="text-primary">{creditosMatriculados}</span>
                </p>
            </div>
        </div>
    );

    const header3 = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Matrícula en el periodo {periodoActual?.Denominacion}</h4>
            <div className="flex flex-wrap gap-2">
                <Link href={`http://localhost:3001/api/matricula/obtenerConstancia?c=${session?.user.codigoEstudiante}`}>
                    <Button
                        label="Constancia de Matrícula"
                        icon="pi pi-file-pdf"
                        className="p-button-warning"
                        onClick={() => {
                            generarConstancia();
                        }}
                    />
                </Link>
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

    if (status === 'loading') {
        return (
            <>
                <div className="flex items-center justify-center align-content-center" style={{ marginTop: '20%' }}>
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                </div>
            </>
        );
    }

    return (
        <div className="grid">
            <div className="col-12">
                <h5 className="m-3 mt-4">MATRÍCULA ESTUDIANTE</h5>
            </div>
            <div className="col-12 md:col-3">
                <Perfil></Perfil>
                <Button
                    label="Confirmar matrícula"
                    icon="pi pi-check"
                    severity="success"
                    onClick={async () => {
                        try {
                            await finalizarMatricula();
                            setMatriculaHabilitada(false);
                            toast.current?.show({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Matrícula finalizada con éxito',
                                life: 3000
                            });
                        } catch (error) {
                            console.error(error);
                            toast.current?.show({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Error al finalizar la matrícula',
                                life: 3000
                            });
                        }
                    }}
                    visible={cursosMatriculados?.length > 0 && matriculaHabilitada}
                    disabled={creditosMatriculados < 12}
                />
            </div>
            <div className="col-12 md:col-9">
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
                    {<span>¿Esta seguro de que desea eliminar la Matricula?</span>}
                </div>
            </Dialog>
            <Dialog visible={matriculaDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirmar" modal footer={matriculaDialogFooter} onHide={hideMatriculaDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-check-circle mr-3" style={{ fontSize: '2rem' }} />
                    {<span>¿Esta seguro de que desea agrregar la Matricula?</span>}
                </div>
            </Dialog>
        </div>
    );
}
