'use client';
import React, { use, useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { redirect, useSearchParams } from 'next/navigation';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { axiosInstance as axios } from '../../../../../utils/axios.instance';
import { Button } from 'primereact/button';
import { Sia } from '../../../../../types/sia';
import { ProgressBar } from 'primereact/progressbar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useSession } from 'next-auth/react';
import { TabPanel, TabView } from 'primereact/tabview';

export default function Page() {
    const emptyCurso = {
        Codigo: '',
        Nombre: '',
        CursoCalificacion: {
            Codigo: '',
            EstadoNotas: false,
            EstadoRecuperacion: false,
            EstadoAplazado: false,
            Periodo: {
                Codigo: '',
                FechaFin: ''
            }
        },
        CarreraProfesional: {
            Codigo: 0,
            NombreCarrera: ''
        }
    };

    const emptyActa = {
        Codigo: '',
        FechaGeneracion: '',
        CodigoCursoCalificacion: '',
        CodigoPeriodo: '',
        CodigoCarrera: 0
    };

    const emptyRegistroMatricula = {
        CodigoSunedu: '',
        CodigoEstudiante: 0,
        CodigoCursoCalificacion: '',
        Alumno: '',
        Nota1: null,
        Nota2: null,
        Nota3: null,
        Nota4: null,
        NotaRecuperacion: null,
        NotaAplazado: null,
        NotaDirigido: null,
        NotaFinal: null,
        PorcentajeAsistencia: 0,
        Obs: ''
    };

    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const [actaDialog, setActaDialog] = useState(false);
    const codigoCursoCal = searchParams.get('codigo');
    const [curso, setCurso] = useState(emptyCurso);
    const [registroMatricula, setRegistroMatricula] = useState<Sia.RegistroMatricula[]>([]);
    const [notasEstudiante, setNotasEstudiante] = useState<Sia.RegistroMatricula>(emptyRegistroMatricula);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const acta = emptyActa;
    const [actas, setActas] = useState<Sia.Acta[]>([]);
    const [visible, setVisible] = useState(false);
    const [pdfActasURL, setPdfActasURL] = useState('');
    const [estudiantesDirigido, setEstudiantesDirigido] = useState();

    useEffect(() => {
        if (status === 'authenticated') {
            fetchData();
        }
    }, [status]);

    const fetchData = async () => {
        await axios
            .get('/matricula/getMatriculaByCurso', {
                params: {
                    codCurso: codigoCursoCal
                },
                headers: {
                    Authorization: 'Bearer ' + session?.user.token
                }
            })
            .then((response) => {

                setEstudiantesDirigido(response.data.registroMatricula.filter((x: any) => x.NotaFinal < 11 || x.NotaDirigido));
                setCurso(response.data.curso);
                setRegistroMatricula(response.data.registroMatricula);
                console.log(response.data.registroMatricula[0].NotaFinal);
            })
            .catch((error) => {
                // console.log("Error en carga de datos: ", error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error en la carga de datos',
                    life: 3000
                });
            });
    };

    const actionNFTemplate = (rowData: Sia.RegistroMatricula) => {
        return <p style={Number(rowData.NotaFinal) >= 11 ? { color: 'blue' } : { color: 'red' }}> {String(rowData.NotaFinal) != 'null' ? String(rowData.NotaFinal) + '.00' : ''} </p>;
    };

    const actionNotas = (data: Sia.RegistroMatricula, nota: string, estadoNota: boolean) => {
        const n = data[nota];
        return n == null ? (
            <InputText id={String(data.CodigoEstudiante) + nota} autoComplete="off" className="p-inputtext-sm" disabled={true} style={{ width: '40px', padding: '1px', textAlign: 'center' }}></InputText>
        ) : (
            <p style={Number(n) >= 11 ? { color: 'blue' } : { color: 'red' }}>{n}</p>
        );
    };

    const actionRecuperacion = (data: Sia.RegistroMatricula, nota: string, estadoNota: boolean) => {
        const n = data[nota];
        return n == null ? (
            <InputText id={String(data.CodigoEstudiante) + nota} autoComplete="off" className="p-inputtext-sm" disabled={true} style={{ width: '40px', padding: '1px', textAlign: 'center' }}></InputText>
        ) : (
            <p style={Number(n) >= 11 ? { color: 'blue' } : { color: 'red' }}>{n}</p>
        );
    };

    const actionAplazado = (data: Sia.RegistroMatricula, nota: string, estadoNota: boolean) => {
        const n = data[nota];
        return n == null ? (
            <InputText id={String(data.CodigoEstudiante) + nota} autoComplete="off" className="p-inputtext-sm" disabled={true} style={{ width: '40px', padding: '1px', textAlign: 'center' }}></InputText>
        ) : (
            <p style={Number(n) >= 11 ? { color: 'blue' } : { color: 'red' }}>{n}</p>
        );
    };

    const actionDirigido = (data: Sia.RegistroMatricula, nota: string) => {
        const n = data[nota];
        return n == null ? (
            <InputText id={String(data.CodigoEstudiante) + nota} autoComplete="off" className="p-inputtext-sm" disabled={true} style={{ width: '40px', padding: '1px', textAlign: 'center' }}></InputText>
        ) : (
            <p style={Number(n) >= 11 ? { color: 'blue' } : { color: 'red' }}>{n}</p>
        );
    };

    const actionN1Template = (rowData: any) => {
        return actionNotas(rowData, 'Nota1', curso.CursoCalificacion.EstadoNotas);
    };
    const actionN2Template = (rowData: any) => {
        return actionNotas(rowData, 'Nota2', curso.CursoCalificacion.EstadoNotas);
    };
    const actionN3Template = (rowData: any) => {
        return actionNotas(rowData, 'Nota3', curso.CursoCalificacion.EstadoNotas);
    };
    const actionN4Template = (rowData: any) => {
        return actionNotas(rowData, 'Nota4', curso.CursoCalificacion.EstadoNotas);
    };
    const actionNRTemplate = (rowData: any) => {
        return actionRecuperacion(rowData, 'NotaRecuperacion', curso.CursoCalificacion.EstadoRecuperacion);
    };
    const actionNATemplate = (rowData: any) => {
        return actionAplazado(rowData, 'NotaAplazado', curso.CursoCalificacion.EstadoAplazado);
    };
    const actionNDTemplate = (rowData: any) => {
        return actionDirigido(rowData, 'NotaDirigido');
    };
    const percentBodyTemplate = (rowData: Sia.RegistroMatricula) => {
        if (rowData.PorcentajeAsistencia >= 75) {
            return <ProgressBar color="#16A34A" value={rowData.PorcentajeAsistencia} />;
        } else {
            return <ProgressBar color="#DC2626" value={rowData.PorcentajeAsistencia} />;
        }
    };

    if (status === 'loading') {
        return (
            <>
                <div className="flex items-center justify-center align-content-center" style={{ marginTop: '20%' }}>
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                </div>
            </>
        );
    }

    if (!session) {
        redirect('/');
    } else if (session?.user.codigoJefe == 0) {
        redirect('/pages/notfound');
    }

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <h5 className="m-3 mt-4">
                    {curso?.Nombre} {'(' + curso?.CarreraProfesional.NombreCarrera.toUpperCase() + ')'}
                </h5>
            </div>
            <div className="col-12">
                <Toast ref={toast} />
                <TabView>
                    <TabPanel header="Curso regular" leftIcon="pi pi-book mr-2">
                        <div className="card">
                            <DataTable ref={dt} value={registroMatricula} dataKey="CodigoSunedu" className="datatable-responsive" emptyMessage="Sin estudiantes.">
                                <Column field="CodigoSunedu" header="COD SUNEDU" />
                                <Column field="Alumno" header="Apellidos y Nombres" sortable />
                                <Column field="Nota1" body={actionN1Template} header="N1" />
                                <Column field="Nota2" body={actionN2Template} header="N2" />
                                <Column field="Nota3" body={actionN3Template} header="N3" />
                                <Column field="Nota4" body={actionN4Template} header="N4" />
                                <Column field="NotaRecuperacion" body={actionNRTemplate} header="S" />
                                <Column field="NotaAplazado" body={actionNATemplate} header="A" />
                                <Column field="NotaFinal" body={actionNFTemplate} header="NF" />
                                <Column field="PorcentajeAsistencia" body={percentBodyTemplate} header="% Asistencia" />
                            </DataTable>
                        </div>
                    </TabPanel>

                    <TabPanel header="Curso dirigido" leftIcon="pi pi-clock mr-2">
                        <div className="card">
                            <DataTable ref={dt} value={estudiantesDirigido} dataKey="CodigoSunedu" className="datatable-responsive" emptyMessage="Sin estudiantes.">
                                <Column field="CodigoSunedu" header="COD SUNEDU" />
                                <Column field="Alumno" header="Apellidos y Nombres" sortable />
                                <Column field="NotaDirigido" body={actionNDTemplate} header="Nota dirigido" />
                                <Column field="NotaFinal" body={actionNFTemplate} header="Nota final" />
                            </DataTable>
                        </div>
                    </TabPanel>
                </TabView>
            </div>
        </div>
    );
}
