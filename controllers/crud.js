const connection = require('../database/db');

//USUARIOS
exports.save_usuarios = (req, res) => {
    const nombrePersona = req.body.nombrePersona;
    const apellidoPaterno = req.body.apellidoPaterno;
    const apellidoMaterno = req.body.apellidoMaterno;
    const nombreUsuario = req.body.nombreUsuario;
    const password = req.body.password;
    const tipo_Usuario = req.body.tipo_Usuario;

    console.log(nombrePersona, apellidoPaterno, apellidoMaterno, nombreUsuario, password, tipo_Usuario);

    let tipoUsuarioDB;

    if (tipo_Usuario.toLowerCase() === 'admin') {
        tipoUsuarioDB = 1;
    } else if (tipo_Usuario.toLowerCase() === 'empleado') {
        tipoUsuarioDB = 2;
    } else {
        console.log('Tipo de usuario no reconocido');
        return;
    }

    // Verificar si el nombre de usuario ya existe
    connection.query('SELECT * FROM USUARIOS WHERE NOMBRE_USUARIO = ? AND STATUS = 1', [nombreUsuario], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            if (results.length > 0) {
                // El nombre de usuario ya existe
                res.send('<script>alert("El nombre de usuario ya existe. Por favor, intenta con un nombre de usuario diferente."); window.location.href = "/usuarios";</script>');
            } else {
                // El nombre de usuario no existe, proceder a insertar el nuevo usuario
                connection.query('INSERT INTO PERSONA SET NOMBRE = ?, APELLIDO_PATERNO = ?, APELLIDO_MATERNO = ?, STATUS = 1', [nombrePersona, apellidoPaterno, apellidoMaterno], (error, results) => {
                    if (error) {
                        console.log(error);
                    } else {
                        const idPersona = results.insertId;
                        connection.query('INSERT INTO USUARIOS SET IDPERSONA = ?, NOMBRE_USUARIO = ?, PASSWORD = ?, TIPO_USUARIO = ?, STATUS = 1', [idPersona, nombreUsuario, password, tipoUsuarioDB], (error, results) => {
                            if (error) {
                                console.log(error);
                            } else {
                                res.send('<script>alert("Guardado con Éxito"); window.location.href = "/usuarios";</script>');
                            }
                        });
                    }
                });
            }
        }
    });
};

exports.update_usuarios = (req, res) => {
    console.log(req.body); // Imprime el cuerpo de la solicitud en la consola
    const IDPERSONA = req.body.IDPERSONA;
    const IDUSUARIOS = req.body.IDUSUARIOS;
    const NOMBRE = req.body.nombrePersona;
    const APELLIDO_PATERNO = req.body.apellidoPaterno;
    const APELLIDO_MATERNO = req.body.apellidoMaterno;
    const NOMBRE_USUARIO = req.body.nombreUsuario;
    const PASSWORD = req.body.password;
    const tipo_Usuario = req.body.tipo_Usuario;

    let tipoUsuarioDB;

    if (tipo_Usuario.toLowerCase() === 'admin') {
        tipoUsuarioDB = 1;
    } else if (tipo_Usuario.toLowerCase() === 'empleado') {
        tipoUsuarioDB = 2;
    } else {
        console.log('Tipo de usuario no reconocido');
        return;
    }

    console.log(NOMBRE, APELLIDO_PATERNO, APELLIDO_MATERNO, NOMBRE_USUARIO, PASSWORD, tipoUsuarioDB);

    connection.query('UPDATE PERSONA SET NOMBRE = ?, APELLIDO_PATERNO = ?, APELLIDO_MATERNO = ? WHERE IDPERSONA = ?', [NOMBRE, APELLIDO_PATERNO, APELLIDO_MATERNO, IDPERSONA], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            connection.query('UPDATE USUARIOS SET NOMBRE_USUARIO = ?, PASSWORD = ?, TIPO_USUARIO = ? WHERE IDUSUARIOS = ?', [NOMBRE_USUARIO, PASSWORD, tipoUsuarioDB, IDUSUARIOS], (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    // Aquí agregamos un script JavaScript para mostrar una alerta en el navegador
                    res.send('<script>alert("Guardado con Éxito"); window.location.href = "/usuarios";</script>');
                }
            });
        }
    });
}


