'use client';
import React, { use, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Image } from 'primereact/image';
import axios from 'axios';
import Link from 'next/link';
const Page = () => {
    const EmptyCurso = {
        CodCurso: '',
        CodCursoCal: '',
        Nombre: '',
        Carrera: ''
    };

    const docenteVacio = {
        Codigo: 1,
        Persona:{
            Paterno:'',
            Materno:'',
            Nombres:'',
            Email:'',
            RutaFoto:'',
            DNI:''
        }
    }



    const [cursos, setCursos] = useState([EmptyCurso]);
    const [docente, setDocente] = useState(docenteVacio);

    const [imagenURL, setImagenURL] = useState<string>('');

    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    const d = {
        CodDocente: 1
    };

    useEffect(() => {
        fetchDocente(d.CodDocente);
        fetchCursos(d);
    }, []);

    const fetchCursos = async (data: object) => {
        await axios
            .post('http://127.0.0.1:3001/api/curso/cursosdp', data)
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

    const fetchDocente = async (CodigoDocente: number) => {
        await axios
            .get('http://127.0.0.1:3001/api/docente/perfil', {
                params:{
                    CodigoDocente
                }
            })
            .then((response) => {
                console.log(response.data.docente.Persona);
                setDocente(response.data.docente)
                obtenerArchivo(response.data.docente.Persona.RutaFoto)
            })
            .catch((error) => {
                console.log('Error en carga del perfil: ', error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error en la carga del perfil docente',
                    life: 3000
                });
            });
    };

    const obtenerArchivo = async (ruta: string) => {
        if(ruta === ''){
            console.error('Ruta recibida:',ruta)
            return
        }
        try {
            const response = await axios.get('http://localhost:3001/api/files/download', {
                params: { fileName: ruta },
                responseType: 'arraybuffer',  // Especificar el tipo de respuesta como 'arraybuffer'
            });

            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);

            setImagenURL(url);
        } catch (error) {
            console.error('Error al obtener el archivo:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error de carga de archivo',
                life: 3000,
            });
        }
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <>
                {/* <Button rounded severity="warning" className="mr-2 py-1">Ver</Button> */}
                <Link href={`/docente/cursos/gestion-curso?codigo=${rowData.CodCursoCal}`}>
                    <Button icon="" rounded severity="success" tooltip="" className="mr-2">Ver</Button>
                </Link>

                <Link href={`/docente/cursos/calificaciones?codigo=${rowData.CodCurso}`}>
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
                <div className="card shadow-1">
                    <div className="text-center">
                        <img style={{ borderRadius: 'var(--border-radius)' }} alt="Card" className="md:w-5 w-5 mt-1 shadow-1" src={imagenURL} />
                        {/* <Image src={imagenURL} zoomSrc={imagenURL} alt="Foto Docente" width="80" height="80" preview/> */}

                        <h5 style={{ color: 'var(--surface-700)' }}>{docente.Persona.Nombres + ' ' + docente.Persona.Paterno + ' ' + docente.Persona.Materno}</h5>
                    </div>
                    <div className="mt-4">
                        <p>
                            <b>Email: </b>{' ' + docente.Persona.Email}
                        </p>
                        <p>
                            <b>DNI: </b>{docente.Persona.DNI}
                        </p>
                    </div>
                </div>
            </div>
            <div className="col-12 md:col-9">
                <div className="card">
                    <DataTable ref={dt} value={cursos} dataKey="CodCurso" className="datatable-responsive" emptyMessage="No courses found." responsiveLayout="scroll">
                        <Column field="CodCurso" header="COD" />
                        <Column field="Nombre" header="Curso" />
                        <Column field="Carrera" header="Carrera" />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                    </DataTable>
                </div>
            </div>
        </div>
    );
};

export default Page;
