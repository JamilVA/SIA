'use client';
import React, { use, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { useSession } from "next-auth/react";
import axios from 'axios';
import Link from 'next/link';
import { Dialog } from 'primereact/dialog';
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
    //const [docente, setDocente] = useState(docenteVacio);
    const [visible, setVisible] = useState(false);
    const [imagenURL, setImagenURL] = useState<string>('');
    const [pdfMatriculadosURL, setPdfMatriculadosURL] = useState('')

    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);

    useEffect(() => {
        fetchCursos();
    }, [status]);

    const fetchCursos = async () => {
        await axios
            .get('http://127.0.0.1:3001/api/curso/cursosdp', {
                params: {
                    CodDocente: 1 // session?.user.codigoPersona
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

    const obtenerPDFMatriculados = async (codigoCurso: string) => {
        await axios.get('http://localhost:3001/api/pdf/lista-matriculados', {
            params: { codigoCurso: codigoCurso },
            responseType: 'blob'
        })
            .then(response => {
                console.log(response);
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                console.log(url);
                setPdfMatriculadosURL(url);
                setVisible(true)
                //URL.revokeObjectURL(url);
            })
            .catch(error => {
                //console.error(error.response);           
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error en la descarga',
                    detail: error.response ? "Error al generar el pdf" : error.message,
                    life: 3000
                })
            })
    }

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
                <Button label='PDF Matriculados' icon="pi pi-file-pdf" rounded text className='p-1' onClick={() => obtenerPDFMatriculados(rowData.CodCursoCal)}></Button>
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
                    <DataTable ref={dt} value={cursos} dataKey="CodCurso" className="datatable-responsive" emptyMessage="No courses found.">
                        <Column field="CodCurso" header="COD" />
                        <Column field="Nombre" header="Curso" headerStyle={{ minWidth: '16rem' }} />
                        <Column field="Carrera" header="Carrera" headerStyle={{ minWidth: '16rem' }} />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '8rem' }}></Column>
                    </DataTable>

                </div>
            </div>
            <Dialog header="Vista PDF de estudiantes matriculados" visible={visible} style={{ width: '80vw', height: '90vh' }} onHide={() => setVisible(false)}>
                <iframe src={pdfMatriculadosURL} width="100%" height="99%"></iframe>
                {/* <embed src={pdfMatriculadosURL} type="application/pdf" width="100%" height="99%"/> */}
            </Dialog>
        </div>
    );
};

export default Page;
