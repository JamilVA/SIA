/* eslint-disable @next/next/no-img-element */
'use client';
import { axiosInstance as axios } from '../../../../utils/axios.instance';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DataView } from 'primereact/dataview';
import { FileUpload, FileUploadFilesEvent } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { Calendar } from 'primereact/calendar';
import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ProgressSpinner } from 'primereact/progressspinner';

/* @todo Used 'as any' for types here. Will fix in next version due to onSelectionChange event type issue. */
export default function ActividadesPage() {

    const searchParams = useSearchParams();
    const codigoSesion = searchParams.get('codigo');

    let emptyActividad = {
        Codigo: 0,
        Titulo: '',
        RutaRecursoGuia: null,
        FechaApertura: new Date().toISOString(),
        FechaCierre: new Date().toISOString(),
        CodigoSesion: codigoSesion
    };

    const [actividades, setActividades] = useState<Array<any>>([]);
    const [actividadDialog, setActividadDialog] = useState(false);
    const [deleteActividadDialog, setDeleteActividadDialog] = useState(false);
    const [actividad, setActividad] = useState(emptyActividad);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false)
    const [modificar, setModificar] = useState(false)
    const toast = useRef<Toast>(null);
    const { data: session, status } = useSession();

    const fetchActividades = async () => {
        setLoading(true)
        await axios.get('/actividad', {
            params: { codigoSesion: codigoSesion },
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        })
            .then(response => {
                setActividades(response.data.actividades)
            })
            .catch(error => {
                // console.error(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message,
                    life: 3000
                });
            })
        setLoading(false)
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
        await axios.post('/actividad', actividad, {
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        })
            .then(response => {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: response.data.message,
                    life: 3000
                });
                fetchActividades()
            })
            .catch(error => {
                // console.error(error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message,
                    life: 3000
                });
            })
    }

    const modificarActividad = async (actividad: any) => {
        await axios.put('/actividad', actividad, {
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        })
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
                // console.error(error)
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
        await axios.delete('/actividad', {
            params: { codigo: actividad.Codigo },
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
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
        await axios.post('/files/upload', formData)
            .then(response => {
                // console.log(response.data.path)
                let _actividad = { ...rowData, RutaRecursoGuia: response.data.filename }
                toast.current?.show({ severity: 'success', summary: 'Success', detail: 'File Uploaded' });
                modificarActividad(_actividad)
                setActividad(emptyActividad)
            })
            .catch(error => {
                // console.error(error)
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error de petición' });
            })

    }

    const descargarArchivo = async (ruta: string) => {
        await axios.get('/files/download', {
            params: { fileName: ruta },
            responseType: 'arraybuffer'
        })
            .then(response => {
                //// console.log(response); 
                const file = new File([response.data], ruta);
                const url = URL.createObjectURL(file);
                const link = document.createElement('a');
                link.href = url;
                link.download = file.name;
                link.click();
                URL.revokeObjectURL(url);
            })
            .catch(error => {
                //// console.error(error.response);           
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error en la descarga',
                    detail: error.response ? "El archivo no existe" : error.message,
                    life: 3000
                })
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

    const productDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" text onClick={saveActividad} />
        </>
    );

    const deleteProductDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteProductDialog} />
            <Button label="Si" icon="pi pi-check" text onClick={deleteActividad} />
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
                            <div className='flex flex-row align-items-end'>
                                <div className='mr-2'>
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
                                <div>
                                    {actividad.RutaRecursoGuia && <Button className='p-1 border-none'
                                        size='small'
                                        style={{ backgroundColor: 'green' }}
                                        label="Mi archivo registrado"
                                        icon="pi pi-download"
                                        onClick={() => descargarArchivo(actividad.RutaRecursoGuia)}
                                    />}
                                </div>
                            </div>
                        </div>
                        <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
                            <Button icon="pi pi-pencil" rounded severity="success" onClick={() => editActividad(actividad)} />
                            <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteActividad(actividad)} />
                            <Link href={`/docente/cursos/actividades/calificar?codigoActividad=${actividad.Codigo}`}>
                                <Button className='px-2 py-1' rounded severity="info" tooltip="">Calificar</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (status === "loading") {
        return (
            <>
                <div className='flex items-center justify-center align-content-center' style={{ marginTop: '20%' }}>
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                </div>
            </>
        )
    }

    if (!session) {
        redirect('/')
    } else if (session?.user.codigoDocente == 0) {
        redirect('/pages/notfound')
    }

    return (
        <div className="card">
            <Toast ref={toast} />
            <Toolbar className="mb-4" start={leftToolbarTemplate}></Toolbar>

            <DataView loading={loading} value={actividades} itemTemplate={itemTemplate} />

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
                    <Calendar id="fecha-apertura" value={new Date(actividad.FechaApertura)} onChange={(e) => { onCalendarChange(e.value, 'apertura') }} showTime dateFormat='dd/mm/yy' hourFormat="12" />
                </div>
                <div className="field">
                    <label htmlFor="fecha-cierre">Fecha de cierre</label>
                    <Calendar id="fecha-cierre" value={new Date(actividad.FechaCierre)} onChange={(e) => { onCalendarChange(e.value, 'cierre') }} showTime dateFormat='dd/mm/yy' hourFormat="12" />
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

