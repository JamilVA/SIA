'use client'
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import Link from 'next/link';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import { useSession } from "next-auth/react";
import { ProgressSpinner } from 'primereact/progressspinner';

const page = () => {

    const paramsHorarioG = {
        CodCarrera: 4,
        Nivel: 0,
        Semestre: 0
    }

    const { data: session, status } = useSession();
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const [horarios, setHorarios] = useState([]);
    const [horarioE, setHorarioE] = useState([]);
    const [i, setI] = useState(0);
    const [nivel, setNivel] = useState(0);
    const [ciclo, setCiclo] = useState();
    const [paramsHG, setParamsHG] = useState(paramsHorarioG);
    const niveles = [
        { name: 'Primer año', value: 1 },
        { name: 'Segundo año', value: 2 },
        { name: 'Tercer año', value: 3 },
        { name: 'Cuarto año', value: 4 },
        { name: 'Quinto año', value: 5 },
    ]
    const arrayCiclos = [
        { name: 'I ciclo', value: 1 },
        { name: 'II ciclo', value: 2 },
        { name: 'III ciclo', value: 3 },
        { name: 'IV ciclo', value: 4 },
        { name: 'V ciclo', value: 5 },
        { name: 'VI ciclo', value: 6 },
        { name: 'VII ciclo', value: 7 },
        { name: 'VII ciclo', value: 8 },
        { name: 'IX ciclo', value: 9 },
        { name: 'X ciclo', value: 10 },
    ]
    const [ciclos, setCiclos] = useState(arrayCiclos);

    useEffect(() => {
        if(status === "authenticated"){
            fetchHorariosG();
            fetchHorarioE()
        }      
    }, [status]);

    const fetchHorariosG = async () => {
        await axios.get("http://127.0.0.1:3001/api/horario/generales", {
            params: {
                CodCarrera: paramsHG.CodCarrera,
                Nivel: paramsHG.Nivel,
                Semestre: paramsHG.Semestre
            }
        }).then(response => {
            console.log(response.data);
            setHorarios(response.data.horarios);

        }).catch(error => {
            console.log("Error en carga de horarios: ", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error en la carga de datos',
                life: 3000
            });
        })
    }

    const fetchHorarioE = async () => {
        await axios.get("http://127.0.0.1:3001/api/horario/estudiante", {
            params: {
                CodEstudiante: session?.user.codigoEstudiante,
            }
        }).then(response => {
            console.log(response.data);
            setHorarioE(response.data.horario)

        }).catch(error => {
            console.log("Error en la carga de horario: ", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error en la carga de datos',
                life: 3000
            });
        })
    }

    const onDropdownChange = (e: any) => {
        const val = (e.target && e.target.value) || '';
        setNivel(val);
        let _ciclos = { ...ciclos };
        switch (val) {
            case 1:
                _ciclos = arrayCiclos.filter((x) => (x.value == 1 || x.value == 2)); break
            case 2:
                _ciclos = arrayCiclos.filter((x) => (x.value == 3 || x.value == 4)); break
            case 3:
                _ciclos = arrayCiclos.filter((x) => (x.value == 5 || x.value == 6)); break
            case 4:
                _ciclos = arrayCiclos.filter((x) => (x.value == 7 || x.value == 8)); break
            case 5:
                _ciclos = arrayCiclos.filter((x) => (x.value == 9 || x.value == 10)); break
        }
        setCiclos(_ciclos);
        paramsHG['Nivel'] = val;
    };

    const onDropdownCiclosChange = (e: any) => {
        const val = (e.target && e.target.value) || '';
        setCiclo(val);
        paramsHG['Semestre'] = val;
        fetchHorariosG();
        setI(0);
    }

    const bodyCiclos = () => {
        if (nivel > 0) {
            return (
                <div className="grid mt-3">
                    <label className='col-12' htmlFor="Ciclo">Ciclo</label>
                    <Dropdown
                        value={ciclo}
                        options={ciclos}
                        optionLabel="name"
                        optionValue="value"
                        name="Ciclo"
                        onChange={(e) => {
                            onDropdownCiclosChange(e);
                        }}
                        placeholder="Seleccione..."
                        id="Ciclo"
                        className='w-full'
                    />
                </div>
            )
        }
    }

    const setHorarioEstudiante = () => {
        setI(1);
        console.log(i)
        console.log(horarioE)
    }

    const headerTable = () => {
        if (horarioE?.length > 0) {
            return (
                <div style={{ display: 'flex', justifyContent: 'end' }}>
                    <Button onClick={setHorarioEstudiante} style={{ height: '30px', marginBlock: '10px' }}>Ver mi horario</Button>
                </div>
            )
        }
    }

    const actionHoraTemplate = (rowData: any) => {
        let horaIni = rowData.HoraInicio.substring(0, 5);
        let horaFin = rowData.HoraFin.substring(0, 5);
        return (
            <>
                {horaIni} - {horaFin}
            </>
        )
    }

    if (status === "loading") {
        return (
            <>
                <div className='flex items-center justify-center align-content-center' style={{ marginTop: '20%'}}>
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                </div>
            </>
        )
    }

    return (
        <div className='grid'>
            <div className='col-12'>
                <h5 className='m-3 mt-4'>HORARIOS - CICLO</h5>
            </div>
            <div className='col-12 md:col-3'>
                <div className='card'>
                    <div className="grid">
                        <label className='col-12' htmlFor="Nivel">Nivel</label>
                        <Dropdown
                            value={nivel}
                            options={niveles}
                            optionLabel="name"
                            optionValue="value"
                            name="Nivel"
                            onChange={(e) => {
                                onDropdownChange(e);
                            }}
                            placeholder="Seleccione..."
                            id="Nivel"
                            className='w-full'
                        />
                    </div>
                    {bodyCiclos()}
                </div>
            </div>
            <div className="col-12 md:col-9">
                <div className='card'>
                    <Toast ref={toast} />
                    {headerTable()}
                    <DataTable
                        ref={dt}
                        value={i == 0 ? horarios : horarioE}
                        dataKey="CodigoHorario"
                        className="datatable-responsive"
                        emptyMessage="No se encontraron horarios"
                        responsiveLayout="scroll"
                    >
                        <Column header="Codigo" field="CodigoCurso" />
                        <Column header="Curso" field="Nombre" sortable />
                        <Column header="Día" field="Dia" sortable />
                        <Column header="Hora" body={actionHoraTemplate} />
                        <Column header="N° Aula" field="NumeroAula" />
                        <Column header="Aula" field="NombreAula" />
                    </DataTable>
                </div>
            </div>
        </div>
    )
}

export default page
