"use client";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Navbar from "react-bootstrap/Navbar";
import Alert from "react-bootstrap/Alert";
import { Container } from "react-bootstrap";

import { useState, useEffect } from "react";
import Axios from "axios";
import Swal from "sweetalert2";

const page = () => {
  const [nombres, setNombres] = useState("");
  const [paterno, setPaterno] = useState("");
  const [materno, setMaterno] = useState("");
  const [email, setEmail] = useState("");
  const [sexo, setSexo] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState();
  const [DNI, setDNI] = useState("");
  const [codigoSunedu, setCodigoSunedu] = useState("");
  const [rutaFoto, setRutaFoto] = useState("");

  // const [creditosLlevados, setCreditosLlevados] = useState(0);
  // const [creditosAprobados, setCreditosAprobados] = useState(0);

  // const [codigo, setCodigo] = useState("");

  const create = () => {
    Axios.post("http://localhost:3001/api/estudiante", {
      paterno: paterno,
      materno: materno,
      nombres: nombres,
      email: email,
      sexo: sexo,
      rutaFoto: "/rutaFoto",
      fechaNacimiento: fechaNacimiento,
      DNI: DNI,
      codigoSunedu: codigoSunedu,
      creditosLlevados: 0,
      creditosAprobados: 0,
    }).then(() => {
      limpiarCampos;

      Swal.fire({
        title: "<strong>Estudiante Registrado!</strong>",
        html: "<i>" + nombres + " fue registrado con éxito</i>",
        icon: "success",
      });
    });
  };

  const limpiarCampos = () => {
    setEditar(false);
    setNombre("");
    setPaterno("");
    setMaterno("");
    setEmail("");
    setSexo("");
    setFechaNacimiento("");
    setDNI("");
    setCodigo("");
    setCodigoSunedu("");
    setCreditosLlevados("");
    setCreditosAprobados("");
  };

  return (
    <Container>
      <Navbar>
        <Container>
          <Navbar.Brand>CRUD Estudiantes</Navbar.Brand>
        </Container>
      </Navbar>
      <Container>
        <h1>Registrar Estudiante</h1>
        <Alert variant="warning">
          Ingresar correctamente los datos del nuevo estudiante a registrar!
        </Alert>
      </Container>
      <Form>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Nombres</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nombres del estudiante"
            onChange={(event) => {
              setNombres(event.target.value);
            }}
            value={nombres}
          />
        </Form.Group>

        <Row>
          <Col>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Apellido paterno</Form.Label>
              <Form.Control
                type="text"
                placeholder="Apellido paterno del estudiante"
                onChange={(event) => {
                  setPaterno(event.target.value);
                }}
                value={paterno}
              />
            </Form.Group>
          </Col>

          <Col>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Apellido materno</Form.Label>
              <Form.Control
                type="text"
                placeholder="Apellido materno del estudiante"
                onChange={(event) => {
                  setMaterno(event.target.value);
                }}
                value={materno}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Correo institucional del estudiante"
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            value={email}
          />
        </Form.Group>

        <Row>
          <Col>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>DNI</Form.Label>
              <Form.Control
                type="text"
                placeholder="DNI del estudiante"
                onChange={(event) => {
                  setDNI(event.target.value);
                }}
                value={DNI}
              />
            </Form.Group>
          </Col>

          <Col>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Código Sunedu</Form.Label>
              <Form.Control
                type="text"
                placeholder="Código Sunedu del estudiante"
                value={codigoSunedu}
                onChange={(event) => {
                  setCodigoSunedu(event.target.value);
                }}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Fecha de nacimiento</Form.Label>
              <Form.Control
                type="date"
                placeholder="Seleccione una fecha"
                onChange={(event) => {
                  setFechaNacimiento(event.target.value);
                }}
                value={fechaNacimiento}
              />
            </Form.Group>
          </Col>

          <Col>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Sexo</Form.Label>
              <Form.Select
                aria-label="Default select example"
                onChange={(event) => {
                  setSexo(event.target.value);
                }}
                value={sexo}
              >
                <option>Seleccionar</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Foto</Form.Label>
          <Form.Control
            data-show-preview="true"
            type="file"
            placeholder="Foto del estudiante"
            onChange={(event) => {
              // setRutaFoto(event.target.value);
            }}
            // value={rutaFoto}
          />
        </Form.Group>

        <Button
          onClick={() => {
            create();
          }}
          variant="success"
        >
          Guardar
        </Button>
      </Form>
    </Container>
  );
};

export default page;
