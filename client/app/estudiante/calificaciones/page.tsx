'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { axiosInstance as axios } from '../../../utils/axios.instance';
import { Column } from 'primereact/column';
import Perfil from "../../../components/Perfil";
import { useSession } from "next-auth/react";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { redirect } from 'next/navigation';
import { InputText } from 'primereact/inputtext';

export default function Page() {

    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [actas, setActas] = useState(Object);
    const { data: session, status } = useSession();

    const [pdfHistorialURL, setPdfHistorialURL] = useState('')
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false)

    const [globalFilter, setGlobalFilter] = useState('');

    useEffect(() => {
        if (status === "authenticated") fetchActas();
    }, [status]);

    const fetchActas = async () => {
        setLoading(true)
        await axios.get('/acta/estudiante', {
            params: {
                CodigoEstudiante: session?.user.codigoEstudiante,
            },
            headers: {
                Authorization: 'Bearer ' + session?.user.token
            }
        }).then(response => {
            setActas(response.data.historial);
            //console.log(response.data);

        }).catch(error => {
            // console.log("Error en carga de datos: ", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error en la carga de datos',
                life: 3000
            });
        })
        setLoading(false)
    }

    const obtenerPDFHistorial = async () => {
        setVisible(true)
        await axios.get('/pdf/historial-notas', {
            params: { codigoEstudiante: session?.user.codigoEstudiante },
            responseType: 'blob'
        })
            .then(response => {
                // console.log(response);
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                // console.log(url);
                setPdfHistorialURL(url);

                //URL.revokeObjectURL(url);
            })
            .catch(error => {
                //// console.error(error.response);           
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error en la descarga',
                    detail: error.response ? "Error al generar el pdf" : error.message,
                    life: 3000
                })
            })
    }

    const actionNFTemplate = (rowData: any) => {
        return <p style={Number(rowData.Nota) >= 11 ? { color: 'blue' } : { color: 'red' }}> {rowData.Nota} </p>
    }

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <Button className='px-2 py-1 border-none mb-2'
                    size='small'
                    label="Vista PDF"
                    icon="pi pi-file-pdf"
                    onClick={() => obtenerPDFHistorial()}
                />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type='search' value={globalFilter} onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar..." />
                </span>
            </div>
        );
    };

    const cicloTemplate = (rowData: any) => {
        return (rowData.Nivel - 1) * 2 + rowData.Semestre;
    }

    const header = renderHeader();

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
    } else if (session?.user.nivelUsuario != 4) {
        redirect('/pages/notfound')
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

                    <DataTable
                        ref={dt}
                        header={header}
                        value={actas}
                        dataKey="CodigoMat"
                        className="datatable-responsive"
                        emptyMessage='Historial vacío'
                        loading={loading}
                        globalFilter={globalFilter}
                    >
                        <Column field="Codigo" header="Codigo" />
                        <Column field="Curso" header="Nombre" />
                        <Column field="Nota" header="Nota" body={actionNFTemplate} />
                        <Column body={cicloTemplate} header="Ciclo" />
                        <Column field="Creditos" header="Creditos" />
                        <Column field="Acta" header="Acta" />
                        <Column field="Fecha" header="Fecha" />
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

