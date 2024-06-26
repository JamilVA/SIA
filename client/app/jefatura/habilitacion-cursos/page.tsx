/* eslint-disable @next/next/no-img-element */
'use client';
import { axiosInstance as axios } from '../../../utils/axios.instance';
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
    const [habilitarBloqueDialog, setHabilitarBloqueDialog] = useState(false)

    const [loading, setLoading] = useState(false)
    const [loadingNotas, setLoadingNotas] = useState(false)
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const op = useRef<OverlayPanel>(null)

    const [cursoCalificacion, setCursoCalificacion] = useState<Sia.CursoCalificacion>(emptyCursoCalificacion)
    const [periodoVigente, setPeriodoVigente] = useState<Sia.Periodo>(emptyPeriodo)
    const [curso, setCurso] = useState<Sia.Curso>(emptyCurso)

    const [selectedCarrera, setSelectedCarrera] = useState(null)
    const [semestre, setSemestre] = useState(null)

    const [cursosCalificacion, setCursosCalificacion] = useState<Sia.CursoCalificacion[]>([])
    const [cursos, setCursos] = useState([emptyCurso])
    const [docentes, setDocentes] = useState<Array<Sia.Docente>>([])
    const [tempCursos, setTempCursos] = useState([emptyCurso])

    const [carreras, setCarreras] = useState<Array<any>>([])

    const fetchCursos = async () => {
        await axios.get('/curso', {
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        })
            .then(response => {
                const cursos = response.data.cursos
                let _cursos = cursos.filter((curso: any) => curso.CarreraProfesional.CodigoJefeDepartamento === session?.user.codigoJefe)
                //// console.log(response.data.cursos)
                //setCursos(_cursos)
                setTempCursos(_cursos)
            })
            .catch(error => {
                setCursos([])
                // console.log("Error de carga: ", error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error en la carga de cursos',
                    life: 3000
                });
            })
    }

    const fetchPeriodoVigente = async () => {
        await axios.get('/periodo/vigente',{
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        })
            .then(response => {
                setPeriodoVigente(response.data.periodo)
            })
            .catch(error => {
                //// console.log("Error de carga: ", error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response.data.error,
                    life: 3000
                });
            })
    }

    const fetchCursosCalificacion = async () => {
        setLoading(true)
        await axios.get('/curso-calificacion', {
            params: {
                CodigoJefe: session?.user.codigoJefe
            },
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        })
            .then(response => {
                setLoading(false)
                const _cursosPeriodoVigente = response.data.cursosCalificacion
                setCursosCalificacion(_cursosPeriodoVigente)
            })
            .catch(error => {
                setCursosCalificacion([])
                setLoading(false)
                // console.log("Error de carga: ", error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error en la carga de datos',
                    life: 3000
                });
            })
    }

    const fetchDocentes = async () => {
        await axios.get('/docente', {
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        })
            .then(response => {
                const _docentes = response.data.docentes
                //// console.log(_docentes)
                setDocentes(_docentes)
            })
            .catch(error => {
                setDocentes([])
                // console.log("Error de carga: ", error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error en la carga de datos',
                    life: 3000
                });
            })
    }

    const fetchCarreras = async () => {
        await axios.get('/curso-calificacion/carreras', {
            params: { codigoJefe: session?.user.codigoJefe },
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        })
            .then(response => {
                const _carreras = response.data.carreras
                setCarreras(_carreras)
            })
            .catch(error => {
                setCarreras([])
                // console.log("Error de carga: ", error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error en la carga de carreras',
                    life: 3000
                });
            })
    }

    useEffect(() => {
        if (status === 'authenticated') {
            fetchPeriodoVigente()
        }
    }, [status]);

    useEffect(() => {
        if (status === 'authenticated') {
            if (periodoVigente) {
                fetchCarreras()
                fetchCursos()
                fetchCursosCalificacion()
                fetchDocentes()
            }
        }
    }, [periodoVigente]);

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

    const openDetallesCurso = (curso: Sia.Curso, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
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

    const hideHabilitarBloqueDialog = () => {
        setSubmitted(false);
        setHabilitarBloqueDialog(false);
    };

    const saveCursoCalificacion = async () => {
        setSubmitted(true);
        if (!cursoCalificacion.CodigoCurso) {
            return
        }
        setCursoCalificacionDialog(false);
        await axios.post('/curso-calificacion', {
            ...cursoCalificacion,
            CodigoDocente: null,
            CodigoPeriodo: periodoVigente?.Codigo
        },{
            headers: {
                Authorization: 'Bearer ' + session?.user.token
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
                // console.log(error)
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
        await axios.delete('/curso-calificacion/eliminar', {
            params: { codigo: cursoCalificacion.Codigo },
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
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
                setSelectedCarrera(value)
                fetchCursos()
                let _cursos = tempCursos.filter(curso => curso.CodigoCarreraProfesional === value)
                //// console.log(_cursos)
                setCursos(_cursos)
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
            case 'ciclo':
                setSemestre(value)
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
        await axios.put('/curso-calificacion/habilitar-ingreso', {}, {
            params: {
                campo: campo,
                codigo: codigo
            },
            headers: {
                Authorization: 'Bearer ' + session?.user.token
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
                // console.error(error.data)
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
        await axios.put('/curso-calificacion/deshabilitar-ingreso', {}, {
            params: {
                campo: campo,
                codigo: codigo
            },
            headers: {
                Authorization: 'Bearer ' + session?.user.token
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
                // console.error(error.data)
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
        await axios.put('/curso-calificacion/habilitar-ingresos', {}, {
            params: {
                periodo: periodoVigente.Codigo,
                campo: campo
            },
            headers: {
                Authorization: 'Bearer ' + session?.user.token
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
                // console.error(error.data)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operacion fallida',
                    detail: 'Ha ocurrido un error al procesar la solicitud',
                    life: 3000
                });
            })
    }

    const deshabilitarIngresos = async (campo: string) => {
        await axios.put('/curso-calificacion/deshabilitar-ingresos', {}, {
            params: {
                periodo: periodoVigente.Codigo,
                campo: campo
            },
            headers: {
                Authorization: 'Bearer ' + session?.user.token
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
                // console.error(error.data)
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
        await axios.put('/curso-calificacion/asignar-docente', {}, {
            params: {
                codigo: cursoCalificacion.Codigo,
                codigoDocente: cursoCalificacion.CodigoDocente
            },
            headers: {
                Authorization: 'Bearer ' + session?.user.token
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
                // console.error(error.response)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operacion fallida',
                    detail: 'Ha ocurrido un error al procesar la solicitud',
                    life: 3000
                });
            })
    }

    const openHabilitarCursosBloque = () => {
        if (!periodoVigente) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Operacion no disponible',
                detail: 'Periodo vigente no disponible para habilitación de cursos.',
                life: 3000
            });
            return
        }
        setSubmitted(false);
        setSelectedCarrera(null)
        setSemestre(null)
        setHabilitarBloqueDialog(true);
    };

    const habilitarCursosBloque = async () => {
        setSubmitted(true)
        if (!selectedCarrera || !semestre) {
            return
        }

        await axios.post('/curso-calificacion/habilitar-ciclo', {}, {
            params: {
                codigoPeriodo: periodoVigente.Codigo,
                codigoCarrera: selectedCarrera,
                semestre: semestre
            },
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        })
            .then(response => {
                fetchCursosCalificacion()
                toast.current?.show({
                    severity: 'success',
                    summary: 'Operación exitosa',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch(error => {
                // console.error(error.response)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operacion fallida',
                    detail: !error.response ? error.message : error.response.data.error,
                    life: 3000
                });
            })
    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Habilitar curso" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                    <Button label="Habilitar en bloque" icon="pi pi-list" severity="secondary" onClick={openHabilitarCursosBloque} />
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
                    <Button icon="pi pi-book" rounded text severity="secondary" onClick={(e) => openDetallesCurso(rowData.Curso as Sia.Curso, e)} tooltip='Ver curso' />
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
                <Link href={`/jefatura/habilitacion-cursos/gestion-curso?codigo=${rowData.Codigo}`}>
                    <Button icon="pi pi-eye" rounded severity="info" tooltip='Inspeccionar' />
                </Link>
                <Link href={`/jefatura/habilitacion-cursos/gestion-horario?codigo=${rowData.Codigo}`}>
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
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar..." />
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
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" text onClick={saveCursoCalificacion} />
        </>
    );
    const deleteProductDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteCursoCalificacion} />
            <Button label="Si" icon="pi pi-check" text onClick={deleteCursoCalificacion} />
        </>
    );

    const asignarDocenteDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideAsignarDocenteDialog} />
            <Button label="Asignar" icon="pi pi-check" text onClick={asignarDocente} />
        </>
    );

    const habilitarBloqueDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideHabilitarBloqueDialog} />
            <Button label="Habilitar" icon="pi pi-check" text onClick={habilitarCursosBloque} />
        </>
    );

    if (status === "loading") {
        return (
            <>
                <div className='flex items-center justify-center align-content-center' style={{ marginTop: '20%' }}>
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                </div>
            </>
        )
    }

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
                        currentPageReportTemplate="Mostrando de {first} a {last} de {totalRecords} cursos habilitados"
                        globalFilter={globalFilter}
                        emptyMessage="Cursos habilitados no disponibles"
                        header={header}
                    >
                        <Column field="CodigoCurso" header="Código" sortable headerStyle={{ minWidth: '6rem' }}></Column>
                        <Column field="Curso.Nombre" header="Curso" body={cursoBodyTemplate} sortable headerStyle={{ minWidth: '6rem' }}></Column>
                        <Column field="Docente.Persona.Nombres" header="Docente" body={docenteTemplate} headerStyle={{ minWidth: '6rem' }}></Column>
                        <Column field="EstadoAplazado" header={headerAplazado} align='center' body={statusAplazadosTemplate} headerStyle={{ minWidth: '8rem' }}></Column>
                        <Column field="EstadoRecuperacion" header={headerRecuperacion} align='center' body={statusRecuperacionTemplate} headerStyle={{ minWidth: '8rem' }}></Column>
                        <Column field="EstadoNotas" header={headerNotas} align='center' body={statusNotasTemplate} headerStyle={{ minWidth: '8rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '12rem' }}></Column>
                    </DataTable>

                    <Dialog visible={habilitarBloqueDialog} style={{ width: '450px' }} header="Habilitar cursos en bloque" modal className="p-fluid" footer={habilitarBloqueDialogFooter} onHide={hideHabilitarBloqueDialog}>
                        <div className="field">
                            <label htmlFor="carrera">Carrera profesional</label>
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
                                className={classNames({
                                    'p-invalid': submitted && !cursoCalificacion.CodigoCurso
                                })}
                            />
                            {submitted && !selectedCarrera && <small className="p-invalid">Seleccione una carrera</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="carrera">Ciclo</label>
                            <Dropdown
                                id="carrera"
                                value={semestre}
                                options={[{ label: 'Ciclos pares', value: 2 }, { label: 'Ciclos impares', value: 1 }]}
                                optionLabel='label'
                                optionValue='value'
                                placeholder='Seleccione ciclo'
                                onChange={(e) => onDropDownChange(e.value, 'ciclo')}
                                autoFocus
                                showClear
                                className={classNames({
                                    'p-invalid': submitted && !semestre
                                })}
                            />
                            {submitted && !semestre && <small className="p-invalid">Seleccione un ciclo</small>}
                        </div>
                    </Dialog>

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
                                filterBy='Persona.Nombres,Persona.Paterno'
                                filter
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

