
const connection = require('../database/db');


//AGREGAR PRODUCTOS A EQUIPO EXISTENTE
exports.add_producto_cotiequipo = (req, res) => {
    const IDCOTIZACIONEQUIPAMIENTO = req.body.IDCOTIZACIONEQUIPAMIENTO;
    const IDPRODUCTO = req.body.IDPRODUCTO;
    CANTIDAD = req.body.CANTIDAD; // Agregar la cantidad desde la solicitud
    

    connection.query('INSERT INTO MUCHOSCOTIEQUIPO_PRODUCTO (IDCOTIZACIONEQUIPAMIENTO, IDPRODUCTO, CANTIDAD) VALUES (?, ?, ?)', [IDCOTIZACIONEQUIPAMIENTO, IDPRODUCTO, CANTIDAD], (error, results) => {
        if (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                // Manejar el error de entrada duplicada
                res.send('<script>alert("Este producto ya está agregado"); window.location.href = "/cotizacion_equipo";</script>');
            } else {
                // Manejar otros errores de base de datos
                console.log(error);
                res.status(500).send('Error en el servidor');
            }
        } else {
            res.send('<script>alert("Guardado con Éxito"); window.location.href = "/cotizacion_equipo";</script>');
        }
    });
}

exports.save_cotiEquipo = (req, res) => {
    const IDCLIENTE = req.body.IDCLIENTE;
    const MANO_OBRA = req.body.MANO_OBRA;
    const ANTICIPO = req.body.ANTICIPO;
    const PRECIO_FINAL_TOTAL = req.body.PRECIO_FINAL_TOTAL;

    connection.query('INSERT INTO COTIZACION_EQUIPAMIENTO SET IDCLIENTE = ?, MANO_OBRA = ?, ANTICIPO = ?, PRECIO_FINAL_TOTAL = ?, STATUS = 1', [IDCLIENTE, MANO_OBRA, ANTICIPO, PRECIO_FINAL_TOTAL], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.send('<script>alert("Guardado con Éxito"); window.location.href = "/cotizacion_equipo";</script>');
        }
    });
}

exports.update_cotiEquipo = (req, res) => {
    const IDCOTIZACIONEQUIPAMIENTO = req.body.IDCOTIZACIONEQUIPAMIENTO;
    const IDCLIENTE = req.body.IDCLIENTE;
    const MANO_OBRA = req.body.MANO_OBRA;
    const ANTICIPO = req.body.ANTICIPO;
    const PRECIO_FINAL_TOTAL = req.body.PRECIO_FINAL_TOTAL;

    console.log(IDCOTIZACIONEQUIPAMIENTO, IDCLIENTE, MANO_OBRA, ANTICIPO, PRECIO_FINAL_TOTAL);
    connection.query('UPDATE COTIZACION_EQUIPAMIENTO SET IDCLIENTE = ?, MANO_OBRA = ?, ANTICIPO = ?, PRECIO_FINAL_TOTAL = ? WHERE IDCOTIZACIONEQUIPAMIENTO = ?', [IDCLIENTE, MANO_OBRA, ANTICIPO, PRECIO_FINAL_TOTAL, IDCOTIZACIONEQUIPAMIENTO], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.send('<script>alert("Guardado con Éxito"); window.location.href = "/cotizacion_equipo";</script>');
        }
    });
}



