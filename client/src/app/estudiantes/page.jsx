"use client";

import axios from "axios";
import React from "react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

import Table from "react-bootstrap/Table";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";


const page = () => {
  const [estudianteData, setEstudianteData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await axios("http://localhost:3001/api/estudiante");
      setEstudianteData(result.data.estudiantes);
      console.log(result.data.estudiantes);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Container>
      <Card>
        <Card.Header></Card.Header>
        <Card.Body>
          <h1>Lista Estudiantes</h1>
          <Table striped hover>
            <thead>
              <tr>
                <th>Nombres Completos</th>
                <th>Codigo</th>
                <th>Correo</th>
                <th>DNI</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {estudianteData.map((estudiante, i) => {
                return (
                  <tr key={i}>
                    <td>
                      {estudiante.Persona.nombres +
                        " " +
                        estudiante.Persona.paterno +
                        " " +
                        estudiante.Persona.materno}
                    </td>
                    <td>{estudiante.codigoSunedu}</td>
                    <td>{estudiante.Persona.email}</td>
                    <td>{estudiante.Persona.DNI}</td>
                    <td>
                      <Button onClick={() => {}} variant="info">
                        Ver
                      </Button>
                      <Button
                        className="m-2"
                        onClick={() => {}}
                        variant="warning"
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() => {
                          eliminar(estudiante);
                        }}
                        variant="danger"
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default page;
