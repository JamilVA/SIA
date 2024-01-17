/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { DataView } from 'primereact/dataview';
import { FileUpload, FileUploadFilesEvent } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { Calendar } from 'primereact/calendar';

import axios from 'axios';

/* @todo Used 'as any' for types here. Will fix in next version due to onSelectionChange event type issue. */
export default function ActividadesPage() {

    let codigoSesion = '1014P3203252'

    let emptyActividad = {
        Codigo: 0,
        Titulo: '',
        RutaRecursoGuia: '',
        FechaApertura: new Date().toISOString(),
        FechaCierre: new Date().toISOString(),
        CodigoSesion: codigoSesion
    };

    const [actividades, setActividades] = useState<Array<any>>([]);
    const [actividadDialog, setActividadDialog] = useState(false);
    const [deleteActividadDialog, setDeleteActividadDialog] = useState(false);
    const [actividad, setActividad] = useState(emptyActividad);
    const [submitted, setSubmitted] = useState(false);
    const [modificar, setModificar] = useState(false)
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    const fetchActividades = async () => {
        await axios.get('http://localhost:3001/api/actividad', {
            params: { codigoSesion: codigoSesion }
        })
            .then(response => {
                setActividades(response.data.actividades)
            })
            .catch(error => {
                console.error(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message,
                    life: 3000
                });
            })
    }

    useEffect(() => {
        fetchActividades()
    }, []);

    const openNew = () => {
        setActividad(emptyActividad);
        setSubmitted(false);
        setActividadDialog(true);
        setModificar(false)
    };

    const hideDialog = () => {
        setSubmitted(false);
        setActividadDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteActividadDialog(false);
    };

    const saveActividad = async () => {
        setSubmitted(true);

        if (actividad.Titulo.length === 0) {
            return
        }
        setActividadDialog(false);

        if (!modificar) {
            crearActividad()
        } else {
            modificarActividad(actividad)
        }

        setActividad(emptyActividad);
    };

    const crearActividad = async () => {
        await axios.post('http://localhost:3001/api/actividad', actividad)
            .then(response => {
                let _actividades = actividades
                _actividades.push(response.data.actividad)
                setActividades(_actividades)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch(error => {
                console.error(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message,
                    life: 3000
                });
            })
    }

    const modificarActividad = async (actividad: any) => {
        await axios.put('http://localhost:3001/api/actividad', actividad)
            .then(response => {
                let _actividades = actividades.map(value => {
                    if (value.Codigo === actividad.Codigo) {
                        return actividad
                    }
                    return value
                })
                setActividades(_actividades)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch(error => {
                console.error(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message,
                    life: 3000
                });
            })
    }

    const editActividad = (actividad: any) => {
        setActividad({ ...actividad });
        setActividadDialog(true);
        setModificar(true)
    };

    const confirmDeleteActividad = (actividad: any) => {
        setActividad(actividad);
        setDeleteActividadDialog(true);
    };

    const deleteActividad = async () => {
        setDeleteActividadDialog(false);
        await axios.delete('http://localhost:3001/api/actividad', {
            params: { codigo: actividad.Codigo }
        })
            .then(response => {
                let _actividades = actividades.filter(val => val.Codigo !== actividad.Codigo);
                setActividades(_actividades);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: response.data.message,
                    life: 3000
                });
            })
            .catch(error => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message,
                    life: 3000
                });
            })
        setActividad(emptyActividad);
    };

    const handleUpload = async (event: FileUploadFilesEvent, rowData: any) => {
        const file = event.files[0]
        const formData = new FormData()
        formData.append('file', file)
        await axios.post('http://localhost:3001/api/files/upload', formData)
            .then(response => {
                console.log(response.data.path)
                let _actividad = { ...rowData, RutaRecursoGuia: response.data.filename }
                toast.current?.show({ severity: 'success', summary: 'Success', detail: 'File Uploaded' });
                modificarActividad(_actividad)
                setActividad(emptyActividad)
            })
            .catch(error => {
                console.error(error)
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error de petición' });
            })

    }

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        let _actividad = { ...actividad, Titulo: val };

        setActividad(_actividad);
    };

    const onCalendarChange = (value: any, name: string) => {
        let fecha = value
        switch (name) {
            case 'apertura':
                setActividad({ ...actividad, FechaApertura: fecha })
                break;
            case 'cierre':
                setActividad({ ...actividad, FechaCierre: fecha })
                break;
        }
    }

    const formatDate = (value: Date) => {
        return value.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="New" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                </div>
            </React.Fragment>
        );
    };

    const fileBodyTemplate = (rowData: any) => {
        return (
            <>
                <FileUpload
                    chooseOptions={{ icon: 'pi pi-upload', iconOnly: true, className: 'p-2' }}
                    mode="basic"
                    accept=".pdf"
                    maxFileSize={5000000}
                    customUpload
                    uploadHandler={(e) => handleUpload(e, rowData)}
                />
            </>
        );
    };

    const aperturaBodyTemplate = (rowData: any) => {
        return <span>{formatDate(new Date(rowData.FechaApertura))}</span>
    }

    const cierreBodyTemplate = (rowData: any) => {
        return <span>{formatDate(new Date(rowData.FechaCierre))}</span>
    }

    const actionBodyTemplate = (rowData: any) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editActividad(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteActividad(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Actividades de la sesión</h5>
            {/* <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
            </span> */}
        </div>
    );

    const productDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveActividad} />
        </>
    );
    const deleteProductDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteProductDialog} />
            <Button label="Yes" icon="pi pi-check" text onClick={deleteActividad} />
        </>
    );

    const itemTemplate = (actividad: any) => {
        return (
            <div className="col-12">
                <div className="flex flex-column xl:flex-row xl:align-items-start p-4 gap-4">
                    <img className="w-6 sm:w-16rem xl:w-8rem block xl:block mx-auto border-round" src="/images/pdf.png" alt='Archivo guía' />
                    <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
                        <div className="flex flex-column align-items-center sm:align-items-start gap-3">
                            <div className="text-2xl font-bold text-900">{actividad.Titulo}</div>
                            <div className="flex align-items-center gap-3">
                                <span className="flex align-items-center gap-2">
                                    <i className="pi pi-clock mr-2"></i>
                                    <span className="font-semibold"><strong>Apertura: </strong>{formatDate(new Date(actividad.FechaApertura))}</span>
                                    <span className="font-semibold"><strong>Cierre: </strong>{formatDate(new Date(actividad.FechaCierre))}</span>
                                </span>
                            </div>
                            <FileUpload
                                chooseOptions={{ icon: 'pi pi-upload', className: 'p-2' }}
                                chooseLabel='Subir archivo guía'
                                mode="basic"
                                accept=".pdf"
                                maxFileSize={5000000}
                                customUpload
                                uploadHandler={(e) => handleUpload(e, actividad)}
                            />
                        </div>
                        <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
                            <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editActividad(actividad)} />
                            <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteActividad(actividad)} />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (

        <div className="card">
            <Toast ref={toast} />
            <Toolbar className="mb-4" start={leftToolbarTemplate}></Toolbar>

            <DataView value={actividades} itemTemplate={itemTemplate} />

            <Dialog visible={actividadDialog} style={{ width: '450px' }} header="Detalles de la tarea" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="name">Título</label>
                    <InputText
                        id="name"
                        value={actividad.Titulo}
                        onChange={(e) => onInputChange(e, 'titulo')}
                        required
                        autoFocus
                        maxLength={100}
                        className={classNames({
                            'p-invalid': submitted && !actividad.Titulo
                        })}
                    />
                    {submitted && !actividad.Titulo && <small className="p-invalid">Name is required.</small>}
                </div>
                <div className="field">
                    <label htmlFor="fecha-apertura">Fecha de apertura</label>
                    <Calendar id="fecha-apertura" value={new Date(actividad.FechaApertura)} onChange={(e) => { onCalendarChange(e.value, 'apertura') }} showTime hourFormat="12" />
                </div>
                <div className="field">
                    <label htmlFor="fecha-cierre">Fecha de cierre</label>
                    <Calendar id="fecha-cierre" value={new Date(actividad.FechaCierre)} onChange={(e) => { onCalendarChange(e.value, 'cierre') }} showTime hourFormat="12" />
                </div>
            </Dialog>

            <Dialog visible={deleteActividadDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {actividad && (
                        <span>
                            ¿Seguro de que desea eliminar <b>{actividad.Titulo}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
};

