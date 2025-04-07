const connection = require('../database/db');

exports.save_producto = (req, res) => {
    console.log(req.body);
    const NOMBRE = req.body.NOMBRE;
    const PRECIO = req.body.PRECIO;
    const DETALLES_EXTRAS = req.body.DETALLES_EXTRAS;
    const IDPROVEEDOR = req.body.IDPROVEEDOR;

    console.log(NOMBRE, PRECIO, DETALLES_EXTRAS, IDPROVEEDOR);

    connection.query('INSERT INTO PRODUCTO SET NOMBRE = ?, PRECIO = ?, DETALLES_EXTRAS = ?, STATUS = 1, IDPROVEEDOR = ?',[NOMBRE, PRECIO, DETALLES_EXTRAS, IDPROVEEDOR], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.send('<script>alert("Guardado con Éxito"); window.location.href = "/producto";</script>');
        }
    });
}

exports.update_producto = (req, res) => {
    console.log(req.body);
    const IDPRODUCTO = req.body.IDPRODUCTO;
    const NOMBRE = req.body.NOMBRE;
    const PRECIO = req.body.PRECIO;
    const DETALLES_EXTRAS = req.body.DETALLES_EXTRAS;
    const IDPROVEEDOR = req.body.IDPROVEEDOR;

    console.log(NOMBRE, PRECIO, DETALLES_EXTRAS, IDPROVEEDOR);

    connection.query('UPDATE PRODUCTO SET NOMBRE = ?, PRECIO = ?, DETALLES_EXTRAS = ?, STATUS = 1, IDPROVEEDOR = ? WHERE IDPRODUCTO = ?',[NOMBRE, PRECIO, DETALLES_EXTRAS, IDPROVEEDOR, IDPRODUCTO], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.send('<script>alert("Guardado con Éxito"); window.location.href = "/producto";</script>');
        }
    });
}
