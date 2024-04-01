import { NextResponse, NextRequest } from 'next/server';
import { EmailTemplate } from '../../../components/EmailTemplate';
import { Resend } from 'resend';
import type { NextApiRequest, NextApiResponse } from 'next';

const resend = new Resend('re_U1vaYTDH_3S6rSE8351NTMC14Avc1NeeU');

export async function POST(req: NextRequest) {
    try {
        let passValue = await new Response(req.body).text();
        let bodyreq = JSON.parse(passValue);
        const data = await resend.emails.send({
            from: 'ESFAP MUA <soporte@esfapmua.edu.pe>',
            to: [bodyreq.email],
            subject: '[SIA ESFAP MUA] Reestablece tu contraseña',
            react: EmailTemplate({ firstName: 'Jhan' }),
            text: '',
        });
        // console.log(data)

        return NextResponse.json(
            { message: 'Email sent' },
            { status: 200 }
        );
    } catch (error) {
        // console.log(error)
        return NextResponse.json(
            { message: 'Error' },
        );
    }
};
