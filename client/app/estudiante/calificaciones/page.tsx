'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import axios from 'axios';
import { Column } from 'primereact/column';
import Perfil from "../../templates/Perfil";
import { useSession } from "next-auth/react";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

const Page = () => {

    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [actas, setActas] = useState(Object);
    const { data: session, status } = useSession();

    const [pdfHistorialURL, setPdfHistorialURL] = useState('')
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        fetchActas();
    }, [status]);

    const fetchActas = async () => {
        await axios.get('http://127.0.0.1:3001/api/acta/estudiante', {
            params: {
                CodigoEstudiante: session?.user.codigoPersona,
            }
        }).then(response => {
            setActas(response.data.actas);
            console.log(response.data);

        }).catch(error => {
            console.log("Error en carga de datos: ", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error en la carga de datos',
                life: 3000
            });
        })
    }

    const obtenerPDFHistorial = async () => {
        await axios.get('http://localhost:3001/api/pdf/historial-notas', {
            params: { codigoEstudiante: session?.user.codigoPersona },
            responseType: 'blob'
        })
            .then(response => {
                console.log(response);
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                console.log(url);
                setPdfHistorialURL(url);
                setVisible(true)
                //URL.revokeObjectURL(url);
            })
            .catch(error => {
                //console.error(error.response);           
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error en la descarga',
                    detail: error.response ? "Error al generar el pdf" : error.message,
                    life: 3000
                })
            })
    }

    const actionNFTemplate = (rowData: any) => {
        return <p style={Number(rowData.NotaFinal) >= 11 ? { color: 'blue' } : { color: 'red' }}> {rowData.NotaFinal} </p>
    }

    return (
        <div className="grid">
            <div className="col-12">
                <h5 className='m-3 mt-4'>HISTORIAL DE NOTAS</h5>
            </div>
            <div className="col-12 md:col-3">
                <Perfil></Perfil>
            </div>
            <div className='col-12 md:col-9'>
                <div className='card'>
                    <Button className='px-2 py-1 border-none mb-2'
                        size='small'
                        label="Vista PDF"
                        icon="pi pi-file-pdf"
                        onClick={() => obtenerPDFHistorial()}
                    />
                    <DataTable
                        ref={dt}
                        value={actas}
                        dataKey="Codigo"
                        className="datatable-responsive"
                        emptyMessage={status != 'authenticated' ? 'Cargando...' : 'Sin datos'}
                    >
                        <Column field="Codigo" header="Codigo" />
                        <Column field="Nombre" header="Nombre" />
                        <Column field="NotaFinal" header="Nota" body={actionNFTemplate} />
                        <Column field="Nivel" header="Nivel" />
                        <Column field="Semestre" header="Semestre" />
                        <Column field="Creditos" header="Creditos" />
                        <Column field="CodActa" header="Acta" />
                        <Column field="FechaGeneracion" header="Fecha" />
                    </DataTable>
                </div>
                <Dialog header="Vista PDF de historial de notas" visible={visible} style={{ width: '80vw', height: '90vh' }} onHide={() => setVisible(false)}>
                    <iframe src={pdfHistorialURL} width="100%" height="99%"></iframe>
                    {/* <embed src={pdfMatriculadosURL} type="application/pdf" width="100%" height="99%"/> */}
                </Dialog>
            </div>
        </div>
    )
}

export default Page;    