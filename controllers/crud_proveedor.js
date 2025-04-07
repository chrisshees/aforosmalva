const connection = require('../database/db');

//PROVEEDOR
exports.save_proveedor = (req, res) => {
    const NOMBRE_EMPRESA = req.body.NOMBRE_EMPRESA;
    const TELEFONO = req.body.TELEFONO;
    const EMAIL = req.body.EMAIL;
    
    console.log(NOMBRE_EMPRESA);

    connection.query('INSERT INTO PROVEEDOR SET NOMBRE_EMPRESA = ?, TELEFONO = ?, EMAIL = ?, STATUS = 1',[NOMBRE_EMPRESA, TELEFONO, EMAIL],(error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.send('<script>alert("Guardado con Éxito"); window.location.href = "/proveedor";</script>');
        }
    })

}

exports.update_proveedor = (req, res) => {
    console.log(req.body);
    const IDPROVEEDOR = req.body.IDPROVEEDOR;
    const NOMBRE_EMPRESA = req.body.NOMBRE_EMPRESA;
    const TELEFONO = req.body.TELEFONO;
    const EMAIL = req.body.EMAIL;

    console.log(IDPROVEEDOR,NOMBRE_EMPRESA);

    connection.query('UPDATE PROVEEDOR SET NOMBRE_EMPRESA = ?, TELEFONO = ?, EMAIL = ? WHERE IDPROVEEDOR = ?', [NOMBRE_EMPRESA,TELEFONO,EMAIL,IDPROVEEDOR], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.send('<script>alert("Guardado con Éxito"); window.location.href = "/proveedor";</script>');
        }
    });
}