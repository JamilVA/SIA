'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import axios from 'axios';
import { Column } from 'primereact/column';

const Page = () => {

    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [actas, setActas] = useState(Object);

    useEffect(() => {
        fetchActas();
    }, []);

    const fetchActas = async () => {
        await axios.get('http://127.0.0.1:3001/api/acta/estudiante', {
            params: {
                CodigoEstudiante: 19,
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

    const actionNFTemplate = (rowData: any) => {
        return <p style={Number(rowData.NotaFinal) >= 11 ? { color: 'blue' } : { color: 'red' }}> {rowData.NotaFinal} </p>
    }

    return (
        <div className="grid">
            <div className="col-12">
                <h5 className='m-1 mb-3'>HISTORIAL DE NOTAS</h5>
            </div>
            <div className="col-12 md:col-3">
                <div className='card shadow-1'>
                    <div className='text-center'>
                        <img style={{ borderRadius: 'var(--border-radius)' }} alt="Card" className='md:w-5 w-5 mt-1 shadow-1' src="http://academicoplus.unc.edu.pe/Estudiante/ObtenerFotoEstudiante?codigo=18110054&genero=1" />
                        <h5 style={{ color: 'var(--surface-700)' }}>VILLANUEVA VARGAS JHAN CARLOS</h5>
                        <h6 className='mt-0' style={{ color: 'var(--surface-500)' }}>ARTES VISUALES</h6>
                    </div>
                    <div className='mt-4'>
                        <p><b>Codigo: </b>AV73414616</p>
                        <p><b>Email: </b>jhanvillanueva@gmail.com</p>
                        <p><b>DNI: </b>73414616</p>
                    </div>
                </div>
            </div>
            <div className='col-12 md:col-9'>
                <div className='card'>
                    <DataTable
                        ref={dt}
                        value={actas}
                        dataKey="Codigo"
                        className="datatable-responsive"
                        emptyMessage="Sin estudiantes."
                        responsiveLayout="scroll"
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
            </div>
        </div>
    )
}

export default Page;    