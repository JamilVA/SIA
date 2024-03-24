'use client'
import axios from 'axios';
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from 'react';
import '../../styles/startpage.css';
import { ProgressSpinner } from 'primereact/progressspinner';

const page = () => {
    const { data: session, status } = useSession();

    const emptyPersona = {
        Paterno: '',
        Materno: '',
        Nombres: ''
    }

    const [persona, setPersona] = useState(emptyPersona);

    const fetchData = async () => {
        const result = await axios.get('http://localhost:3001/api/persona', {
            params: {
                codPersona: session?.user.codigoPersona
            }
        });
        setPersona(result.data.persona)
        console.log(result)
    }

    useEffect(() => {
        if (status === 'authenticated') {
            fetchData();
        }
    }, [status]);

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
        <div className='mt-3 container_img' style={{height:'75vh', display:'flex', justifyContent:'center'}}>
            <h3 className="text-center text" style={{height:'min-content', width:'60%', marginTop:'20%'}}>Hola {persona.Nombres + ' ' + persona.Paterno}, bienvenido(a) al Sistema Informático Académico de la Escuela Superior de Formación Artística Mario Urteaga Alvarado</h3>
        </div>
    )
}

export default page

