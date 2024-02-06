'use client'
import React, { use, useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { useSearchParams } from 'next/navigation';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Demo } from '../../../../types/types';
import { ProgressBar } from 'primereact/progressbar';

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
                Codigo: ''
            }
        },
        CarreraProfesional: {
            Codigo: 0
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
        NotaFinal: 0,
        PorcentajeAsistencia: 0
    }

    const searchParamas = useSearchParams();
    const [actaDialog, setActaDialog] = useState(false);
    const codigoCursoCal = searchParamas.get('codigo')
    const [curso, setCurso] = useState(emptyCurso);
    const [registroMatricula, setRegistroMatricula] = useState();
    const [notasEstudiante, setNotasEstudiante] = useState<Demo.RegistroMatricula>(emptyRegistroMatricula);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    let arrayNotas: number[] = [];
    const acta = emptyActa;
    const [actas, setActas] = useState<Demo.Acta[]>([]);

    useEffect(() => {
        fetchData();
        fetchActas();
    }, []);

    const fetchData = async () => {
        await axios.get('http://127.0.0.1:3001/api/matricula/getMatriculaByCurso', {
            params: {
                codCurso: codigoCursoCal,
            }
        }).then(response => {
            setCurso(response.data.curso);
            setRegistroMatricula(response.data.registroMatricula);
            console.log(response.data);
            // setCursos(response.data.cursos)

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
        fetchData();
        console.log(result);
    }

    const onUpdateNotas = (data: Demo.RegistroMatricula, nota: string) => {
        if (nota != 'NotaRecuperacion' && nota != 'NotaAplazado') arrayNotas.push(Number(data[nota]));
        const _n = (document.getElementById(String(data.CodigoEstudiante) + nota) as HTMLInputElement)?.value;
        if (data[nota] == null && _n != '' && (Number(_n) >= 0) && (Number(_n) <= 20)) {
            notasEstudiante[nota] = Number(_n);
        } else if (data[nota] != undefined) {
            notasEstudiante[nota] = Number(data[nota]);
        } else if (_n != '') {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Nota inválida',
                life: 3000
            });
            (document.getElementById(String(data.CodigoEstudiante) + nota) as HTMLInputElement).value = ''
        }
        if (nota == 'NotaRecuperacion') arrayNotas.push(Number(_n));
    };

    const saveNotes = (data: Demo.RegistroMatricula) => {
        notasEstudiante['CodigoCursoCalificacion'] = data.CodigoCursoCalificacion;
        notasEstudiante['CodigoEstudiante'] = data.CodigoEstudiante;
        onUpdateNotas(data, 'Nota1');
        onUpdateNotas(data, 'Nota2');
        onUpdateNotas(data, 'Nota3');
        onUpdateNotas(data, 'Nota4');
        onUpdateNotas(data, 'NotaRecuperacion');
        onUpdateNotas(data, 'NotaAplazado');
        notasEstudiante.NotaFinal = Math.round((Number(notasEstudiante.Nota1) + Number(notasEstudiante.Nota2) + Number(notasEstudiante.Nota3) + Number(notasEstudiante.Nota4)) / 4);

        if (notasEstudiante.NotaRecuperacion != null) {
            arrayNotas.sort((a, b) => b - a).pop();
            let total = arrayNotas.reduce((a, b) => a + b, 0);
            console.log(total);
            notasEstudiante['NotaFinal'] = Math.round(total / 4);
        }

        if ((Number(notasEstudiante.NotaAplazado)) >= 11) {
            notasEstudiante['NotaFinal'] = 11;
        }

        if (data.NotaRecuperacion == null || notasEstudiante.NotaAplazado != null) {
            if (data.PorcentajeAsistencia < 75 && (notasEstudiante.NotaRecuperacion != null || notasEstudiante.NotaFinal != null)) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No cumple con el mínimo porcentaje de asistencia',
                    life: 3000
                });
            } else {
                apiSaveNotes()
                setNotasEstudiante(emptyRegistroMatricula);
            }
        }
        console.log(data)
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
        return actionNotas(rowData, 'NotaRecuperacion', curso.CursoCalificacion.EstadoRecuperacion);
    }
    const actionNATemplate = (rowData: any) => {
        return actionNotas(rowData, 'NotaAplazado', curso.CursoCalificacion.EstadoAplazado);
    }

    const percentBodyTemplate = (rowData: Demo.RegistroMatricula) => {
        if (rowData.PorcentajeAsistencia >= 75) {
            return <ProgressBar color='#16A34A' value={rowData.PorcentajeAsistencia} />
        } else {
            return <ProgressBar color='#DC2626' value={rowData.PorcentajeAsistencia} />
        }
    }

    const actionSaveTemplate = (rowData: any) => {
        if (actas.length == 0) {
            return <i className='pi pi-save' style={{ cursor: 'pointer' }} onClick={() => saveNotes(rowData)}></i>
        } else {
            return <i className='pi pi-save' style={{ color: '#D4D4D4' }}></i>
        }
    }

    const openActaDialog = () => {
        setActaDialog(true);
    };

    const hideActaDialog = () => {
        setActaDialog(false);
    };

    const actaDialogFooter = (
        <>
            <Button label="No" outlined icon="pi pi-times" onClick={hideActaDialog} />
            <Button label="Si" icon="pi pi-check" onClick={saveActa} />
        </>
    );

    const headerTable = () => {
        if (actas.length == 0) {
            return (
                <Button onClick={openActaDialog} style={{ height: '30px', marginBlock: '10px', marginTop: '0px' }}>Generar acta</Button>
            )
        } else {
            return <div style={{ height: '30px', marginBlock: '10px', marginTop: '0px', padding: '5px', border: '1px solid red' }}> <b style={{ color: 'red' }}>ACTA GENERADA</b> </div>
        }
    }

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <h5 className='m-1 mb-3'>{curso.Nombre}</h5>
            </div>
            <div className='col-12'>
                <div className='card'>
                    <div style={{ display: 'flex', justifyContent: 'end' }}>
                        {headerTable()}
                    </div>
                    <Toast ref={toast} />
                    <DataTable
                        ref={dt}
                        value={registroMatricula}
                        dataKey="CodigoSunedu"
                        className="datatable-responsive"
                        emptyMessage="Sin estudiantes."
                        responsiveLayout="scroll"
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
                                    <b>Estás seguro de generar el acta?</b> Ten en cuenta que luego de genrarlo, no podrás editar ningun registro de calificaciones de este curso.
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}

export default page
