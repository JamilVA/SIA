'use client';
import React, { useEffect, useRef, useState } from 'react';


const Page = () => {

    return (
        <div className="grid">
            <div className="col-12">
                <h5 className='m-1 mb-3'>HISTORIAL DE NOTAS</h5>
            </div>
            <div className="col-12 md:col-3">
                <div className='card shadow-1'>
                    <div className='text-center'>
                        <img style={{borderRadius: 'var(--border-radius)'}} alt="Card" className='md:w-5 w-5 mt-1 shadow-1' src="http://academicoplus.unc.edu.pe/Estudiante/ObtenerFotoEstudiante?codigo=18110054&genero=1" />
                        <h5 style={{ color: 'var(--surface-700)' }}>VILLANUEVA VARGAS JHAN CARLOS</h5>
                        <h6 className='mt-0' style={{ color: 'var(--surface-500)' }}>ARTES VISUALES</h6>
                    </div>
                    <div className='mt-4'>
                        <p><b>Codigo: </b>AV73414616</p>
                        <p><b>Email: </b>jhanvillanueva@gmail.com</p>
                        <p><b>DNI: </b>73414616</p>
                    </div>
                </div>
            </div>
            <div className='col-12 md:col-9'>
                <div className='card'>
                    <p>jjk</p>
                </div>
            </div>
        </div>
    )
}

export default Page;    