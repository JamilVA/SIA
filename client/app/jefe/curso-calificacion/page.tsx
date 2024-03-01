/* eslint-disable @next/next/no-img-element */
'use client';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { Sia } from '../../../types/sia';
import Link from 'next/link';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputSwitch } from 'primereact/inputswitch';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useSession } from 'next-auth/react';

/* @todo Used 'as any' for types here. Will fix in next version due to onSelectionChange event type issue. */
export default function CursoCalificacionPage() {

    const { data: session, status } = useSession()

    let emptyCursoCalificacion: Sia.CursoCalificacion = {
        Codigo: '',
        EstadoAplazado: false,
        EstadoRecuperacion: false,
        EstadoNotas: false,
        RutaSyllabus: '',
        RutaNormas: '',
        RutaPresentacionCurso: '',
        RutaPresentacionDocente: '',
        Competencia: '',
        Capacidad: '',
        CodigoDocente: null,
        CodigoCurso: null,
        CodigoPeriodo: '',
        Docente: null,
        Curso: null
    }

    let emptyCurso: Sia.Curso = {
        Codigo: '',
        Nombre: '',
        HorasTeoria: 0,
        HorasPractica: 0,
        Creditos: 0,
        Nivel: 0,
        Semestre: 0,
        Tipo: '',
        Estado: null,
        ConPrerequisito: null,
        CodigoCurso: '',
        CodigoCarreraProfesional: 0
    }

    let emptyPeriodo: Sia.Periodo = {
        Codigo: '',
        Denominacion: '',
        Estado: null
    }

    const [cursoCalificacionDialog, setCursoCalificacionDialog] = useState(false);
    const [deleteCursoCalificacionDialog, setDeleteCursoCalificacionDialog] = useState(false);
    const [asignarDocenteDialog, setAsignarDocenteDialog] = useState(false)

    const [loading, setLoading] = useState(true)
    const [loadingNotas, setLoadingNotas] = useState(false)
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const op = useRef<OverlayPanel>(null)

    const [cursoCalificacion, setCursoCalificacion] = useState<Sia.CursoCalificacion>(emptyCursoCalificacion)
    const [periodoVigente, setPeriodoVigente] = useState<Sia.Periodo>(emptyPeriodo)
    const [curso, setCurso] = useState<Sia.Curso>()

    const [selectedCarrera, setSelectedCarrera] = useState(null)

    const [cursosCalificacion, setCursosCalificacion] = useState<Sia.CursoCalificacion[]>([])
    const [cursos, setCursos] = useState([emptyCurso])
    const [docentes, setDocentes] = useState<Array<Sia.Docente>>([])
    const [tempCursos, setTempCursos] = useState([emptyCurso])

    const [carreras, setCarreras] = useState<Array<any>>([])

    const fetchCursos = async () => {
        await axios.get('http://localhost:3001/api/curso')
            .then(response => {
                setCursos(response.data.cursos)
                setTempCursos(response.data.cursos)
            })
            .catch(error => {
                setTempCursos([])
                setCursos([])
                console.log("Error de carga: ", error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error en la carga de cursos',
                    life: 3000
                });
            })
    }

    const fetchPeriodoVigente = async () => {
        await axios.get('http://localhost:3001/api/periodo')
            .then(response => {
                const periodos: Array<Sia.Periodo> = response.data.periodos
                let _periodoVigente = periodos.find(periodo => periodo.Estado === true) as Sia.Periodo
                setPeriodoVigente(_periodoVigente)
            })
            .catch(error => {
                console.log("Error de carga: ", error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error en la carga de periodos académicos',
                    life: 3000
                });
            })
    }

    const fetchCursosCalificacion = async () => {
        await axios.get('http://localhost:3001/api/curso-calificacion')
            .then(response => {
                setLoading(false)
                const _cursosPeriodoVigente = response.data.cursosCalificacion
                setCursosCalificacion(_cursosPeriodoVigente)
            })
            .catch(error => {
                setCursosCalificacion([])
                setLoading(false)
                console.log("Error de carga: ", error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error en la carga de datos',
                    life: 3000
                });
            })
    }

    const fetchDocentes = async () => {
        await axios.get('http://localhost:3001/api/docente')
            .then(response => {
                const _docentes = response.data.docentes
                setDocentes(_docentes)
            })
            .catch(error => {
                setDocentes([])
                console.log("Error de carga: ", error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error en la carga de datos',
                    life: 3000
                });
            })
    }

    const fetchCarreras = async () => {
        await axios.get('http://localhost:3001/api/curso-calificacion/carreras', {
            params: { codigoJefe: session?.user.codigoPersona }
        })
            .then(response => {
                const _carreras = response.data.carreras
                setCarreras(_carreras)
            })
            .catch(error => {
                setCarreras([])
                console.log("Error de carga: ", error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error en la carga de carreras',
                    life: 3000
                });
            })
    }

    useEffect(() => {      
        fetchPeriodoVigente()
        fetchCursos()
        fetchCursosCalificacion()
        fetchDocentes()

    }, []);

    useEffect(() => {
        if(status === 'authenticated')
            fetchCarreras()       
    }, [status]);

    const openNew = () => {
        if (!periodoVigente) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Operacion no disponible',
                detail: 'Periodo vigente no disponible para habilitación de cursos.',
                life: 3000
            });
            return
        }
        setSelectedCarrera(null)
        setCursoCalificacion(emptyCursoCalificacion)
        setSubmitted(false);
        setCursoCalificacionDialog(true);
    };

    const openAsignarDocente = (cursoCalificacion: Sia.CursoCalificacion) => {
        setSubmitted(false);
        setAsignarDocenteDialog(true);
        setCursoCalificacion(cursoCalificacion)
    };

    const openDetallesCurso = (cursoCalificacion: Sia.CursoCalificacion, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        let curso = cursos.find(curso => curso.Codigo === cursoCalificacion.CodigoCurso)
        setCurso(curso)
        op.current?.toggle(e)
    }

    const hideDialog = () => {
        setSubmitted(false);
        setCursoCalificacionDialog(false);
    };

    const hideDeleteCursoCalificacion = () => {
        setDeleteCursoCalificacionDialog(false);
    };

    const hideAsignarDocenteDialog = () => {
        setSubmitted(false);
        setAsignarDocenteDialog(false);
    };

    const saveCursoCalificacion = async () => {
        setSubmitted(true);
        if (!cursoCalificacion.CodigoCurso) {
            return
        }
        setCursoCalificacionDialog(false);
        await axios.post('http://localhost:3001/api/curso-calificacion', {
            ...cursoCalificacion,
            CodigoDocente: null,
            CodigoPeriodo: periodoVigente?.Codigo
        })
            .then(response => {
                fetchCursosCalificacion()
                toast.current?.show({
                    severity: 'success',
                    summary: 'Operacion exitosa',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch(error => {
                console.log(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operacion fallida',
                    detail: 'El curso no se ha habilitado',
                    life: 3000
                });
            })
    };

    const confirmDeleteCursoCalificacion = (cursoCalificacion: Sia.CursoCalificacion) => {
        setCursoCalificacion(cursoCalificacion);
        setDeleteCursoCalificacionDialog(true);
    };

    const deleteCursoCalificacion = async () => {
        hideDeleteCursoCalificacion()
        await axios.delete('http://localhost:3001/api/curso-calificacion/eliminar', {
            params: { codigo: cursoCalificacion.Codigo }
        })
            .then(response => {
                let _cursosCalificacion = cursosCalificacion.filter(curso => curso.Codigo !== cursoCalificacion.Codigo)
                setCursosCalificacion(_cursosCalificacion)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Operación exitosa',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch(error => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operación fallida',
                    detail: error.message,
                    life: 3000
                });
            })
    };

    const onDropDownChange = (value: any, name: string) => {
        switch (name) {
            case 'carrera':
                let _cursos = tempCursos.filter(curso => curso.CodigoCarreraProfesional === value)
                setCursos(_cursos)
                setSelectedCarrera(value)
                break;
            case 'curso':
                setCursoCalificacion({
                    ...cursoCalificacion,
                    Codigo: value + periodoVigente.Codigo,
                    CodigoCurso: value
                })
                break;
            case 'docente':
                setCursoCalificacion({
                    ...cursoCalificacion,
                    CodigoDocente: value
                })
                break;
        }
    }

    const handleClick = async (name: string, rowData: Sia.CursoCalificacion) => {
        setCursoCalificacion(rowData)
        switch (name) {
            case 'notas':
                setLoadingNotas(true)
                if (rowData.EstadoNotas === true) {
                    await deshabilitarIngreso('notas', rowData.Codigo)
                } else {
                    await habilitarIngreso('notas', rowData.Codigo)
                }
                setLoadingNotas(false)
                break;
            case 'recuperacion':
                setLoadingNotas(true)
                if (rowData.EstadoRecuperacion) {
                    await deshabilitarIngreso('recuperacion', rowData.Codigo)
                } else {
                    await habilitarIngreso('recuperacion', rowData.Codigo)
                }
                setLoadingNotas(false)
                break;
            case 'aplazado':
                setLoadingNotas(true)
                if (rowData.EstadoAplazado) {
                    await deshabilitarIngreso('aplazado', rowData.Codigo)
                } else {
                    await habilitarIngreso('aplazado', rowData.Codigo)
                }
                setLoadingNotas(false)
                break;
        }
    }

    const habilitarIngreso = async (campo: string, codigo: string) => {
        await axios.put('http://localhost:3001/api/curso-calificacion/habilitar-ingreso', {}, {
            params: {
                campo: campo,
                codigo: codigo
            }
        })
            .then(response => {
                actualizarVistaIngreso(campo, true, codigo) //Actualiza la vista
                toast.current?.show({
                    severity: 'success',
                    summary: 'Notas habilitadas',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch(error => {
                console.error(error.data)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operacion fallida',
                    detail: error.message,
                    life: 3000
                });
            })
        setCursoCalificacion(emptyCursoCalificacion)
    }

    const deshabilitarIngreso = async (campo: string, codigo: string) => {
        await axios.put('http://localhost:3001/api/curso-calificacion/deshabilitar-ingreso', {}, {
            params: {
                campo: campo,
                codigo: codigo
            }
        })
            .then(response => {
                actualizarVistaIngreso(campo, false, codigo) //Actualiza la vista
                toast.current?.show({
                    severity: 'success',
                    summary: 'Notas habilitadas',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch(error => {
                console.error(error.data)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operacion fallida',
                    detail: error.message,
                    life: 3000
                });
            })
        setCursoCalificacion(emptyCursoCalificacion)
    }

    const actualizarVistaIngreso = (campo: string, estado: boolean, codigo: string) => {
        let _cursosCalificacion: any
        switch (campo) {
            case 'notas':
                _cursosCalificacion = cursosCalificacion.map(curso => {
                    if (curso.Codigo === codigo) {
                        return { ...curso, EstadoNotas: estado }
                    }
                    return curso
                })
                break;
            case 'recuperacion':
                _cursosCalificacion = cursosCalificacion.map(curso => {
                    if (curso.Codigo === codigo) {
                        return { ...curso, EstadoRecuperacion: estado }
                    }
                    return curso
                })
                break;
            case 'aplazado':
                _cursosCalificacion = cursosCalificacion.map(curso => {
                    if (curso.Codigo === codigo) {
                        return { ...curso, EstadoAplazado: estado }
                    }
                    return curso
                })
                break;
        }
        setCursosCalificacion(_cursosCalificacion)
    }

    const actualizarVistaIngresos = (campo: string, estado: boolean) => {
        let _cursosCalificacion = [...cursosCalificacion]
        switch (campo) {
            case 'notas':
                _cursosCalificacion.forEach(curso => curso.EstadoNotas = estado)
                break;
            case 'recuperacion':
                _cursosCalificacion.forEach(curso => curso.EstadoRecuperacion = estado)
                break;
            case 'aplazado':
                _cursosCalificacion.forEach(curso => curso.EstadoAplazado = estado)
                break;
        }
        setCursosCalificacion(_cursosCalificacion)
    }

    const habilitarIngresos = async (campo: string) => {
        await axios.put('http://localhost:3001/api/curso-calificacion/habilitar-ingresos', {}, {
            params: {
                periodo: periodoVigente.Codigo,
                campo: campo
            }
        })
            .then(response => {
                actualizarVistaIngresos(campo, true) //Actualiza la vista
                toast.current?.show({
                    severity: 'success',
                    summary: 'Notas habilitadas',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch(error => {
                console.error(error.data)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operacion fallida',
                    detail: 'Ha ocurrido un error al procesar la solicitud',
                    life: 3000
                });
            })
    }

    const deshabilitarIngresos = async (campo: string) => {
        await axios.put('http://localhost:3001/api/curso-calificacion/deshabilitar-ingresos', {}, {
            params: {
                periodo: periodoVigente.Codigo,
                campo: campo
            }
        })
            .then(response => {
                actualizarVistaIngresos(campo, false)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Notas deshabilitadas',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch(error => {
                console.error(error.data)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operacion fallida',
                    detail: 'Ha ocurrido un error al procesar la solicitud',
                    life: 3000
                });
            })
    }

    const asignarDocente = async () => {
        setSubmitted(true)
        if (cursoCalificacion.CodigoDocente === null) {
            return
        }
        hideAsignarDocenteDialog()
        await axios.put('http://localhost:3001/api/curso-calificacion/asignar-docente', {}, {
            params: {
                codigo: cursoCalificacion.Codigo,
                codigoDocente: cursoCalificacion.CodigoDocente
            }
        })
            .then(response => {
                fetchCursosCalificacion()
                toast.current?.show({
                    severity: 'success',
                    summary: 'Operacion exitosa',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch(error => {
                console.error(error.response)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operacion fallida',
                    detail: 'Ha ocurrido un error al procesar la solicitud',
                    life: 3000
                });
            })
    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Habilitar curso" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                    {/* <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedProducts || !(selectedProducts as any).length} /> */}
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <div>

            </div>
        );
    };

    const statusRecuperacionTemplate = (rowData: Sia.CursoCalificacion) => {
        return (
            <>
                <InputSwitch checked={rowData.EstadoRecuperacion} onChange={() => handleClick('recuperacion', rowData)} />
                {loadingNotas && cursoCalificacion.Codigo === rowData.Codigo && <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth='6' />}
            </>
        )
    };

    const statusAplazadosTemplate = (rowData: Sia.CursoCalificacion) => {
        return (
            <>
                <InputSwitch checked={rowData.EstadoAplazado} onChange={() => handleClick('aplazado', rowData)} />
                {loadingNotas && cursoCalificacion.Codigo === rowData.Codigo && <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth='6' />}
            </>
        )
    };

    const statusNotasTemplate = (rowData: Sia.CursoCalificacion) => {
        return (
            <>
                <InputSwitch checked={rowData.EstadoNotas} onChange={() => handleClick('notas', rowData)} />
                {loadingNotas && cursoCalificacion.Codigo === rowData.Codigo && <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth='6' />}
            </>
        )
    };

    const cursoBodyTemplate = (rowData: Sia.CursoCalificacion) => {
        return (
            <div className="flex align-content-center">
                <div className='flex align-items-center justify-content-center'>
                    <p>{rowData.Curso?.Nombre}</p>
                </div>
                <div className='flex align-items-center justify-content-center'>
                    <Button icon="pi pi-book" rounded text severity="secondary" onClick={(e) => openDetallesCurso(rowData, e)} tooltip='Ver curso' />
                </div>
            </div>
        )
    };

    const docenteTemplate = (rowData: Sia.CursoCalificacion) => {
        let docente = rowData.Docente?.Persona?.Nombres + ' ' + rowData.Docente?.Persona?.Paterno + ' ' + rowData.Docente?.Persona?.Materno
        return (
            <div className="flex align-content-center">
                <div className='flex align-items-center justify-content-center'>
                    <p>{!rowData.Docente ? '' : docente}</p>
                </div>
                <div className='flex align-items-center justify-content-center'>
                    <Button icon="pi pi-user" rounded text severity="secondary" onClick={() => openAsignarDocente(rowData)} tooltip='Asignar o reasignar docente' />
                </div>
            </div>
        )
    };

    const actionBodyTemplate = (rowData: Sia.CursoCalificacion) => {
        return (
            <>
                <Link href={`/jefe/curso-calificacion/gestion-curso?codigo=${rowData.Codigo}`}>
                    <Button icon="pi pi-eye" rounded severity="info" tooltip='Inspeccionar' />
                </Link>
                <Link href={`/jefe/curso-calificacion/gestion-horario?codigo=${rowData.Codigo}`}>
                    <Button icon="pi pi-clock" rounded severity="success" className='ml-2' tooltip='Gestionar horario' />
                </Link>
                <Button icon="pi pi-trash" rounded severity="warning" className='ml-2' onClick={() => confirmDeleteCursoCalificacion(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Cursos habilitados - Ciclo {periodoVigente?.Denominacion}</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
            </span>
        </div>
    );

    const headerNotas = (
        <>
            <div>Notas</div>
            <Button icon="pi pi-check" severity='success' rounded text onClick={() => habilitarIngresos('notas')} tooltip='Habilitar el ingreso de notas' />
            <Button icon="pi pi-times" severity='danger' rounded text onClick={() => deshabilitarIngresos('notas')} tooltip='Deshabilitar el ingreso de notas' />
        </>
    );
    const headerRecuperacion = (
        <>
            <div>Recuperación</div>
            <Button icon="pi pi-check" severity='success' rounded text onClick={() => habilitarIngresos('recuperacion')} tooltip='Habilitar el ingreso de recuperaciones' />
            <Button icon="pi pi-times" severity='danger' rounded text onClick={() => deshabilitarIngresos('recuperacion')} tooltip='Deshabilitar el ingreso de recuperaciones' />
        </>
    );
    const headerAplazado = (
        <>
            <div>Aplazados</div>
            <Button icon="pi pi-check" severity='success' rounded text onClick={() => habilitarIngresos('aplazado')} tooltip='Habilitar el ingreso de aplazados' />
            <Button icon="pi pi-times" severity='danger' rounded text onClick={() => deshabilitarIngresos('aplazado')} tooltip='Deshabilitar el ingreso de aplazados' />
        </>
    );

    const productDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveCursoCalificacion} />
        </>
    );
    const deleteProductDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteCursoCalificacion} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteCursoCalificacion} />
        </>
    );

    const asignarDocenteDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideAsignarDocenteDialog} />
            <Button label="Asignar" icon="pi pi-check" text onClick={asignarDocente} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>
                    <DataTable
                        ref={dt}
                        value={cursosCalificacion}
                        loading={loading}
                        dataKey="Codigo"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} courses"
                        globalFilter={globalFilter}
                        emptyMessage="Cursos habilitados no disponibles"
                        header={header}
                    >
                        <Column field="Codigo" header="Codigo" sortable headerStyle={{ minWidth: '6rem' }}></Column>
                        <Column field="Curso.Nombre" header="Curso" body={cursoBodyTemplate} sortable headerStyle={{ minWidth: '6rem' }}></Column>
                        <Column field="Docente.Persona.Nombres" header="Docente" body={docenteTemplate} headerStyle={{ minWidth: '6rem' }}></Column>
                        <Column field="EstadoAplazado" header={headerAplazado} align='center' body={statusAplazadosTemplate} headerStyle={{ minWidth: '8rem' }}></Column>
                        <Column field="EstadoRecuperacion" header={headerRecuperacion} align='center' body={statusRecuperacionTemplate} headerStyle={{ minWidth: '8rem' }}></Column>
                        <Column field="EstadoNotas" header={headerNotas} align='center' body={statusNotasTemplate} headerStyle={{ minWidth: '8rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '12rem' }}></Column>
                    </DataTable>

                    <Dialog visible={cursoCalificacionDialog} style={{ width: '450px' }} header="Datos del curso a calificar" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="carrera">Carrera Profesional</label>
                            <Dropdown
                                id="carrera"
                                value={selectedCarrera}
                                options={carreras}
                                optionLabel='NombreCarrera'
                                optionValue='Codigo'
                                placeholder='Seleccione la carrera'
                                onChange={(e) => onDropDownChange(e.value, 'carrera')}
                                autoFocus
                                showClear
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="curso">Curso a habilitar</label>
                            <Dropdown
                                id="curso"
                                value={cursoCalificacion.CodigoCurso}
                                options={cursos}
                                optionLabel='Nombre'
                                optionValue='Codigo'
                                placeholder='Seleccione un curso'
                                onChange={(e) => onDropDownChange(e.value, 'curso')}
                                autoFocus
                                showClear
                                filter
                                filterBy='Codigo'
                                className={classNames({
                                    'p-invalid': submitted && !cursoCalificacion.CodigoCurso
                                })}
                            />
                            {submitted && !cursoCalificacion.CodigoCurso && <small className="p-invalid">Seleccione un curso</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={asignarDocenteDialog} style={{ width: '450px' }} header="Asignar o reasignar docente" modal className="p-fluid" footer={asignarDocenteDialogFooter} onHide={hideAsignarDocenteDialog}>
                        <div className="field">
                            <label htmlFor="docente">Docente</label>
                            <Dropdown
                                id="docente"
                                value={cursoCalificacion.CodigoDocente}
                                options={docentes}
                                optionLabel='Persona.Nombres'
                                optionValue='Codigo'
                                placeholder='Seleccione un docente'
                                onChange={(e) => onDropDownChange(e.value, 'docente')}
                                required
                                autoFocus
                                showClear
                                className={classNames({
                                    'p-invalid': submitted && !selectedCarrera
                                })}
                            />
                            {submitted && !cursoCalificacion.CodigoDocente && <small className="p-invalid">Seleccione un docente para asignarlo</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteCursoCalificacionDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteProductDialogFooter} onHide={hideDeleteCursoCalificacion}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {cursoCalificacion && (
                                <span>
                                    ¿Eliminar el curso habilitado <b>{cursoCalificacion.Codigo}</b>? Deberá volver a habilitarlo
                                </span>
                            )}
                        </div>
                    </Dialog>
                    <OverlayPanel ref={op}>
                        <label>Código de curso: <strong>{curso?.Codigo}</strong></label><br />
                        <label>Nombre del curso: <strong>{curso?.Nombre}</strong></label> <br />
                        <label>Horas de teoría: <strong>{curso?.HorasTeoria?.toString()}</strong></label> <br />
                        <label>Horas de práctica: <strong>{curso?.HorasPractica?.toString()}</strong></label><br />
                        <label>Créditos: <strong>{curso?.Creditos?.toString()}</strong></label><br />
                        <label>Nivel: <strong>{curso?.Nivel.toString()}</strong></label><br />
                        <label>Semestre: <strong>{curso?.Semestre.toString()}</strong></label><br />
                        <label>Tipo: <strong>{curso?.Tipo}</strong></label><br />
                        <label>Prerrequsito: <strong>{curso?.CodigoCurso}</strong></label>
                    </OverlayPanel>
                </div>
            </div>
        </div>
    );
};

