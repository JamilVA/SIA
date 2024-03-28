interface EmailTemplateProps {
  firstName: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
}) => (
  <div>
    <h2>Reestablecer contraseña de SIA ESFAP MUA</h2>
    <p>Si olvidaste tu contraseña del SIA ESFAP MUA no te preocupes, tu puedes usar el siguiente botón para reestablecer tu contraseña:</p>
    <a href={process.env.NEXTAUTH_URL + "/auth/password_reset"} style={{backgroundColor:'#4F46E5', color:'white', border:'none', borderRadius:'5px', padding:'3px'}}>Reestablecer contraseña</a>
    <p>Si no usas este link dentro de 3 horas, va a expirar. Para obtener un nuevo link para reestablecer tu conraseña, visita: <a href={process.env.NEXTAUTH_URL + "/auth/password_reset"}>{process.env.HOST + "/auth/password_reset"}</a></p>
    <p>Gracias.</p>
    <p>Soporte ESFAP MUA.</p>
  </div>
);
