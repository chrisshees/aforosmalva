const connection = require('../database/db');


//AGREGAR PRODUCTOS A AFORO EXISTENTE
exports.add_producto = (req, res) => {
    const IDCOTIZACIONAFORO = req.body.IDCOTIZACIONAFORO;
    const IDPRODUCTO = req.body.IDPRODUCTO;
    const CANTIDAD = req.body.CANTIDAD; // Agregar la cantidad desde la solicitud
    
    connection.query('INSERT INTO MUCHOSCOTIAFORO_PRODUCTO (IDCOTIZACIONAFORO, IDPRODUCTO, CANTIDAD) VALUES (?, ?, ?)', [IDCOTIZACIONAFORO, IDPRODUCTO, CANTIDAD], (error, results) => {
        if (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                // Manejar el error de entrada duplicada
                res.send('<script>alert("Este producto ya está agregado"); window.location.href = "/cotizacion_aforo";</script>');
            } else {
                // Manejar otros errores de base de datos
                console.log(error);
                res.status(500).send('Error en el servidor');
            }
        } else {
            res.send('<script>alert("Guardado con Éxito"); window.location.href = "/cotizacion_aforo";</script>');
        }
    });
}



//AGREGAR AFORO
exports.save_cotiAforo = (req, res) => {
    const IDCLIENTE = req.body.IDCLIENTE;
    const GASTO_DIESEL = req.body.GASTO_DIESEL;
    const PROFUNDIDAD_POZO = req.body.PROFUNDIDAD_POZO;
    const CANTIDAD_AGUA = req.body.CANTIDAD_AGUA;
    const PRECIO_FINAL_TOTAL = req.body.PRECIO_FINAL_TOTAL;
    
    connection.query('INSERT INTO COTIZACION_AFORO SET IDCLIENTE = ?, GASTO_DIESEL = ?, PROFUNDIDAD_POZO = ?, CANTIDAD_AGUA = ?, PRECIO_FINAL_TOTAL = ?, STATUS = 1',[IDCLIENTE, GASTO_DIESEL, PROFUNDIDAD_POZO, CANTIDAD_AGUA, PRECIO_FINAL_TOTAL], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.send('<script>alert("Guardado con Éxito"); window.location.href = "/cotizacion_aforo";</script>');
        }
    });
}

exports.update_cotiAforo = (req, res) => {
    const IDCOTIZACIONAFORO = req.body.IDCOTIZACIONAFORO;
    const IDCLIENTE = req.body.IDCLIENTE;
    const GASTO_DIESEL = req.body.GASTO_DIESEL;
    const PROFUNDIDAD_POZO = req.body.PROFUNDIDAD_POZO;
    const CANTIDAD_AGUA = req.body.CANTIDAD_AGUA;
    const PRECIO_FINAL_TOTAL = req.body.PRECIO_FINAL_TOTAL;
    
    connection.query('UPDATE COTIZACION_AFORO SET IDCLIENTE = ?, GASTO_DIESEL = ?, PROFUNDIDAD_POZO = ?, CANTIDAD_AGUA = ?, PRECIO_FINAL_TOTAL = ? WHERE IDCOTIZACIONAFORO = ?',[IDCLIENTE, GASTO_DIESEL, PROFUNDIDAD_POZO, CANTIDAD_AGUA, PRECIO_FINAL_TOTAL, IDCOTIZACIONAFORO], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.send('<script>alert("Guardado con Éxito"); window.location.href = "/cotizacion_aforo";</script>');
        }
    });
}