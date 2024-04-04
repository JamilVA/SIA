'use client';
import React, { useEffect, useRef, useState } from 'react';
import { axiosInstance as axios } from '../../../../utils/axios.instance';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { classNames } from 'primereact/utils';
import 'primeflex/primeflex.css';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { InputSwitch } from 'primereact/inputswitch';
import { Toast } from 'primereact/toast';
import { redirect, useSearchParams } from 'next/navigation';
import 'primeicons/primeicons.css';
import { CalendarChangeEvent } from 'primereact/calendar';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import { useSession } from 'next-auth/react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toolbar } from 'primereact/toolbar';
import Link from 'next/link';

export default function Curso() {
    const searchParamas = useSearchParams();
    const codigoCurso = searchParamas.get('codigo');

    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any[]> | null>(null);

    const cursoVacio = {
        Codigo: '',
        Nombre: '',
        HorasTeoria: 0,
        HorasPractica: 0,
        Creditos: 0,
        Nivel: 0,
        Semestre: 0
    };

    const sesionVacia = {
        Codigo: '',
        CodigoSemanaAcademica: '',
        Numero: '0',
        Descripcion: '',
        LinkClaseVirtual: '',
        Fecha: new Date(),
        HoraInicio: '',
        HoraFin: '',
        EstadoAsistencia: 0
    };

    const semanaVacia = {
        Codigo: '',
        Descripcion: '',
        CodigoUnidadAcademica: ''
    };

    const unidadVacia = {
        Codigo: '',
        Denominacion: '',
        CodigoCursoCalificacion: ''
    };

    const [curso, setCurso] = useState(cursoVacio);
    const [sesion, setSesion] = useState({
        ...sesionVacia,
        Fecha: new Date()
    });
    const [sesiones, setSesiones] = useState<(typeof sesionVacia)[]>([]);
    const [semanas, setSemanas] = useState<(typeof semanaVacia)[]>([]);
    const [unidades, setUnidades] = useState<(typeof unidadVacia)[]>([]);

    const [submitted, setSubmitted] = useState(false);
    const [modified, setModified] = useState(false);
    const [sesionDialog, setSesionDialog] = useState(false);
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'authenticated') {
            cargarDatos();
        }
    }, [status]);

    const cargarDatos = async () => {
        try {
            const { data } = await axios.get('/sesion/docente', {
                params: {
                    CodigoCursoCalificacion: codigoCurso
                },
                headers: {
                    Authorization: 'Bearer ' + session?.user.token
                }
            });

            const { curso, unidades, semanas, sesiones } = data;

            setCurso(curso.Curso);
            setUnidades(unidades);
            setSemanas(semanas);
            setSesiones(sesiones);
            // console.log(data);
        } catch (e) {
            // console.error(e);
            toast.current!.show({ severity: 'error', summary: 'Error', detail: 'Ha ocurrido un error al cargar los datos', life: 3000 });
        }
    };

    const saveSesion = () => {
        let _sesion = { ...sesion };

        if (modified) {
            axios
                .put(
                    '/sesion',
                    {
                        codigo: _sesion.Codigo,
                        descripcion: _sesion.Descripcion,
                        linkClaseVirtual: _sesion.LinkClaseVirtual,
                        fecha: _sesion.Fecha,
                        horaInicio: _sesion.HoraInicio,
                        horaFin: _sesion.HoraFin
                    },
                    {
                        headers: {
                            Authorization: 'Bearer ' + session?.user.token
                        }
                    }
                )
                .then((response) => {
                    // console.log(response.data);
                    toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Sesion modificada con éxito', life: 3000 });
                    cargarDatos();
                });
            setSesionDialog(false);
            setSesion(sesionVacia);
        } else {
            axios
                .post(
                    '/sesion',
                    {
                        codigo: _sesion.Codigo,
                        numero: _sesion.Numero,
                        descripcion: _sesion.Descripcion,
                        codigoSemanaAcademica: _sesion.CodigoSemanaAcademica,
                        linkClaseVirtual: _sesion.LinkClaseVirtual,
                        fecha: _sesion.Fecha,
                        horaInicio: _sesion.HoraInicio,
                        horaFin: _sesion.HoraFin
                    },
                    {
                        headers: {
                            Authorization: 'Bearer ' + session?.user.token
                        }
                    }
                )
                .then((response) => {
                    toast.current!.show({ severity: 'success', summary: 'Successful', detail: 'Sesion creada con éxito', life: 3000 });
                    cargarDatos();
                });
            setSesionDialog(false);
            setSesion(sesionVacia);
        }
    };

    const editSesion = (sesion: typeof sesionVacia) => {
        let tempSesion = {
            Codigo: sesion.Codigo,
            CodigoSemanaAcademica: sesion.CodigoSemanaAcademica,
            Descripcion: sesion.Descripcion,
            LinkClaseVirtual: sesion.LinkClaseVirtual,
            Numero: sesion.Numero,
            Fecha: new Date(sesion.Fecha + 'T00:00:00'),
            HoraInicio: sesion.HoraInicio,
            HoraFin: sesion.HoraFin,
            EstadoAsistencia: sesion.EstadoAsistencia
        };

        setSesion(tempSesion);
        setModified(true);
        setSesionDialog(true);
    };

    const hideSesionDialog = () => {
        setSubmitted(false);
        setSesionDialog(false);
    };

    const deshabilitarAsistencia = async (codigo: string) => {
        await axios
            .put('/sesion/deshabilitar-asistencia', {
                params: {
                    codigo: codigo
                },
                headers: {
                    Authorization: 'Bearer ' + session?.user.token
                }
            })
            .then((response) => {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Asistencia Deshabilitada',
                    detail: response.data.message,
                    life: 3000
                });
                cargarDatos();
            })
            .catch((error) => {
                // console.error(error.data);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operacion fallida',
                    detail: error.message,
                    life: 3000
                });
            });
        setSesion(sesionVacia);
    };
    const habilitarAsistencia = async (codigo: string) => {
        await axios
            .put('/sesion/habilitar-asistencia', {
                params: {
                    codigo: codigo
                },
                headers: {
                    Authorization: 'Bearer ' + session?.user.token
                }
            })
            .then((response) => {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Asistencia Habilitada',
                    detail: response.data.message,
                    life: 3000
                });
                cargarDatos();
            })
            .catch((error) => {
                // console.error(error.data);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operacion fallida',
                    detail: error.message,
                    life: 3000
                });
            });
        setSesion(sesionVacia);
    };

    const handleClick = async (sesion: typeof sesionVacia) => {
        if (!!sesion.EstadoAsistencia === true) {
            await deshabilitarAsistencia(sesion.Codigo);
        } else {
            await habilitarAsistencia(sesion.Codigo);
        }
    };

    const onCalendarChange = (e: CalendarChangeEvent) => {
        const selectedDate = e.value as Date;

        let _sesion = { ...sesion };
        _sesion.Fecha = selectedDate;

        setSesion(_sesion);
        // console.log(_sesion);
    };

    const sesionDialogFooter = (
        <React.Fragment>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideSesionDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={saveSesion} />
        </React.Fragment>
    );

    const filtrarSemanas = (Semanas: (typeof semanaVacia)[], Codigo: string) => {
        return Semanas.filter((s) => s.CodigoUnidadAcademica === Codigo);
    };

    const filtrarSesiones = (Sesiones: (typeof sesionVacia)[], Codigo: string) => {
        return Sesiones.filter((s) => s.CodigoSemanaAcademica === Codigo);
    };

    const numeroBodyTemplate = (rowData: any) => {
        return rowData.Numero;
    };
    const sesionBodyTemplate = (rowData: any) => {
        return rowData.Descripcion;
    };
    const fechaBodyTemplate = (rowData: any) => {
        if (rowData.Fecha) {
            const fecha = new Date(rowData.Fecha + 'T00:00:00');
            return (
                fecha
                    .toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit'
                    })
                    .toUpperCase() +
                ' ' +
                rowData.HoraInicio.slice(0, 5)
            );
        }
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <React.Fragment>
                <InputSwitch tooltip={rowData.EstadoAsistencia ? 'Deshabilitar asistencia' : 'Habilitar asistencia'} checked={!!rowData.EstadoAsistencia} onChange={() => handleClick(rowData)} />
                <Link href={`/jefatura/habilitacion-cursos/gestion-curso/asistencias?codigo=${rowData.Codigo}`}>
                    <Button tooltip="Ver asistencias" icon="pi pi-list" className="p-button-info p-button-sm ml-3 mr-2" style={{ padding: '0.75em', fontSize: '0.75em' }} />
                </Link>
                <Button tooltip="Editar" icon="pi pi-pencil" className="p-button-warning p-button-sm mr-8" style={{ padding: '0.75em', fontSize: '0.75em' }} onClick={() => editSesion(rowData)} />

            </React.Fragment>
        );
    };

    const headerSemana = (rowData: typeof semanaVacia) => {
        return (
            <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                <h6 className="m-0">
                    <i className="pi pi-calendar mr-3"></i> {rowData.Descripcion}
                </h6>
            </div>
        );
    };

    const headerUnidad = (rowData: typeof unidadVacia) => {
        return (
            <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                <h5 className="m-0 text-primary">
                    <i className="pi pi-book mr-3"></i> {rowData.Denominacion}
                </h5>
            </div>
        );
    };

    const semanaBodyTempalte = (rowData: typeof semanaVacia) => {
        return (
            <React.Fragment>
                <DataTable ref={dt} value={filtrarSesiones(sesiones, rowData.Codigo)} header={headerSemana(rowData)} dataKey="Codigo">
                    <Column headerStyle={{ display: 'none' }} body={numeroBodyTemplate} style={{ minWidth: '1rem' }}></Column>
                    <Column headerStyle={{ display: 'none' }} body={sesionBodyTemplate} style={{ minWidth: '14rem' }}></Column>
                    <Column headerStyle={{ display: 'none' }} body={fechaBodyTemplate} style={{ minWidth: '8rem' }}></Column>
                    <Column className={classNames({ 'text-right': true })} headerStyle={{ display: 'none' }} body={actionBodyTemplate} style={{ minWidth: '5rem', paddingRight: '1rem' }}></Column>
                </DataTable>
            </React.Fragment>
        );
    };

    const unidadBodyTemplate = (rowData: typeof unidadVacia) => {
        return (
            <React.Fragment>
                <DataTable className="m-0" ref={dt} value={filtrarSemanas(semanas, rowData.Codigo)} header={headerUnidad(rowData)} dataKey="Codigo">
                    <Column headerStyle={{ display: 'none' }} body={semanaBodyTempalte} style={{ minWidth: '12rem' }}></Column>
                </DataTable>
            </React.Fragment>
        );
    };

    const title = (curso: typeof cursoVacio) => {
        return (
            <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                <h4>{curso.Nombre}</h4>
            </div>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Link href={`/jefatura/habilitacion-cursos/gestion-curso/calificaciones?codigo=${codigoCurso}`}>
                        <Button label="Ver notas" size="small" icon="pi pi-list" severity="info" className=" mr-2" />
                    </Link>
                </div>
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

    if (!session) {
        redirect('/');
    } else if (session?.user.codigoJefe == 0) {
        redirect('/pages/notfound');
    }

    return (
        <div>
            <Toast ref={toast} />
            <Toolbar className="mb-4" start={leftToolbarTemplate}></Toolbar>

            <Card title={title(curso)} subTitle={'Codigo (' + curso.Codigo + ')'} style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}></Card>

            <DataTable ref={dt} value={unidades} dataKey="Codigo" emptyMessage="No se han encontrado registros de sesiones">
                <Column headerStyle={{ display: 'none' }} body={unidadBodyTemplate} style={{ minWidth: '4rem' }}></Column>
            </DataTable>
            <Dialog visible={sesionDialog} style={{ width: '40rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Datos de la sesión" modal className="p-fluid" footer={sesionDialogFooter} onHide={hideSesionDialog}>
                <div className="field col">
                    <label htmlFor="fecha" className="font-bold">
                        Fecha de la sesión
                    </label>
                    <Calendar id="fecha" value={sesion.Fecha} onChange={(e) => onCalendarChange(e)} showIcon required className={classNames({ 'p-invalid': submitted && !sesion.Fecha })} />
                    {submitted && !sesion.Fecha && <small className="p-error">Ingrese la Fecha.</small>}
                </div>
            </Dialog>
        </div>
    );
}
