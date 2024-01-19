'use client';
import React, { use, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import Link from 'next/link';

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

    const [cursos, setCursos] = useState<(typeof cursoVacio)[]>([]);
    const [cursosCalificacion, setCursosCalificaion] = useState<(typeof cursoCVacio)[]>([]);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    const usuario = {
        Codigo: 11
    };

    useEffect(() => {
        fetchCursos(usuario.Codigo);
    }, []);

    const fetchCursos = async (CodigoEstudiante: number) => {
        try {
            const { data } = await axios.get('http://localhost:3001/api/curso-calificacion/cursos-estudiante', {
                params: { CodigoEstudiante: CodigoEstudiante }
            });
            const {cursosCalificacion} = data;

            setCursosCalificaion(cursosCalificacion);
            setCursos(cursosCalificacion.Curso);

            console.log(data);
        } catch (error) {
            console.error(error);
        }
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <>
                <Link href={`/estudiante/clases/detalles-curso?codigoS=${rowData.Codigo}&codigoE=${usuario.Codigo}`}>
                    <Button icon="" rounded severity="success" tooltip="" className="mr-2">
                        Ver
                    </Button>
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
                <div className="card">
                    <DataTable ref={dt} value={cursosCalificacion} dataKey="CodCurso" className="datatable-responsive" emptyMessage="No courses found." responsiveLayout="scroll">
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
