'use client'
import { useState } from "react";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

export default function Page () {

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ width: '70vh', marginTop: '15vh' }}>
        <img src={`/images/esfap.png`} alt="logo" width={'150px'} />
        <h4>Reestablece tu contraseña</h4>
        <div className='card'>
          <p>Ingrese el correo electrónico verificado de su cuenta de usuario y le enviaremos un
            enlace para restablecer la contraseña</p>
          <InputText className='w-full' type="email" onChange={(event) => setEmail(event.target.value)} />
          <Button onClick={
            async () => {
              setLoading(true)
              const res = await fetch(`/api/send`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: email,
                }),
              })
              const data = await res.json()
              console.log(data)
              console.log('send')
              setLoading(false)
            }} loading={loading} className='mt-3 w-full'>Enviar correo electrónico para restablecer contraseña</Button>
        </div>
      </div>
    </div>
  )
}


