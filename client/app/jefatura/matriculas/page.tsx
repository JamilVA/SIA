'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
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

    const [cursoCalificacion, setCursoCalificaion] = useState(cursoCVacio);
    const [estudiante, setEstudiante] = useState(estudianteVacio);
    const [inputValue, setInputValue] = useState('');
    const [periodoActual, setPeriodoActual] = useState(periodoVacio);

    const [cursosLlevar, setCursosLlevar] = useState<(typeof cursoCalificacion)[]>([]);
    const [cursosMatriculados, setCursosMatriculados] = useState<(typeof cursoCalificacion)[]>([]);
    const [totalCreditos, setTotalCreditos] = useState(0);
    const [creditosMatriculados, setCreditosMatriculados] = useState(0);

    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]> | null>(null);

    useEffect(() => {
        cargarPeriodo();
    }, []);

    useEffect(() => {
        if (estudiante.Codigo != 0) {
            cargarCursosMatriculados();
            cargarCursosLlevar();
        }
    }, [estudiante]);

    const buscarEstudiante = async (CodigoSunedu: string) => {
        await axios
            .get('http://localhost:3001/api/matricula/buscarEstudiante', {
                params: {
                    CodigoSunedu: CodigoSunedu
                }
            })
            .then(async (response) => {
                if (response.data.estudiante !== null) {
                    setEstudiante(response.data.estudiante);
                } else {
                    toast.current?.show({
                        severity: 'info',
                        summary: 'No encontrado',
                        detail: 'No se ha encontrado ningún estudiante con Codigo: ' + inputValue,
                        life: 3000
                    });
                }
            })
            .catch((error) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operación fallida',
                    detail: 'Ha ocurrido un error al buscar el estudiante',
                    life: 3000
                });
            });
    };

    const cargarCursosMatriculados = async () => {
        try {
            const { data } = await axios.get('http://localhost:3001/api/matricula/cursosMatriculados', {
                params: {
                    CodigoEstudiante: estudiante?.Codigo
                }
            });
            const { cursosMatriculados, creditosMatriculados } = data;
            setCursosMatriculados(cursosMatriculados);
            setCreditosMatriculados(creditosMatriculados);
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
                    CodigoEstudiante: estudiante.Codigo
                }
            });
            const { cursosLlevar, totalCreditos } = data;
            setCursosLlevar(cursosLlevar);
            setTotalCreditos(totalCreditos);
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

    const crearMatricula = async (rowData: any) => {
        try {
            if(creditosMatriculados + rowData.Curso.Creditos <= totalCreditos){
                axios
                    .post('http://localhost:3001/api/matricula', {
                        codigoCursoCalificacion: rowData.Codigo,
                        codigoEstudiante: estudiante.Codigo,
                        fechaMatricula: new Date()
                    })
                    .then((response) => {
                        toast.current!.show({ severity: 'success', summary: 'Successful', detail: ' Matriculado con éxito', life: 3000 });
                        setCursosLlevar((cursosLlevar) => cursosLlevar.filter((curso) => curso.Codigo !== rowData.Codigo));
                        setCursosMatriculados((cursosMatriculados) => [...cursosMatriculados, rowData]);
                        setCreditosMatriculados(creditosMatriculados + rowData?.Curso?.Creditos)
                    });
    
                setMatriculaDialog(false);
                setCursoCalificaion(cursoCVacio);
            }else{
                toast.current!.show({ severity: 'warn', summary: 'Advertencia', detail: 'No puedes superar el total de creditos por ciclo', life: 5000 });
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
            axios
                .post('http://localhost:3001/api/matricula/eliminar', {
                    codigoEstudiante: estudiante.Codigo,
                    codigoCursoCalificacion: curso.Codigo
                })
                .then((response) => {
                    toast.current!.show({ severity: 'success', summary: 'Successful', detail: ' Eliminado con éxito', life: 3000 });
                    setCursosMatriculados((cursosMatriculados) => cursosMatriculados.filter((c) => c.Codigo !== curso.Codigo));
                    setCursosLlevar((cursosLlevar) => [...cursosLlevar, curso]);
                    setCreditosMatriculados(creditosMatriculados - curso?.Curso?.Creditos)
                });
                setDeleteMatriculaDialog(false);
                setCursoCalificaion(cursoCVacio)
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


    return (
        <div className="grid">
            <div className="col-12 md:col-3">
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
                                maxLength={10}
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
                        {estudiante?.Persona?.Paterno} {estudiante?.Persona?.Materno}
                    </label>
                </div>
                <div className="col">
                    <label htmlFor="">Nombres: </label>
                    <label>{estudiante?.Persona?.Nombres}</label>
                </div>
            </div>
            <div className="col-12 md:col-9">
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
                    {<span>¿Esta seguro de que desea eliminar la Matricula?</span>}
                </div>
            </Dialog>
            <Dialog visible={matriculaDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirmar" modal footer={matriculaDialogFooter()} onHide={hideMatriculaDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-check-circle mr-3" style={{ fontSize: '2rem' }} />
                    {<span>¿Esta seguro de que desea agrregar la Matricula?</span>}
                </div>
            </Dialog>
        </div>
    );
}
