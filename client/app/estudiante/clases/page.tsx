'use client';
import { axiosInstance as axios } from '../../../utils/axios.instance';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useEffect, useRef, useState } from 'react';
import Perfil from "../../../components/Perfil";
import { ProgressSpinner } from 'primereact/progressspinner';
import { redirect } from 'next/navigation';

export default function Page () {
    const cursoCVacio = {
        Codigo: '',
        RutaSyllabus: '',
        RutaNormas: '',
        RutaPresentacionCurso: '',
        RutaPresentacionDocente: '',
        Capacidad: '',
        Competencia: '',
        CodigoCurso: ''
    };

    const { data: session, status } = useSession();

    const [cursosCalificacion, setCursosCalificaion] = useState<(typeof cursoCVacio)[]>([]);
    const dt = useRef<DataTable<any>>(null);

    useEffect(() => {
        if (status === "authenticated") fetchCursos();
    }, [status]);

    const fetchCursos = async () => {
        try {
            const { data } = await axios.get('/curso-calificacion/cursos-estudiante', {
                params: { CodigoEstudiante: session?.user.codigoEstudiante },
                headers: {
                    Authorization: 'Bearer ' + session?.user.token
                }
            });
            const { cursosCalificacion } = data;

            setCursosCalificaion(cursosCalificacion);

            // console.log(data);
        } catch (error) {
            // console.error(error);
        }
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <>
                <Link href={{
                    pathname: '/estudiante/clases/detalles-curso',
                    query: {
                        codigoS: rowData.Codigo,
                    }
                }}>
                    <Button style={{ height: '25px' }} rounded severity="success" tooltip="" className="mr-2">
                        Ver
                    </Button>
                </Link>
            </>
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

    if (session?.user.nivelUsuario != 4) {
        redirect('/pages/notfound')
    }

    return (
        <div className="grid">
            <div className='col-12'>
                <h5 className='m-3 mt-4'>SESIONES DE CLASE</h5>
            </div>
            <div className="col-12 md:col-3">
                <Perfil></Perfil>
            </div>
            <div className="col-12 md:col-9">
                <div className="card">
                    <DataTable ref={dt} value={cursosCalificacion} dataKey="Codigo" className="datatable-responsive" emptyMessage="No hay cursos matriculados en el presente ciclo">
                        <Column field="Curso.Codigo" header="Codigo" />
                        <Column field="Curso.Nombre" header="Curso" />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                    </DataTable>
                </div>
            </div>
        </div>
    );
};



