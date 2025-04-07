
const connection = require('../database/db');

//UBICACION
exports.save_ubicacion = (req, res) => {
    const DISTANCIA = req.body.DISTANCIA;
    const DETALLES_EXTRAS = req.body.DETALLES_EXTRAS;

    console.log(DISTANCIA, DETALLES_EXTRAS);

    connection.query('INSERT INTO UBICACION SET DISTANCIA = ?, DETALLES_EXTRAS = ?, STATUS = 1', [DISTANCIA, DETALLES_EXTRAS], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.send('<script>alert("Guardado con Éxito"); window.location.href = "/ubicacion";</script>');
        }
    });
}

exports.update_ubicacion = (req, res) => {
    console.log(req.body); // Imprime el cuerpo de la solicitud en la consola
    const IDUBICACION = req.body.IDUBICACION;
    const DISTANCIA = req.body.DISTANCIA;
    const DETALLES_EXTRAS = req.body.DETALLES_EXTRAS;

    console.log(DISTANCIA, DETALLES_EXTRAS);

    connection.query('UPDATE UBICACION SET DISTANCIA = ?, DETALLES_EXTRAS = ? WHERE IDUBICACION = ?', [DISTANCIA, DETALLES_EXTRAS, IDUBICACION], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.send('<script>alert("Guardado con Éxito"); window.location.href = "/ubicacion";</script>');
        }
    });
}