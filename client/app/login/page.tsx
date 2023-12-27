"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import '../../styles/login.css'

const LoginPage = () => {
    const [errors, setErrors] = useState<string[]>([]);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrors([]);

        const responseNextAuth = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (responseNextAuth?.error) {
            setErrors(responseNextAuth.error.split(","));
            return;
        }

        router.push("/");
    };

    return (

        <div className="body">
            <div className="card general_container">
                <div className="grid col-6 p-0 login_container">
                    <div className="col-6 img_container">
                        <img style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: '15px 0 0 15px' }} src="https://scontent.fcja2-1.fna.fbcdn.net/v/t1.6435-9/127553878_10158185914267832_1896056533531614513_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=0bb214&_nc_ohc=1ayChWf9kkYAX9Ka0Oj&_nc_ht=scontent.fcja2-1.fna&oh=00_AfAwfMLrOzxEJj3i6f4Y5qBG-p-CA0G8tQGy-j43CDo9OQ&oe=65A335B4" alt="" />
                    </div>

                    <div className="col-6 form_container">
                        <div className="p-3">
                            <h4 className="mt-2" style={{ color: '#000142' }}>Bienvenido(a) a<br />la plataforma<br />SIA-ESFAP</h4>
                        </div>
                        <form onSubmit={handleSubmit} className="p-3">
                            <span className="p-float-label mb-5">
                                <InputText id="email" type="email" value={email} name='email' required onChange={(event) => setEmail(event.target.value)}
                                    style={{ width: '100%' }} />
                                <label htmlFor="email">Email</label>
                            </span>
                            <span className="p-float-label mb-5">
                                <Password id="password" feedback={false} value={password} name='password' tabIndex={1} toggleMask onChange={(event) => setPassword(event.target.value)} className="w-full" inputClassName="w-full md:w-30rem" />
                                <label htmlFor="password">Password</label>
                            </span>
                            <Button label="Login" severity="warning" className="w-full btn_login" type="submit"></Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

    );
};
export default LoginPage;


