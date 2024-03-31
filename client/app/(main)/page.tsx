"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import '../../styles/login.css';
import { Message } from "primereact/message";
//import { useSession } from "next-auth/react";

const LoginPage = () => {
    const [errors, setErrors] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState(false)
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true)
        setErrors("");

        const responseNextAuth = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        setLoading(false)

        if (responseNextAuth?.error) {
            setErrors(responseNextAuth.error);
        } else {
            router.push("/inicio")
            router.refresh()
        }

    };

    return (
        <div className="body">
            <div className="card general_container">
                <div className="grid col-6 p-0 login_container">
                    <div className="col-6 img_container">
                        <img style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: '15px 0 0 15px' }} src={`/images/fachada1.png`} alt="" />
                    </div>

                    <div className="col-6 form_container">
                        <div className="p-3">
                            <h4 className="mt-2" style={{ color: '#000142' }}>Bienvenido(a) a<br />la plataforma<br />SIA-ESFAP MUA</h4>
                        </div>
                        <form onSubmit={handleSubmit} className="p-3">
                            <span className="p-float-label mb-3">
                                <InputText id="email" type="email" value={email} name='email' required onChange={(event) => setEmail(event.target.value)}
                                    style={{ width: '100%' }} />
                                <label htmlFor="email">Email</label>
                            </span>
                            {/*<div style={{textAlign:'right'}}>
                                <a style={{ fontSize: '15px' }} href="/auth/password_reset">Olvidaste tu contraseña?</a>
                            </div>*/}
                            <span className="p-float-label mt-5 mb-5">
                                <Password id="password" feedback={false} value={password} required name='password' tabIndex={1} toggleMask onChange={(event) => setPassword(event.target.value)} className="w-full" inputClassName="w-full md:w-30rem" />
                                <label htmlFor="password">Password</label>
                            </span>
                            <Button loading={loading} label="Login" severity="warning" className="w-full btn_login" type="submit"></Button>
                            <br /> <br />
                            {errors.length > 0 &&
                                <Message
                                    style={{
                                        border: 'solid',
                                        borderWidth: '0 0 0 5px'
                                    }}
                                    className="w-full justify-content-start pt-1 pb-1"
                                    severity="error"
                                    content={errors}
                                />
                            }
                        </form>
                    </div>
                </div>
            </div>
        </div >

    );
};
export default LoginPage;



