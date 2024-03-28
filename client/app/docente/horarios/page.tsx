'use client'
import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { axiosInstance as axios } from '../../../utils/axios.instance';
import { Toast } from 'primereact/toast';
import Perfil from "../../../components/Perfil";
import { useSession } from "next-auth/react";
import { ProgressSpinner } from 'primereact/progressspinner';
import { redirect } from 'next/navigation';

export default function Page () {

    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [horarios, setHorarios] = useState([]);
    const { data: session, status } = useSession();

    useEffect(() => {
        if(status === "authenticated") fetchHorarios();
    }, [status]);

    const fetchHorarios = async () => {
        await axios.get("/horario/docente", {
            params: {
                CodDocente: session?.user.codigoDocente
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

    if (status === "loading") {
        return (
            <>
                <div className='flex items-center justify-center align-content-center' style={{ marginTop: '20%' }}>
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                </div>
            </>
        )
    }

    if (session?.user.codigoDocente == 0) {
        redirect('/pages/notfound')
    }

    return (
        <div className='grid'>
            <div className='col-12'>
                <h5 className='m-3 mt-4'>HORARIOS - CICLO</h5>
            </div>
            <div className="col-12 md:col-3">
                <Perfil></Perfil>
            </div>
            <div className="col-12 md:col-9">
                <div className='card'>
                    <Toast ref={toast} />
                    <DataTable
                        ref={dt}
                        value={horarios}
                        dataKey="CodigoHorario"
                        className="datatable-responsive"
                        emptyMessage='Horario vacío'
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

