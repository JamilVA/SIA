'use client';
import React, { use, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { useSession } from "next-auth/react";
import axios from 'axios';
import Link from 'next/link';
import Perfil from "../../templates/Perfil";

const Page = () => {
    const EmptyCurso = {
        CodCurso: '',
        CodCursoCal: '',
        Nombre: '',
        Carrera: ''
    };

    const { data: session, status } = useSession();
    const [cursos, setCursos] = useState([EmptyCurso]);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    useEffect(() => {
        fetchCursos();
    }, [status]);

    const fetchCursos = async () => {
        await axios
            .get('http://127.0.0.1:3001/api/curso/cursosdp', {
                params: {
                    CodDocente: session?.user.codigoPersona
                }
            })
            .then((response) => {
                console.log(response.data);
                setCursos(response.data.cursos);
            })
            .catch((error) => {
                console.log('Error en carga de pagos: ', error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error en la carga de datos',
                    life: 3000
                });
            });
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <>
                {/* <Button rounded severity="warning" className="mr-2 py-1">Ver</Button> */}
                <Link href={`/docente/cursos/gestion-curso?codigo=${rowData.CodCursoCal}`}>
                    <Button icon="" rounded severity="success" tooltip="" className="mr-2">Ver</Button>
                </Link>

                <Link href={`/docente/cursos/calificaciones?codigo=${rowData.CodCursoCal}`}>
                    <Button icon="" rounded severity="info" tooltip="" className="mr-2">Calificar</Button>
                </Link>
            </>
        );
    };

    return (
        <div className="grid">
            <div className="col-12">
                <h5 className="m-1 mb-3">CURSOS ACTIVOS</h5>
            </div>
            <div className="col-12 md:col-3">
                <Perfil></Perfil>
            </div>
            <div className="col-12 md:col-9">
                <div className="card">
                    <DataTable ref={dt} value={cursos} dataKey="CodCurso" className="datatable-responsive" emptyMessage={status != 'authenticated' ? 'Cargando...' : 'No se encontraron registros'} responsiveLayout="scroll">
                        <Column field="CodCurso" header="COD" />
                        <Column field="Nombre" header="Curso" />
                        <Column field="Carrera" header="Carrera" />
                        <Column body={status != 'authenticated' ? '' : actionBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                    </DataTable>
                </div>
            </div>
        </div>
    );
};

export default Page;
