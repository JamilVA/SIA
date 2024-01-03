'use client'
import React, { use, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import axios from 'axios';

const Page = () => {

    const EmptyCurso = {
        CodCurso: '',
        CodCursoCal: '',
        Nombre: '',
        Carrera: ''
    }

    const [cursos, setCursos] = useState([EmptyCurso]);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    const d = {
        CodDocente: 2
    }

    useEffect(() => {
        fetchCursos(d);
    }, []);

    const fetchCursos = async (data: object) => {
        await axios.post("http://127.0.0.1:3001/api/curso/cursosdp", data).then(response => {
            console.log(response.data);
            setCursos(response.data.cursos)
            
        })
            .catch(error => {
                console.log("Error en carga de pagos: ", error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error en la carga de datos',
                    life: 3000
                });
            })
    }

    const actionBodyTemplate = (rowData: any) => {
        return (
            <>
                <Button rounded severity="warning" className="mr-2 py-1">Ver</Button>
                <Button rounded severity="success" className="mr-2 py-1">Calificar</Button>
            </>
        );
    };

    return (
        <div className="grid">
            <div className="col-12">
                <h5 className='m-1 mb-3'>CURSOS ACTIVOS</h5>
            </div>
            <div className="col-12 md:col-3">
                <div className='card shadow-1'>
                    <div className='text-center'>
                        <img style={{ borderRadius: 'var(--border-radius)' }} alt="Card" className='md:w-5 w-5 mt-1 shadow-1' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQION7iLAgrmjNpsU01XdpcD7fU-ZnfaLfEWestMmrvQQ&s" />
                        <h5 style={{ color: 'var(--surface-700)' }}>MALPICA RODRIGUEZ MANUEL ENRIQUE</h5>
                    </div>
                    <div className='mt-4'>
                        <p><b>Email: </b>mmalpica@gmail.com</p>
                        <p><b>DNI: </b>40936598</p>
                    </div>
                </div>
            </div>
            <div className='col-12 md:col-9'>
                <div className='card'>
                    <DataTable
                        ref={dt}
                        value={cursos}
                        dataKey="CodCurso"
                        className="datatable-responsive"
                        emptyMessage="No courses found."
                        responsiveLayout="scroll"
                    >
                        <Column field="CodCurso" header="COD" />
                        <Column field="Nombre" header="Curso"/>
                        <Column field="Carrera" header="Carrera"/>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                    </DataTable>
                </div>
            </div>
        </div>
    )
}

export default Page;    
