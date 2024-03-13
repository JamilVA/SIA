/* eslint-disable @next/next/no-img-element */
'use client';
import { axiosInstance as axios } from '../../../../../utils/axios.instance';
import { useSearchParams } from 'next/navigation';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';

/* @todo Used 'as any' for types here. Will fix in next version due to onSelectionChange event type issue. */
export default function CalificarActividadesPage() {

    const searchParams = useSearchParams()
    const codigoActividad = searchParams.get('codigoActividad')

    let emptyActividad = {
        CodigoActividad: 0,
        CodigoEstudiante: 0,
        Nota: 0,
        Observacion: '',
        RutaTarea: '',
        Estudiante: {
            Codigo: 0,
            Persona: {
                Paterno: '',
                Materno: '',
                Nombres: ''
            }
        }
    };

    const [actividades, setActividades] = useState<Array<any>>([])
    const [calificarDialog, setCalificarDialog] = useState(false);
    const [actividad, setActividad] = useState(emptyActividad);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    const fetchActividades = async () => {
        await axios.get('/sesion/actividades-calificar', {
            params: {
                codigoActividad: codigoActividad
            }
        })
            .then(response => {
                const actividades = response.data.actividades
                //console.log(actividades)
                setActividades(actividades)
            })
            .catch(error => {
                console.error(error.message)
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


    const hideDialog = () => {
        setSubmitted(false);
        setCalificarDialog(false);
    };

    const saveActividad = async () => {
        setSubmitted(true);
        if (!actividad.Nota) {
            return
        }
        setCalificarDialog(false)
        await axios.put('/actividad/calificar', actividad)
            .then(response => {
                let _actividades = actividades.map(value => {
                    if (value.CodigoEstudiante === actividad.CodigoEstudiante) {
                        return { ...value, Nota: actividad.Nota, Observacion: actividad.Observacion }
                    }
                    return value
                })
                toast.current?.show({ severity: 'success', summary: 'Éxisot', detail: response.data.message });
                setActividades(_actividades)
            })
            .catch(error => {
                console.error(error)
                toast.current?.show({ severity: 'error', summary: 'Error', detail: error.message });
            })
        setActividad(emptyActividad)
    };

    const descargarArchivo = async (ruta: string) => {
        await axios.get('/files/download', {
            params: { fileName: ruta },
            responseType: 'arraybuffer' 
        })
            .then(response => {
                //console.log(response); 
                const file = new File([response.data], ruta);        
                const url = URL.createObjectURL(file);
                const link = document.createElement('a');
                link.href = url;
                link.download = file.name;            
                link.click();
                URL.revokeObjectURL(url);
            })
            .catch(error => {
                //console.error(error.response);           
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error en la descarga',
                    detail: error.response ? "El archivo no existe" : error.message,
                    life: 3000
                })
            })
    };

    const editActividad = (actividad: any) => {
        setActividad({ ...actividad });
        setCalificarDialog(true);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        let _actividad = { ...actividad, Observacion: val };

        setActividad(_actividad);
    };

    const onInputNumberChange = (e: InputNumberValueChangeEvent, name: string) => {
        const val = e.value || 0;
        let _actividad = { ...actividad, Nota: val };
        setActividad(_actividad);
    };

    const nameBodyTemplate = (rowData: any) => {
        return (
            <>
                <span className="p-column-title">Name</span>
                {rowData.Estudiante.Persona.Paterno + ' ' + rowData.Estudiante.Persona.Materno + ', ' + rowData.Estudiante.Persona.Nombres}
            </>
        );
    };

    const documentBodyTemplate = (rowData: any) => {
        return (
            <>
                <Button icon="pi pi-download" rounded text label={rowData.RutaTarea} onClick={() => descargarArchivo(rowData.RutaTarea)} />
            </>
        );
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="secondary" tooltip='Calificar' onClick={() => editActividad(rowData)} />
            </>
        );
    };

    const calificarDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveActividad} />
        </>
    );

    return (

        <div className="card">
            <Toast ref={toast} />
            <DataTable
                ref={dt}
                value={actividades}
                dataKey="CodigoEstudiante"
                emptyMessage="No hay actividades registradas"
            >
                <Column field="Estudiante" header="Estudiante" body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                <Column field="Nota" header="Nota" headerStyle={{ minWidth: '4rem' }}></Column>
                <Column field="Observacion" header="Observación" headerStyle={{ minWidth: '15rem' }}></Column>
                <Column field="RutaTarea" header="Archivo" body={documentBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                <Column body={actionBodyTemplate} headerStyle={{ minWidth: '5rem' }}></Column>
            </DataTable>

            <Dialog visible={calificarDialog} position='right' style={{ width: '400px' }} header="Calificar" modal className="p-fluid" footer={calificarDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="nota">Nota</label>
                    <InputNumber id='nota' value={actividad.Nota} onValueChange={(e) => onInputNumberChange(e, 'nota')} />
                    {submitted && !actividad.Nota && <small className="p-invalid">Name is required.</small>}
                </div>
                <div className="field">
                    <label htmlFor="observacion">Observación</label>
                    <InputTextarea id="observacion" value={actividad.Observacion} onChange={(e) => onInputChange(e, 'obs')} required rows={3} cols={20} />
                </div>
            </Dialog>

        </div>

    );
};

