const connection = require('../database/db');

//CLIENTE
exports.save_cliente = (req, res) => {
    console.log(req.body);
    const nombrePersona = req.body.nombrePersona;
    const apellidoPaterno = req.body.apellidoPaterno;
    const apellidoMaterno = req.body.apellidoMaterno;
    const IDubicacion = req.body.IDubicacion;
    const QUE_NECESITA = req.body.QUE_NECESITA;

    console.log(nombrePersona, apellidoPaterno, apellidoMaterno, IDubicacion, QUE_NECESITA);

    connection.query('INSERT INTO PERSONA SET NOMBRE = ?, APELLIDO_PATERNO = ?, APELLIDO_MATERNO = ?, STATUS = 1', [nombrePersona, apellidoPaterno, apellidoMaterno], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            const idPersona = results.insertId;
            connection.query('INSERT INTO CLIENTE SET IDPERSONA = ?, IDUBICACION = ?, QUE_NECESITA = ?, STATUS = 1', [idPersona, IDubicacion, QUE_NECESITA], (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    res.send('<script>alert("Guardado con Éxito"); window.location.href = "/cliente";</script>');
                }
            });
        }
    });
}

exports.update_cliente = (req, res) => {
    console.log(req.body);
    const IDCLIENTE = req.body.IDCLIENTE;
    const IDPERSONA = req.body.IDPERSONA;
    const IDUBICACION = req.body.IDubicacion;
    const NOMBRE = req.body.nombrePersona;
    const APELLIDO_PATERNO = req.body.apellidoPaterno;
    const APELLIDO_MATERNO = req.body.apellidoMaterno;
    const QUE_NECESITA = req.body.QUE_NECESITA;

    console.log(IDCLIENTE, IDPERSONA, IDUBICACION, NOMBRE, APELLIDO_PATERNO, APELLIDO_MATERNO, QUE_NECESITA);
    connection.query('UPDATE PERSONA SET NOMBRE = ?, APELLIDO_PATERNO = ?, APELLIDO_MATERNO = ? WHERE IDPERSONA = ?', [NOMBRE, APELLIDO_PATERNO, APELLIDO_MATERNO, IDPERSONA], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            connection.query('UPDATE CLIENTE SET IDUBICACION = ?, QUE_NECESITA = ? WHERE IDCLIENTE = ?', [IDUBICACION, QUE_NECESITA, IDCLIENTE], (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    res.send('<script>alert("Actualizado con Éxito"); window.location.href = "/cliente";</script>');
                }
            });
        }
    }
)};