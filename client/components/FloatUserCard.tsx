import React, { useEffect, useRef, useState } from 'react';
import { axiosInstance as axios } from '../utils/axios.instance';
import { useSession } from "next-auth/react";
import { Skeleton } from 'primereact/skeleton';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { classNames } from 'primereact/utils';
import { Password } from 'primereact/password';

const Perfil = () => {
    const { data: session, status } = useSession();

    const emptyUser = {
        Paterno: '',
        Materno: '',
        Nombres: '',
        Email: '',
        RutaFoto: '',
        DNI: ''
    }

    type Data = {
        email: string | undefined;
        oldPassword: string;
        newPassword: string;
        repeatNewPassword: string;
        [key: string]: string | undefined;
    }

    const data = {
        email: session?.user.email,
        oldPassword: '',
        newPassword: '',
        repeatNewPassword: ''
    }

    const [visible, setVisible] = useState(false);
    const [user, setUser] = useState(emptyUser);
    const toast = useRef<Toast>(null);
    const toastSuccess = useRef<Toast>(null);
    const [submitted, setSubmitted] = useState(false);
    const [dataChang, setDataChang] = useState<Data>(data);
    //const [res, setRes] = useState('');
    let res = '';

    useEffect(() => {
        if (status === 'authenticated') {
            fetchData();
        }
    }, [status]);

    const fetchData = async () => {
        try {
            const result = await axios.get('/persona', {
                params: {
                    codPersona: session?.user.codigoPersona
                },
                headers: {
                    Authorization: 'Bearer ' + session?.user.token
                }
            });
            setUser(result.data.persona);
        } catch (e) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Data no encontrada',
                life: 3000
            });
        }
    }

    const verifyGeneralInputs = () => {
        if (dataChang.email != '' && dataChang.oldPassword != '' && dataChang.newPassword != '' && dataChang.repeatNewPassword != '') {
            return true
        }
        return false
    }

    const verifyInputs = () => {
        if (dataChang.newPassword.length < 8) {
            res = 'Su nueva contraseña debe contener al menos 8 caracteres';
            return false;
        } else if (dataChang.newPassword != dataChang.repeatNewPassword) {
            res = 'Las nuevas contraseñas no coinciden';
            return false;
        }
        return true;
    }

    const changePassword = async () => {
        setSubmitted(true);
        if (verifyGeneralInputs()) {
            if (verifyInputs()) {
                try {
                    await axios.put("/changePassword", dataChang, {
                        headers: {
                            Authorization: 'Bearer ' + session?.user.token
                        }
                    });
                    toastSuccess.current?.show({
                        severity: 'success',
                        summary: 'Proceso exitoso',
                        detail: 'Contraseña modificada ',
                        life: 3000
                    });
                    setDataChang(data);
                    setSubmitted(false);
                    setVisible(false);
                } catch (error) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Contraseña actual incorrecta',
                        life: 3000
                    });
                }
            }
        }
    }

    const onInputChange = (val: string, name: string) => {
        let _data = { ...dataChang };
        _data[`${name}`] = val;

        setDataChang(_data);
    };

    const DialogFooter = (
        <>
            <Button label="Cancelar" outlined icon="pi pi-times" onClick={() => (setVisible(false), setSubmitted(false), setDataChang(data))} />
            <Button label="Guardar" icon="pi pi-check" onClick={changePassword} />
        </>
    );

    if (status == 'loading') {
        return (
            <>
                <div className='card shadow-1'>
                    <div className='text-center'>
                        <Skeleton size="4rem" className="mr-2"></Skeleton>
                    </div>
                </div>
            </>
        )
    }

    return (
        <div>
            <Toast ref={toastSuccess} />
            <div className='flex items-center justify-content-center'>
                <img style={{ width: '50px' }} src="/layout/images/avataruser.png" alt="" />
            </div>
            <div className='flex items-center justify-content-center'>
                <strong>{user?.Nombres} {user?.Paterno} {user?.Materno}</strong>
            </div>
            <div className='flex items-center justify-content-center mt-2 mb-2'>
                <Button onClick={() => setVisible(true)} style={{ height: '30px' }} severity='secondary'>Cambiar contraseña</Button>
            </div>

            <Dialog visible={visible} style={{ width: '300px' }} header="Cambiar contraseña" modal footer={DialogFooter} onHide={() => setVisible(false)}>
                <Toast ref={toast} />
                <div className="flex align-items-center justify-content-center">
                    {(
                        <div className='formgrid grid'>
                            <div className="field row">
                                <label htmlFor="currentPassword"> <b>Contraseña actual:</b> </label>
                                <Password toggleMask feedback={false} style={{ width: '100%' }} autoFocus id="currentPassword" inputClassName="w-full md:w-rem"
                                    onChange={(e) => onInputChange(e.target.value, 'oldPassword')} required
                                    className={classNames({ 'p-invalid': submitted && !dataChang.oldPassword })} />
                                {submitted && !dataChang.oldPassword && <small className="p-error">Complete el campo</small>}
                            </div>
                            <div className="field row">
                                <label htmlFor="newPassword"> <b>Nueva contraseña:</b> </label>
                                <Password toggleMask feedback={false} style={{ width: '100%' }} id="newPassword" inputClassName="w-full md:w-rem"
                                    onChange={(e) => onInputChange(e.target.value, 'newPassword')} required
                                    className={classNames({ 'p-invalid': submitted && !dataChang.newPassword })} />
                                {submitted && !dataChang.newPassword && <small className="p-error">Complete el campo</small>}
                            </div>
                            <div className="field row">
                                <label htmlFor="repeatPassword"> <b>Repita la nueva contraseña:</b> </label>
                                <Password toggleMask feedback={false} style={{ width: '100%' }} id="repeatPassword" inputClassName="w-full md:w-rem"
                                    onChange={(e) => onInputChange(e.target.value, 'repeatNewPassword')} required
                                    className={classNames({ 'p-invalid': submitted && !dataChang.repeatNewPassword })} />
                                {submitted && !dataChang.repeatNewPassword && <small className="p-error">Complete el campo</small>}
                            </div>
                            {
                                (submitted && !verifyInputs()) ?
                                    <div className='row' style={{ border: '1px solid red', borderRadius: '5px', padding: '8px', backgroundColor: '#F2B5B5' }}>
                                        <small className="p-error">{res}</small>
                                    </div> : <></>
                            }
                        </div>
                    )}
                </div>
            </Dialog>
        </div>
    )
}

export default Perfil
