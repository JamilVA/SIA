'use client';
import axios from 'axios';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useEffect, useRef, useState } from 'react';
import Perfil from "../../templates/Perfil";

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

    const { data: session, status } = useSession();
    
    const [cursosCalificacion, setCursosCalificaion] = useState<(typeof cursoCVacio)[]>([]);
    const dt = useRef<DataTable<any>>(null);

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

            console.log(data);
        } catch (error) {
            console.error(error);
        }
    };  

    const actionBodyTemplate = (rowData: any) => {
        return (
            <>               
                <Link href={{
                    pathname:'/estudiante/clases/detalles-curso',
                    query: {
                        codigoS:rowData.Codigo,
                        codigoE:session?.user.codigoPersona,
                    }
                }}>
                    <Button icon="" rounded severity="success" tooltip="" className="mr-2">
                        Ver
                    </Button>
                </Link>                
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
