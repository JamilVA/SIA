'use client'
import React, { use, useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { redirect, useSearchParams } from 'next/navigation';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Demo } from '../../../../types/types';
import { ProgressBar } from 'primereact/progressbar';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useSession } from "next-auth/react";
import { TabPanel, TabView } from 'primereact/tabview';

const page = () => {

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
    }

    const emptyActa = {
        Codigo: '',
        FechaGeneracion: '',
        CodigoCursoCalificacion: '',
        CodigoPeriodo: '',
        CodigoCarrera: 0
    }

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
        PorcentajeAsistencia: 0
    }

    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const [actaDialog, setActaDialog] = useState(false);
    const codigoCursoCal = searchParams.get('codigo')
    const [curso, setCurso] = useState(emptyCurso);
    const [registroMatricula, setRegistroMatricula] = useState();
    const [notasEstudiante, setNotasEstudiante] = useState<Demo.RegistroMatricula>(emptyRegistroMatricula);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    let arrayNotas: number[] = [];
    const acta = emptyActa;
    const [actas, setActas] = useState<Demo.Acta[]>([]);
    const [visible, setVisible] = useState(false)
    const [pdfActasURL, setPdfActasURL] = useState('');
    const [estudiantesDirigido, setEstudiantesDirigido] = useState();

    useEffect(() => {
        fetchData();
        fetchActas();
    }, [status]);

    const fetchData = async () => {
        let _estudDirigido;
        await axios.get('http://127.0.0.1:3001/api/matricula/getMatriculaByCurso', {
            params: {
                codCurso: codigoCursoCal,
            }
        }).then(response => {
            setCurso(response.data.curso);
            setRegistroMatricula(response.data.registroMatricula);
            console.log(response.data);
            // setCursos(response.data.cursos)
            _estudDirigido = response.data.registroMatricula.filter((x: any) => x.NotaFinal < 11 || x.NotaDirigido);
            setEstudiantesDirigido(_estudDirigido);
        }).catch(error => {
            console.log("Error en carga de datos: ", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error en la carga de datos',
                life: 3000
            });
        })
    }

    const fetchActas = async () => {
        await axios.get('http://127.0.0.1:3001/api/acta', {
            params: {
                CodCursoCal: codigoCursoCal
            }
        }).then(response => {
            setActas(response.data.actas);
            console.log(response.data);

        }).catch(error => {
            console.log("Error en carga de datos: ", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error en la carga de datos',
                life: 3000
            });
        })
    }

    const apiSaveNotes = async () => {
        const result = await axios.put('http://127.0.0.1:3001/api/matricula/updateNotas', notasEstudiante)
        fetchData();
        console.log(result);
    }

    const apiSaveActa = async (data: object) => {
        const result = await axios.post('http://127.0.0.1:3001/api/acta', data)
        await fetchActas()
        console.log(result);
    }

    const onUpdateNotas = (data: Demo.RegistroMatricula, nota: string) => {
        let response = true;
        let notaMax = nota == 'NotaAplazado' ? 13 : 20;
        const _n = (document.getElementById(String(data.CodigoEstudiante) + nota) as HTMLInputElement)?.value;
        //if (nota != 'NotaRecuperacion' && nota != 'NotaAplazado' && (Number(_n) <= notaMax)) arrayNotas.push(Number(data[nota]));
        //console.log(arrayNotas);

        if (data[nota] == null && _n != '' && (Number(_n) >= 0) && (Number(_n) <= notaMax)) {
            notasEstudiante[nota] = Number(_n);
            if (nota == 'NotaRecuperacion') {
                arrayNotas.push(Number(data['Nota1']));
                arrayNotas.push(Number(data['Nota2']));
                arrayNotas.push(Number(data['Nota3']));
                arrayNotas.push(Number(data['Nota4']));
                arrayNotas.push(Number(_n));
                arrayNotas.sort((a, b) => b - a).pop();
                let total = arrayNotas.reduce((a, b) => a + b, 0);
                console.log(arrayNotas);
                console.log(total);
                notasEstudiante['NotaFinal'] = Math.round(total / 4);
            } else if (nota == 'NotaAplazado' ) {
                if(Number(_n) > data.NotaFinal!){
                    console.log('Nfinal: ' + data.NotaFinal)
                    notasEstudiante.NotaFinal = Number(_n);
                }else{
                    notasEstudiante.NotaFinal = data.NotaFinal;
                }
            } else {
                console.log('llega')
                notasEstudiante.NotaFinal = Math.round((Number(notasEstudiante.Nota1) + Number(notasEstudiante.Nota2) + Number(notasEstudiante.Nota3) + Number(notasEstudiante.Nota4)) / 4);
            }
        } else if (data[nota] != undefined) {
            notasEstudiante[nota] = Number(data[nota]);
        } else if (_n != '') {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Ingrese una nota entre 0 y ' + notaMax,
                life: 3000
            });
            (document.getElementById(String(data.CodigoEstudiante) + nota) as HTMLInputElement).value = '';
            response = false;
        }
        return response;
    };

    const saveNotes = (data: Demo.RegistroMatricula) => {
        notasEstudiante['CodigoCursoCalificacion'] = data.CodigoCursoCalificacion;
        notasEstudiante['CodigoEstudiante'] = data.CodigoEstudiante;

        if (onUpdateNotas(data, 'Nota1') && onUpdateNotas(data, 'Nota2') && onUpdateNotas(data, 'Nota3') && onUpdateNotas(data, 'Nota4')
            && onUpdateNotas(data, 'NotaRecuperacion') && onUpdateNotas(data, 'NotaAplazado')) {
            console.log('success')

            if (notasEstudiante.NotaFinal != null) {
                console.log(notasEstudiante.NotaFinal);
                apiSaveNotes()
                setNotasEstudiante(emptyRegistroMatricula);
                console.log(data)
            }
        }
    }

    const onUpdateNotesDirigido = (data: Demo.RegistroMatricula, nota: string) => {
        let response = true;
        const _n = (document.getElementById(String(data.CodigoEstudiante) + nota) as HTMLInputElement)?.value;

        if (data[nota] == null && _n != '' && (Number(_n) >= 0) && (Number(_n) <= 14)) {
            notasEstudiante[nota] = Number(_n);
        } else if (data[nota] != undefined) {
            notasEstudiante[nota] = Number(data[nota]);
        } else if (_n != '') {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Ingrese una nota entre 0 y 14',
                life: 3000
            });
            (document.getElementById(String(data.CodigoEstudiante) + nota) as HTMLInputElement).value = '';
            response = false;
        }
        return response;
    }

    const setNoteDefault = (data: Demo.RegistroMatricula, nota: string) => {
        if (Number(data[nota] != null)) {
            notasEstudiante[nota] = Number(data[nota]);
        }
    }

    const saveNotesDirigido = (data: Demo.RegistroMatricula, nota: string) => {
        if (onUpdateNotesDirigido(data, nota)) {
            console.log('success')
            notasEstudiante['CodigoCursoCalificacion'] = data.CodigoCursoCalificacion;
            notasEstudiante['CodigoEstudiante'] = data.CodigoEstudiante;
            setNoteDefault(data, 'Nota1');
            setNoteDefault(data, 'Nota2');
            setNoteDefault(data, 'Nota3');
            setNoteDefault(data, 'Nota4');
            setNoteDefault(data, 'NotaRecuperacion');
            setNoteDefault(data, 'NotaAplazado');
            if (Number(notasEstudiante[nota]) > data.NotaFinal!) {
                notasEstudiante.NotaFinal = notasEstudiante.NotaDirigido;
            } else {
                setNoteDefault(data, 'NotaFinal');
            }
            apiSaveNotes()
            setNotasEstudiante(emptyRegistroMatricula);
            console.log(data)
        }
    }

    const middCodigoActa = (n: number) => {
        let c = '';
        if (n < 10)
            c = '0' + n;
        else {
            c = n.toString()
        }

        return c;
    }

    const saveActa = () => {
        acta['CodigoPeriodo'] = curso.CursoCalificacion.Periodo.Codigo;
        acta['CodigoCarrera'] = curso.CarreraProfesional.Codigo;
        acta['Codigo'] = String(curso.CursoCalificacion.Periodo.Codigo) + String(middCodigoActa(curso.CarreraProfesional.Codigo));
        acta['FechaGeneracion'] = new Date().toLocaleDateString();
        acta['CodigoCursoCalificacion'] = curso.CursoCalificacion.Codigo;
        apiSaveActa(acta);
        setActaDialog(false);
    }

    const actionNFTemplate = (rowData: Demo.RegistroMatricula) => {
        return <p style={Number(rowData.NotaFinal) >= 11 ? { color: 'blue' } : { color: 'red' }}> {String(rowData.NotaFinal) != 'null' ? String(rowData.NotaFinal) + '.00' : ''} </p>
    }

    const actionNotas = (data: Demo.RegistroMatricula, nota: string, estadoNota: boolean) => {
        const n = (data[nota]);
        return n == null ? <InputText id={String(data.CodigoEstudiante) + nota} autoComplete='off' className='p-inputtext-sm' disabled={estadoNota == false ? true : false} style={{ width: '40px', padding: '1px', textAlign: 'center' }} ></InputText>
            : <p style={Number(n) >= 11 ? { color: 'blue' } : { color: 'red' }}>{n}</p>
    }

    const actionRecuperacion = (data: Demo.RegistroMatricula, nota: string, estadoNota: boolean) => {
        const n = (data[nota]);
        return n == null ? <InputText id={String(data.CodigoEstudiante) + nota} autoComplete='off' className='p-inputtext-sm' disabled={estadoNota == false || data.NotaFinal! > 10 ? true : false} style={{ width: '40px', padding: '1px', textAlign: 'center' }} ></InputText>
            : <p style={Number(n) >= 11 ? { color: 'blue' } : { color: 'red' }}>{n}</p>
    }

    const actionAplazado = (data: Demo.RegistroMatricula, nota: string, estadoNota: boolean) => {
        const n = (data[nota]);
        return n == null ? <InputText id={String(data.CodigoEstudiante) + nota} autoComplete='off' className='p-inputtext-sm' disabled={estadoNota == false || data.NotaFinal! < 8 || data.NotaFinal! > 10 ? true : false} style={{ width: '40px', padding: '1px', textAlign: 'center' }} ></InputText>
            : <p style={Number(n) >= 11 ? { color: 'blue' } : { color: 'red' }}>{n}</p>
    }

    const actionDirigido = (data: Demo.RegistroMatricula, nota: string) => {
        const n = (data[nota]);
        return n == null ? <InputText id={String(data.CodigoEstudiante) + nota} autoComplete='off' className='p-inputtext-sm' style={{ width: '40px', padding: '1px', textAlign: 'center' }} ></InputText>
            : <p style={Number(n) >= 11 ? { color: 'blue' } : { color: 'red' }}>{n}</p>
    }

    const actionN1Template = (rowData: any) => {
        return actionNotas(rowData, 'Nota1', curso.CursoCalificacion.EstadoNotas);
    }
    const actionN2Template = (rowData: any) => {
        return actionNotas(rowData, 'Nota2', curso.CursoCalificacion.EstadoNotas);
    }
    const actionN3Template = (rowData: any) => {
        return actionNotas(rowData, 'Nota3', curso.CursoCalificacion.EstadoNotas);
    }
    const actionN4Template = (rowData: any) => {
        return actionNotas(rowData, 'Nota4', curso.CursoCalificacion.EstadoNotas);
    }
    const actionNRTemplate = (rowData: any) => {
        return actionRecuperacion(rowData, 'NotaRecuperacion', curso.CursoCalificacion.EstadoRecuperacion);
    }
    const actionNATemplate = (rowData: any) => {
        return actionAplazado(rowData, 'NotaAplazado', curso.CursoCalificacion.EstadoAplazado);
    }
    const actionNDTemplate = (rowData: any) => {
        return actionDirigido(rowData, 'NotaDirigido');
    }
    const percentBodyTemplate = (rowData: Demo.RegistroMatricula) => {
        if (rowData.PorcentajeAsistencia >= 75) {
            return <ProgressBar color='#16A34A' value={rowData.PorcentajeAsistencia} />
        } else {
            return <ProgressBar color='#DC2626' value={rowData.PorcentajeAsistencia} />
        }
    }

    const actionSaveTemplate = (rowData: any) => {
        if (curso.CursoCalificacion.EstadoNotas || curso.CursoCalificacion.EstadoRecuperacion) {
            return <i className='pi pi-save' style={{ cursor: 'pointer' }} onClick={() => saveNotes(rowData)}></i>
        } else {
            return <i className='pi pi-save' style={{ color: '#D4D4D4' }}></i>
        }
    }

    const actionSaveAplazadoTemplate = (rowData: any) => {
        if (curso.CursoCalificacion.EstadoAplazado) {
            return <i className='pi pi-save' style={{ cursor: 'pointer' }} onClick={() => saveNotesDirigido(rowData, 'NotaAplazado')}></i>
        } else {
            return <i className='pi pi-save' style={{ color: '#D4D4D4' }}></i>
        }
    }

    const actionSaveDirigidoTemplate = (rowData: any) => {
        return <i className='pi pi-save' style={{ cursor: 'pointer' }} onClick={() => saveNotesDirigido(rowData, 'NotaDirigido')}></i>
    }

    const openActaDialog = () => {
        setActaDialog(true);
    };

    const hideActaDialog = () => {
        setActaDialog(false);
    };

    const obtenerPDFActa = async () => {
        await axios.get('http://localhost:3001/api/pdf/acta', {
            params: { codigoCurso: codigoCursoCal },
            responseType: 'blob'
        })
            .then(response => {
                console.log(response);
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);

                setPdfActasURL(url);
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

    const actaDialogFooter = (
        <>
            <Button label="No" outlined icon="pi pi-times" onClick={hideActaDialog} />
            <Button label="Si" icon="pi pi-check" onClick={saveActa} />
        </>
    );

    const headerTable = () => {
        let _fechaHoy = new Date(Date.now());
        let _fechaFin = new Date(curso.CursoCalificacion.Periodo.FechaFin);
        if (_fechaHoy >= _fechaFin) {
            if (actas.length == 0) {
                return (
                    <Button onClick={openActaDialog} style={{ height: '30px', marginBlock: '10px', marginTop: '0px' }}>Generar acta</Button>
                )
            } else {
                return (
                    <div className='flex flex-row align-items-center'>
                        <div style={{ height: '30px', marginBlock: '10px', marginTop: '0px', padding: '5px', border: '1px solid red' }}>
                            <b style={{ color: 'red' }}>ACTA GENERADA</b>
                        </div>
                        <div>
                            <Button className='px-2 py-1 border-none ml-2'
                                size='small'
                                label="Vista PDF"
                                icon="pi pi-file-pdf"
                                onClick={() => obtenerPDFActa()}
                            />
                        </div>
                    </div>
                )
            }
        }

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
        <div className="grid crud-demo">
            <div className="col-12">
                <h5 className='m-3 mt-4'>{curso.Nombre} {'(' + curso.CarreraProfesional.NombreCarrera.toUpperCase() + ')'}</h5>
            </div>
            <div className='col-12'>
                <Toast ref={toast} />
                <TabView>
                    <TabPanel header="Curso regular" leftIcon="pi pi-book mr-2">
                        <div className='card'>
                            <div style={{ display: 'flex', justifyContent: 'end' }}>
                                {headerTable()}
                            </div>
                            <DataTable
                                ref={dt}
                                value={registroMatricula}
                                dataKey="CodigoSunedu"
                                className="datatable-responsive"
                                emptyMessage="Sin estudiantes."
                            >
                                <Column field="CodigoSunedu" header="COD SUNEDU" />
                                <Column field="Alumno" header="Apellidos y Nombres" sortable />
                                <Column field="Nota1" body={actionN1Template} header="N1" />
                                <Column field="Nota2" body={actionN2Template} header="N2" />
                                <Column field="Nota3" body={actionN3Template} header="N3" />
                                <Column field="Nota4" body={actionN4Template} header="N4" />
                                <Column field="NotaRecuperacion" body={actionNRTemplate} header="R" />
                                <Column field="NotaAplazado" body={actionNATemplate} header="A" />
                                <Column field="NotaFinal" body={actionNFTemplate} header="NF" />
                                <Column body={actionSaveTemplate} />
                                <Column field="PorcentajeAsistencia" body={percentBodyTemplate} header="% Asistencia" />
                            </DataTable>

                            <Dialog visible={actaDialog} style={{ width: '400px' }} header="Confirmar" modal footer={actaDialogFooter} onHide={hideActaDialog}>
                                <div className="flex align-items-center justify-content-center">
                                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                    {(
                                        <span style={{ textAlign: 'justify', width: '20rem' }}>
                                            <b>¿Estás seguro de generar el acta?</b> Ten en cuenta que luego de generarlo, no podrás editar ningun registro de calificaciones de este curso.
                                        </span>
                                    )}
                                </div>
                            </Dialog>
                            <Dialog header="Vista PDF de historial de notas" visible={visible} style={{ width: '80vw', height: '90vh' }} onHide={() => setVisible(false)}>
                                <iframe src={pdfActasURL} width="100%" height="99%"></iframe>
                            </Dialog>
                        </div>
                    </TabPanel>

                    <TabPanel header="Curso dirigido" leftIcon="pi pi-clock mr-2">
                        {actas.length > 0 ?
                            <div className='card'>
                                <DataTable
                                    ref={dt}
                                    value={estudiantesDirigido}
                                    dataKey="CodigoSunedu"
                                    className="datatable-responsive"
                                    emptyMessage="Sin estudiantes."
                                >
                                    <Column field="CodigoSunedu" header="COD SUNEDU" />
                                    <Column field="Alumno" header="Apellidos y Nombres" sortable />
                                    <Column field="NotaDirigido" body={actionNDTemplate} header="Nota dirigido" />
                                    <Column field="NotaFinal" body={actionNFTemplate} header="Nota final" />
                                    <Column body={actionSaveDirigidoTemplate} />
                                </DataTable>
                            </div>
                            : <></>
                        }


                    </TabPanel>
                </TabView>
            </div>
        </div>
    )
}

export default page
