'use client'
import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';
import { Toast } from 'primereact/toast';

const page = () => {

    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [horarios, setHorarios] = useState([]);

    useEffect(() => {
        fetchHorarios();
    }, []);

    const fetchHorarios = async () => {
        await axios.get("http://127.0.0.1:3001/api/horario/docente", {
            params: {
                CodDocente: 1
            }
        }).then(response => {
            console.log(response.data);
            setHorarios(response.data.horario);

        }).catch(error => {
            console.log("Error en carga de horarios: ", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error en la carga de datos',
                life: 3000
            });
        })
    }

    const actionHoraTemplate = (rowData: any) => {
        let horaIni = rowData.HoraInicio.substring(0, 5);
        let horaFin = rowData.HoraFin.substring(0, 5);
        return (
            <>
                {horaIni} - {horaFin}
            </>
        )
    }

    return (
        <div className='grid'>
            <div className='col-12'>
                <h5 className='m-1 mt-4'>HORARIOS - CICLO</h5>
            </div>
            <div className="col-12 md:col-3">
                <div className="card shadow-1">
                    <div className="text-center">
                        <img style={{ borderRadius: 'var(--border-radius)' }} alt="Card" className="md:w-5 w-5 mt-1 shadow-1" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQION7iLAgrmjNpsU01XdpcD7fU-ZnfaLfEWestMmrvQQ&s" />
                        <h5 style={{ color: 'var(--surface-700)' }}>MALPICA RODRIGUEZ MANUEL ENRIQUE</h5>
                    </div>
                    <div className="mt-4">
                        <p>
                            <b>Email: </b>mmalpica@gmail.com
                        </p>
                        <p>
                            <b>DNI: </b>40936598
                        </p>
                    </div>
                </div>
            </div>
            <div className="col-12 md:col-9">
                <div className='card'>
                    <Toast ref={toast} />
                    <DataTable
                        ref={dt}
                        value={horarios}
                        dataKey="CodigoHorario"
                        className="datatable-responsive"
                        emptyMessage="No se encontraron registros"
                        responsiveLayout="scroll"
                    >
                        <Column header="Codigo" field="CodigoCurso" />
                        <Column header="Curso" field="Nombre" sortable />
                        <Column header="Día" field="Dia" sortable />
                        <Column header="Hora" body={actionHoraTemplate} />
                        <Column header="N° Aula" field="NumeroAula" />
                        <Column header="Aula" field="NombreAula" />
                    </DataTable>
                </div>
            </div>
        </div>
    );
}

export default page