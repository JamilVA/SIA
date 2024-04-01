/* eslint-disable @next/next/no-img-element */
'use client';
import { redirect } from 'next/navigation';
import { axiosInstance as axios } from '../../../utils/axios.instance';
import { Button } from 'primereact/button';
import { Calendar, CalendarChangeEvent } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { useSession } from "next-auth/react";
import { ProgressSpinner } from 'primereact/progressspinner';

/* @todo Used 'as any' for types here. Will fix in next version due to onSelectionChange event type issue. */
export default function PeriodoPage() {

    const periodoVacio = {
        Codigo: '',
        Denominacion: '',
        FechaInicio: null,
        FechaFin: null,
        InicioMatricula: null,
        FinMatricula: null,
        Estado: true
    }
    const [periodos, setPeriodos] = useState([periodoVacio])
    const [loading, setLoading] = useState(true)
    const [editar, setEditar] = useState(false)
    const [periodoDialog, setPeriodoDialog] = useState(false);
    const [deletePeriodoDialog, setDeletePeriodoDialog] = useState(false);
    const [finalizarPeriodoDialog, setFinalizarPeriodoDialog] = useState(false);
    const [periodo, setPeriodo] = useState(periodoVacio);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const { data: session, status } = useSession();

    const fetchPeriodos = async () => {
        await axios.get('/periodo', {
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        })
            .then(response => {
                //// console.log(response.data.periodos)
                setPeriodos(response.data.periodos)
                setLoading(false)
            })
            .catch(error => {
                setLoading(false)
                setPeriodos([])
                //// console.log("Error de carga: ", error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message,
                    life: 3000
                });
            })
    }

    useEffect(() => {
        if (status === 'authenticated') {
            fetchPeriodos();
        }
    }, [status]);

    const openNew = () => {
        setPeriodo(periodoVacio);
        setSubmitted(false);
        setPeriodoDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setPeriodoDialog(false);
    };

    const hideDeletePeriodoDialog = () => {
        setDeletePeriodoDialog(false);
    };

    const hideFinalizarPeriodoDialog = () => {
        setFinalizarPeriodoDialog(false);
    };

    const periodoValido = () => {
        let valido = true;
        if (periodo.Denominacion === '') {
            valido = false
        }
        if (periodo.FechaInicio === null) {
            valido = false
        }
        if (periodo.FechaFin === null) {
            valido = false
        }
        if (periodo.InicioMatricula === null) {
            valido = false
        }
        if (periodo.FinMatricula === null) {
            valido = false
        }
        return valido
    }

    const crearPeriodo = async () => {
        await axios.post('/periodo', periodo, {
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        })
            .then(response => {
                //// console.log(response.data)
                const _periodo = response.data.periodo

                periodos.push(_periodo)
                setPeriodos(periodos)

                toast.current?.show({
                    severity: 'success',
                    summary: 'Operación exitosa',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch(error => {
                // console.log("Ha ocurrido un error", error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message,
                    life: 3000
                });
            })

        setPeriodo(periodoVacio)

    }

    const editarPeriodo = async () => {
        await axios.put('/periodo', periodo, {
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        })
            .then(response => {
                const _periodos = periodos.map(p => {
                    if (p.Codigo === periodo.Codigo) {
                        return periodo
                    } else {
                        return p
                    }
                });
                setPeriodos(_periodos)
                setPeriodo(periodoVacio)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Operación exitosa',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch(error => {
                // console.log("Ha ocurrido un error", error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Ha ocurrido un error al actualizar el periodo académico',
                    life: 3000
                });
            })
        setEditar(false)
    }

    const savePeriodo = async () => {
        setSubmitted(true);
        if (editar) {
            await editarPeriodo()
            setPeriodoDialog(false)
        } else {
            if (periodoValido()) {
                await crearPeriodo()
                setPeriodoDialog(false)
            }
        }

    };

    const editPeriodo = (periodo: any) => {
        let _periodo = {
            ...periodo,
            FechaInicio: new Date(periodo.FechaInicio + 'T05:00:00.000Z'),
            FechaFin: new Date(periodo.FechaFin + 'T05:00:00.000Z'),
            InicioMatricula: new Date(periodo.InicioMatricula + 'T05:00:00.000Z'),
            FinMatricula: new Date(periodo.FinMatricula + 'T05:00:00.000Z')
        }
        setEditar(true)
        setPeriodo(_periodo);
        setPeriodoDialog(true);
    };

    const confirmDeletePeriodo = (periodo: any) => {
        setPeriodo(periodo);
        setDeletePeriodoDialog(true);
    };

    const confirmFinalizarPeriodo = (periodo: any) => {
        setPeriodo(periodo);
        setFinalizarPeriodoDialog(true);
    };

    const deletePeriodo = async () => {
        await axios.delete('/periodo', {
            params: {
                codigo: periodo.Codigo
            },
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        })
            .then(response => {
                let _periodos = periodos.filter(p => p.Codigo !== periodo.Codigo)
                // console.log(_periodos)
                setPeriodos(_periodos)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Operación exitosa',
                    detail: 'El periodo académico se ha eliminado correctamente',
                    life: 3000
                });
            })
            .catch(error => {
                // console.log(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operación fallida',
                    detail: 'El periodo no se ha podido eliminar',
                    life: 3000
                });
            })

        setDeletePeriodoDialog(false);
        setPeriodo(periodoVacio);

    };

    const finalizarPeriodo = async () => {
        setFinalizarPeriodoDialog(false);

        await axios.put('/periodo/finalizar', {}, {
            params: {
                codigo: periodo.Codigo,
            },
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        })
            .then(response => {
                const _periodos = periodos.map(p => {
                    if (p.Codigo === periodo.Codigo) {
                        return {
                            ...periodo,
                            Estado: false
                        }
                    } else {
                        return p
                    }
                });
                setPeriodos(_periodos)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Operación exitosa',
                    detail: 'El periodo académico se ha finalizado correctamente',
                    life: 3000
                });
            })
            .catch(error => {
                // console.log(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Operación fallida',
                    detail: 'El periodo no se ha podido finalizar',
                    life: 3000
                });
            })
        setPeriodo(periodoVacio);
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const val = (e.target && e.target.value) || '';
        let _periodo = { ...periodo };
        _periodo.Denominacion = val.toUpperCase();
        setPeriodo(_periodo);
        // console.log(_periodo)
    };

    const onCalendarChange = (value: any, fechaName: string) => {
        //// console.log(selectedDate)
        let _periodo = { ...periodo };
        switch (fechaName) {
            case 'inicio':
                _periodo.FechaInicio = value;
                break;
            case 'fin':
                _periodo.FechaFin = value;
                break;
            case 'inicioMatricula':
                _periodo.InicioMatricula = value;
                break;
            case 'finMatricula':
                _periodo.FinMatricula = value;
                break;
            default:
                break;
        }
        setPeriodo(_periodo);

    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo periodo" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                    {/* <Button label="Delete" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedProducts || !(selectedProducts as any).length} /> */}
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Exportar" icon="pi pi-upload" severity="help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const dateInicioBodyTemplate = (rowData: any) => {
        return formatDate(new Date(rowData.FechaInicio));
    };

    const dateFinBodyTemplate = (rowData: any) => {
        return formatDate(new Date(rowData.FechaFin));
    };

    const dateInicioMatriculaBodyTemplate = (rowData: any) => {
        return formatDate(new Date(rowData.InicioMatricula));
    };

    const dateFinMatriculaBodyTemplate = (rowData: any) => {
        return formatDate(new Date(rowData.FinMatricula));
    };

    const formatDate = (value: Date) => {
        value.setDate(value.getDate() + 1)
        return value.toLocaleDateString();
    };

    const statusBodyTemplate = (rowData: any) => {
        return <i className={classNames('pi', { 'text-green-500 pi-check-circle': rowData.Estado, 'text-red-500 pi-times-circle': !rowData.Estado })}></i>;
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editPeriodo(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" className='mr-2' onClick={() => confirmDeletePeriodo(rowData)} />
                <Button icon="pi pi-power-off" rounded severity="danger" onClick={() => confirmFinalizarPeriodo(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestionar Periodos Académicos</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const productDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" onClick={savePeriodo} />
        </>
    );

    const deletePeriodoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeletePeriodoDialog} />
            <Button label="Sí" icon="pi pi-check" text onClick={deletePeriodo} />
        </>
    );

    const finalizarPeriodoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideFinalizarPeriodoDialog} />
            <Button label="Sí" icon="pi pi-check" text onClick={finalizarPeriodo} />
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

    if (session?.user.nivelUsuario != 1) {
        redirect('/pages/notfound')
    }

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        loading={loading}
                        value={periodos}
                        dataKey="Codigo"
                        className="datatable-responsive"
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron periodos registrados"
                        header={header}
                    >
                        <Column field="Codigo" header="Código" sortable headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column field="Denominacion" header="Denominación" sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field='FechaInicio' header="Fecha de inicio" body={dateInicioBodyTemplate} headerStyle={{ minWidth: '10rem' }} />
                        <Column field='FechaFin' header="Fecha de fin" body={dateFinBodyTemplate} dataType="date" headerStyle={{ minWidth: '8rem' }} />
                        <Column field='InicioMatricula' header="Inicio matrículas" body={dateInicioMatriculaBodyTemplate} dataType="date" headerStyle={{ minWidth: '10rem' }} />
                        <Column field='FinMatricula' header="Fin matrículas" body={dateFinMatriculaBodyTemplate} dataType="date" headerStyle={{ minWidth: '10rem' }} />
                        <Column field="Estado" header="Estado" body={statusBodyTemplate} headerStyle={{ minWidth: '6rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '12rem' }}></Column>
                    </DataTable>

                    <Dialog visible={periodoDialog} style={{ width: '450px' }} header="Detalles del periodo académico" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="denominacion" className="font-bold">Denominación</label>
                            <InputText
                                id="denominacion"
                                value={periodo.Denominacion}
                                onChange={(e) => onInputChange(e)}
                                required
                                placeholder='2024-I'
                                autoFocus
                                maxLength={7}
                                className={classNames({
                                    'p-invalid': submitted && !periodo.Denominacion
                                })}
                            />
                            {submitted && !periodo.Denominacion && <small className="p-invalid">Ingrese una denominación para el periódo académico</small>}
                        </div>
                        <div className="field col">
                            <label htmlFor="fechaInicio" className="font-bold">
                                Inicio del periodo académico
                            </label>
                            <Calendar id="fechaInicio" value={periodo.FechaInicio} onChange={(e) => onCalendarChange(e.value, 'inicio')} dateFormat="dd/mm/yy" className={classNames({ 'p-invalid': submitted && !periodo.FechaInicio })} />
                            {submitted && !periodo.FechaInicio && <small className="p-error">Ingrese fecha de inicio del periodo académico</small>}
                        </div>
                        <div className="field col">
                            <label htmlFor="fechaFin" className="font-bold">
                                Fin del periodo académico
                            </label>
                            <Calendar id="fechaFin" value={periodo.FechaFin} onChange={(e) => onCalendarChange(e.value, 'fin')} dateFormat="dd/mm/yy" className={classNames({ 'p-invalid': submitted && !periodo.FechaFin })} />
                            {submitted && !periodo.FechaFin && <small className="p-error">Ingrese fecha de fin del periodo académico</small>}
                        </div>
                        <div className="field col">
                            <label htmlFor="inicioMatriculas" className="font-bold">
                                Inicio de matrículas
                            </label>
                            <Calendar id="inicioMatriculas" value={periodo.InicioMatricula} onChange={(e) => onCalendarChange(e.value, 'inicioMatricula')} dateFormat="dd/mm/yy" className={classNames({ 'p-invalid': submitted && !periodo.InicioMatricula })} />
                            {submitted && !periodo.InicioMatricula && <small className="p-error">Ingrese fecha de inicio de matrículas</small>}
                        </div>
                        <div className="field col">
                            <label htmlFor="finMatriculas" className="font-bold">
                                Fin de matrículas
                            </label>
                            <Calendar id="finMatriculas" value={periodo.FinMatricula} onChange={(e) => onCalendarChange(e.value, 'finMatricula')} dateFormat="dd/mm/yy" className={classNames({ 'p-invalid': submitted && !periodo.FinMatricula })} />
                            {submitted && !periodo.FinMatricula && <small className="p-error">Ingrese fecha de fin de matrículas</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deletePeriodoDialog} style={{ width: '450px' }} header="Eliminar perido académico" modal footer={deletePeriodoDialogFooter} onHide={hideDeletePeriodoDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {periodo && (
                                <span>
                                    ¿Seguro de que desea eliminar el periodo académico <b>{periodo.Denominacion}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={finalizarPeriodoDialog} style={{ width: '450px' }} header="Finalizar el periodo académico" modal footer={finalizarPeriodoDialogFooter} onHide={hideFinalizarPeriodoDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {periodo && (
                                <span>
                                    ¿Seguro de que desea finalizar el periodo académico <b>{periodo.Denominacion}</b>?
                                    Esta acción es irreversible.
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};


