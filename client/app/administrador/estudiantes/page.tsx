'use client'
import React from 'react'
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable, DataTableExpandedRows, DataTableFilterMeta } from 'primereact/datatable';
import { Column, ColumnFilterApplyTemplateOptions, ColumnFilterClearTemplateOptions, ColumnFilterElementTemplateOptions } from 'primereact/column';
import { useState, useEffect } from 'react';
import axios from 'axios';

const page = () => {

    const [estudianteData, setEstudianteData] = useState([])

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = async () => {
        try {
            const result = await axios("http://localhost:3001/api/estudiante")
            setEstudianteData(result.data.estudiantes)
            console.log(result.data.estudiantes)
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <div>
            <h5>ESTUDIANTES</h5>
            <div className="col-12">
                <div className="card">
                    <h5>Row Expand</h5>
                    <DataTable value={estudianteData} dataKey="codigo">
                        <Column field="CodigoSunedu" header="COD" sortable />
                        <Column field="CodigoCarreraProfesional" header="Carrera" sortable />
                        <Column field="Persona.DNI" header="DNI" sortable />
                        <Column field="Persona.Paterno" header="Paterno" sortable />
                        <Column field="Persona.Materno" header="Materno" sortable />
                        <Column field="Persona.Nombres" header="Nombres" sortable />
                        <Column field="AnioIngreso" header="Ingreso" sortable />
                        <Column field="Persona.Email" header="Email" sortable />
                    </DataTable>
                </div>
            </div>
        </div>
    )
}

export default page