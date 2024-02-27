'use client';
import React, { use, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import Perfil from "../../templates/Perfil"
import Link from 'next/link';

import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

const Page = () => {
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

    const cursoVacio = {
        Codigo: '',
        Nombre: '',
        HorasTeoria: 0,
        HorasPractica: 0,
        Creditos: 0,
        Nivel: 0,
        Semestre: 0
    };

    const { data: session, status } = useSession();
    const [cursos, setCursos] = useState<(typeof cursoVacio)[]>([]);
    const [cursosCalificacion, setCursosCalificaion] = useState<(typeof cursoCVacio)[]>([]);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const router = useRouter();

    useEffect(() => {
        fetchCursos();
    }, [status]);

    const fetchCursos = async () => {
        try {
            const { data } = await axios.get('http://localhost:3001/api/curso-calificacion/cursos-estudiante', {
                params: { CodigoEstudiante: session?.user.codigoPersona }
            });
            const { cursosCalificacion } = data;

            setCursosCalificaion(cursosCalificacion);
            setCursos(cursosCalificacion.Curso);

            console.log(data);
        } catch (error) {
            console.error(error);
        }
    };

    const detallesCurso = (rowData: any) => {
        const codigoS = rowData.Codigo;
        const codigoE = session?.user.codigoPersona;

        // router.push({
        //     pathname: '/estudiante/clases/detalles-curso',
        //     query: {
        //         codigoS,
        //         codigoE
        //     }
        // });
        router.push(`/estudiante/clases/detalles-curso?${codigoS}&${codigoE}`)
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <>
                {/* <Link href={`/estudiante/clases/detalles-curso?codigoS=${rowData.Codigo}&codigoE=${session?.user.codigoPersona}`}>
                    <Button icon="" rounded severity="success" tooltip="" className="mr-2">
                        Ver
                    </Button>
                </Link> */}
                <Link href={{
                    pathname:'/estudiante/clases/detalles-curso',
                    query: {
                        codigoS:rowData.Codigo,
                        codigoE:11,
                    }
                }}>
                    <Button icon="" rounded severity="success" tooltip="" className="mr-2">
                        Ver
                    </Button>
                </Link> 
                {/* <Button onClick={()=>{detallesCurso(rowData)}} icon="" rounded severity="success" tooltip="" className="mr-2">
                    Ver
                </Button> */}
            </>
        );
    };

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
                    <DataTable ref={dt} value={cursosCalificacion} dataKey="Codigo" className="datatable-responsive" emptyMessage="No courses found." responsiveLayout="scroll">
                        <Column field="Curso.Codigo" header="Codigo" />
                        <Column field="Curso.Nombre" header="Curso" />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                    </DataTable>
                </div>
            </div>
        </div>
    );
};

export default Page;
