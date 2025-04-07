//INVOCAMOS A EXPRESS
const express = require('express');
const app = express();

//PONEMOS URL ENCODED PARA CAPTURAR DATOS DEL FORMULARIO
app.use(express.urlencoded({ extended: false }));
app.use(express.json());//además le decimos a express que vamos a usar json

// INVOCAMOS A DOTENV
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env' });

//PONEMOS EL DIRECTORIO PUBLIC
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

//ESTABLECEMOS EL MOTOR DE PLANTILLAS EJS
app.set('view engine', 'ejs');

//INVOCAMOS A BCRYPTJS
const bcryptjs = require('bcryptjs');

//VAR DE SESSION
const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 60 * 1000 } // 30 minutes
}));

//INVOCAMOS A MYSQL
const connection = require('./database/db');

//console.log(__dirname);

//Configuracion de multer para guardar archivos en REPORTES 
const fs = require('fs');
const path = require('path');
const multer = require('multer');

app.use('/resources', express.static('public'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/REPORTES');
    },
    filename: function (req, file, cb) {
        const filePath = path.join('public/REPORTES', file.originalname);
        fs.access(filePath, fs.constants.F_OK, (err) => {
            let filename;
            if (err) {
                filename = file.originalname; // El archivo no existe, usa el nombre original
            } else {
                const fileExtension = path.extname(file.originalname);
                const basename = path.basename(file.originalname, fileExtension);
                filename = `${basename}-${Date.now()}${fileExtension}`; // El archivo existe, agrega un timestamp al nombre del archivo
            }
            cb(null, filename);
        });
    }
});

const upload = multer({ storage: storage });

//ESTABLECIENDO LAS RUTAS
app.get('/login', (req, res) => {
    res.render('login.ejs');
});

//AUTENTICACION PARA EL LOGIN
app.post('/auth', async (req, res) => {
    const nombre = req.body.nombre;
    const password = req.body.password;
    if (nombre && password) {
        connection.query('SELECT * FROM USUARIOS WHERE NOMBRE_USUARIO = ? AND ESTADO = 1', [nombre], async (error, results) => {
            if (results.length == 0 || password !== results[0].PASSWORD) {
                // res.send('USUARIO Y/O CONTRASEÑA INCORRECTA!');
                res.render('login.ejs', {
                    alertTitle: 'Error',
                    alert: true,
                    alertMessage: 'Usuario y/o contraseña incorrecta',
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: null,
                    ruta: 'login'
                });

            } else {
                //  res.send('BIENVENIDO ' + nombre);
                req.session.loggedin = true;    //VARIABLE DE SESION PARA AUTENTICAR EN LAS DEMAS PAGINAS SI CUMPLE CON LA AUTH
                //SI ESTA TODO BIEN CREAMOS UNA VARIABLE DE SESSION

                req.session.name = results[0].NOMBRE;
                req.session.userType = results[0].TIPO_USUARIO;

                res.render('login.ejs', {
                    alertTitle: 'Conexión exitosa',
                    alert: true,
                    alertMessage: 'LOGIN CORRECTO',
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: '',
                });
            }
        });
    } else {
        //res.send('Por favor ingrese usuario y contraseña');
        res.render('login.ejs', {
            alertTitle: 'ADVETENCIA',
            alert: true,
            alertMessage: 'INGRESA UN USUARIO Y CONTRASEÑA ANTES DE CONTINUAR',
            alertIcon: 'warning',
            showConfirmButton: true,
            timer: null,
            ruta: 'login'
        });
    }
});

// Middleware para verificar si el usuario ha iniciado sesión
function checkLoggedIn(req, res, next) {
    if (req.session.loggedin) {
        next(); // Si el usuario ha iniciado sesión, continúa con la siguiente función en la cadena
    } else {
        res.redirect('/login'); // Si el usuario no ha iniciado sesión, redirígelo a la página de inicio de sesión
    }
}

// Middleware para verificar si el usuario es de tipo 2
function checkUserType(req, res, next) {
    if (req.session.userType !== 2) {
        next(); // Si el usuario no es de tipo 2, continúa con la siguiente función en la cadena
    } else {
        res.send('<script>alert("No tienes permisos para acceder a esta ruta, por favor comunicate con un administrador si crees que esto es un error"); window.location.href = "/";</script>');
    }
}

//AUTENTICACION PARA OTRAS PAGINAS
app.get('/', checkLoggedIn, (req, res) => {
    if (req.session.loggedin) {
        res.render('index.ejs', {
            login: true,
            name: req.session.name,
            userType: req.session.userType
        });
    } else {
        res.render('index.ejs', {
            login: false,
            name: 'Debe iniciar sesión'

        });
    }
});

//LOGOUT
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////USUARIOS
app.get('/usuarios', checkLoggedIn, checkUserType, (req, res) => {
    connection.query('SELECT * FROM USUARIOS JOIN PERSONA ON USUARIOS.IDPERSONA = PERSONA.IDPERSONA WHERE USUARIOS.ESTADO = 1 AND PERSONA.ESTADO = 1', (error, results) => {
        if (error) {
            throw error;
        }
        res.render('usuarios.ejs', {
            login: req.session.loggedin,
            results: results,
            userType: req.session.userType
        });
    });
});

//RUTA CREAR USUARIOS
app.get('/create_usuarios', checkLoggedIn, checkUserType, (req, res) => {
    res.render('create_usuarios.ejs', {
        login: req.session.loggedin,
        userType: req.session.userType
    });
});

//RUTA EDITAR USUARIOS 
app.get('/edit_usuarios/:IDPERSONA/:IDUSUARIOS', checkLoggedIn, checkUserType, (req, res) => {
    const IDPERSONA = req.params.IDPERSONA;
    const IDUSUARIOS = req.params.IDUSUARIOS;
    connection.query('SELECT USUARIOS.*, PERSONA.* FROM USUARIOS INNER JOIN PERSONA ON USUARIOS.IDPERSONA = PERSONA.IDPERSONA WHERE USUARIOS.IDUSUARIOS = ? AND PERSONA.IDPERSONA = ?', [IDUSUARIOS, IDPERSONA], (error, results) => {
        if (error) {
            throw error
        } else {
            res.render('edit_usuarios.ejs', {
                login: req.session.loggedin,
                user: results[0],
                userType: req.session.userType
            });
        };
    }
    );
});

//CRUD PARA USUARIOS
//ELIMINAR
app.get('/delete_usuarios/:IDUSUARIOS', checkLoggedIn, checkUserType, (req, res) => {
    const IDUSUARIOS = req.params.IDUSUARIOS;
    console.log(IDUSUARIOS);

    connection.query('UPDATE USUARIOS SET STATUS = 0 WHERE IDUSUARIOS = ?', [IDUSUARIOS], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.send('<script>alert("Eliminado con Éxito"); window.location.href = "/usuarios";</script>');
        }
    });
});
//GUARDAR 
const crud = require('./controllers/crud');
app.post('/save_usuarios', crud.save_usuarios);
//EDITAR 
app.post('/update_usuarios', crud.update_usuarios);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CLIENTES Y UBICACION
app.get('/ubicacion', checkLoggedIn, (req, res) => {
    connection.query('CALL obtener_ubicaciones()', (error, results) => {
        if (error) {
            throw error;
        }
        res.render('ubicacion.ejs', {
            login: req.session.loggedin,
            results: results[0],
            userType: req.session.userType
        });
    });
});

//RUTA EDITAR UBICACION 
app.get('/edit_ubicacion/:IDUBICACION', checkLoggedIn, (req, res) => {
    const IDUBICACION = req.params.IDUBICACION;
    connection.query('SELECT * FROM UBICACION  WHERE IDUBICACION = ? AND STATUS = 1', [IDUBICACION], (error, results) => {
        if (error) {
            throw error
        } else {
            res.render('edit_ubicacion.ejs', {
                login: req.session.loggedin,
                ubicacion: results[0],
                userType: req.session.userType
            });
        };
    });
});

//RUTA CREAR UBICACIONES
app.get('/create_ubicacion', checkLoggedIn, (req, res) => {
    res.render('create_ubicacion.ejs', {
        login: req.session.loggedin,
        userType: req.session.userType
    });
});

//CRUD PARA UBICACION
//ELIMINAR
app.get('/delete_ubicacion/:IDUBICACION', checkLoggedIn, (req, res) => {
    const IDUBICACION = req.params.IDUBICACION;
    console.log(IDUBICACION);

    connection.query('UPDATE UBICACION SET STATUS = 0 WHERE IDUBICACION = ?', [IDUBICACION], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.send('<script>alert("Eliminado con Éxito"); window.location.href = "/ubicacion";</script>');
        }
    });
});
//AGREGAR
const crud_ubicacion = require('./controllers/crud_ubicacion');
app.post('/save_ubicacion', crud_ubicacion.save_ubicacion);
// EDITAR 
app.post('/update_ubicacion', crud_ubicacion.update_ubicacion);
//


//CLIENTE RUTAS
app.get('/cliente', checkLoggedIn, (req, res) => {
    connection.query('CALL obtener_clientes()', (error, results) => {
        if (error) {
            throw error;
        }
        res.render('cliente.ejs', {
            login: req.session.loggedin,
            results: results[0],
            userType: req.session.userType
        });
    });
});

app.get('/create_cliente', checkLoggedIn, (req, res) => {
    connection.query('SELECT IDUBICACION, DETALLES_EXTRAS FROM ubicacion WHERE STATUS = 1', (error, ubicaciones) => {
        if (error) {
            throw error;
        }
        res.render('create_cliente.ejs', {
            login: req.session.loggedin,
            userType: req.session.userType,
            ubicaciones: ubicaciones
        });
    });
});

app.get('/edit_cliente/:IDCLIENTE/:IDPERSONA/:IDUBICACION', checkLoggedIn, (req, res) => {
    const IDPERSONA = req.params.IDPERSONA;
    const IDCLIENTE = req.params.IDCLIENTE;
    const IDUBICACION = req.params.IDUBICACION;
    connection.query("SELECT c.*, p.* FROM CLIENTE c INNER JOIN PERSONA p ON c.IDPERSONA = p.IDPERSONA WHERE c.IDCLIENTE = ? AND c.STATUS = 1", [IDCLIENTE, IDPERSONA, IDUBICACION], (error, results) => {
        if (error) {
            throw error;
        } else {
            connection.query('SELECT IDUBICACION, DETALLES_EXTRAS FROM ubicacion WHERE STATUS = 1', (error, ubicaciones) => {
                if (error) {
                    throw error;
                }
                res.render('edit_cliente.ejs', {
                    login: req.session.loggedin,
                    userType: req.session.userType,
                    clientesEdit: results[0],
                    ubicaciones: ubicaciones
                });
            });
        }
    });
});


//CRUD PARA CLIENTE / CONTROLADORES
//ELIMINAR
app.get('/delete_cliente/:IDCLIENTE', checkLoggedIn, (req, res) => {
    const IDCLIENTE = req.params.IDCLIENTE;

    // Mostrar confirmación al usuario
    res.send(`
        <script>
            if (confirm("¿Seguro que quieres eliminar el cliente? De ser así, todas las cotizaciones relacionadas a este cliente serán eliminadas también.")) {
                // Si el usuario confirma, realizar la eliminación
                window.location.href = "/delete_cliente_confirmado/${IDCLIENTE}";
            } else {
                window.location.href = "/cliente";
            }
        </script>
    `);
});

app.get('/delete_cliente_confirmado/:IDCLIENTE', checkLoggedIn, (req, res) => {
    const IDCLIENTE = req.params.IDCLIENTE;

    connection.query('UPDATE CLIENTE SET STATUS = 0 WHERE IDCLIENTE = ?', [IDCLIENTE], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.send('<script>alert("Eliminado con Éxito"); window.location.href = "/cliente";</script>');
        }
    });
});

//CONTROLADORES CLIENTE
const crud_cliente = require('./controllers/crud_cliente');
//AGREGAR
app.post('/save_cliente', crud_cliente.save_cliente);
//EDITAR
app.post('/update_cliente', crud_cliente.update_cliente);



app.get('/proveedor', checkLoggedIn, checkUserType, (req, res) => {
    // connection.query('SELECT * FROM vista_proveedor_extendida', (error, results) => {
    connection.query('SELECT PROVEEDOR.IDPROVEEDOR AS IDPROVEEDOR, PROVEEDOR.NOMBRE_EMPRESA AS NOMBRE_EMPRESA, PROVEEDOR.STATUS AS STATUS, PROVEEDOR.TELEFONO AS TELEFONO, PROVEEDOR.EMAIL AS EMAIL FROM PROVEEDOR WHERE PROVEEDOR.STATUS = 1', (error, results) => {
        if (error) {
            throw error;
        }
        res.render('proveedor.ejs', {
            login: req.session.loggedin,
            userType: req.session.userType,
            results: results
        });
    });
});


app.get('/create_proveedor', checkLoggedIn, checkUserType, (req, res) => {
    res.render('create_proveedor.ejs', {
        login: req.session.loggedin
    });
});

app.get('/edit_proveedor/:IDPROVEEDOR', checkLoggedIn, checkUserType, (req, res) => {
    const IDPROVEEDOR = req.params.IDPROVEEDOR;
    connection.query('SELECT * FROM PROVEEDOR  WHERE IDPROVEEDOR = ? AND STATUS = 1', [IDPROVEEDOR], (error, results) => {
        if (error) {
            throw error
        } else {
            res.render('edit_proveedor.ejs', {
                login: req.session.loggedin,
                userType: req.session.userType,
                proveedor: results[0]
            });
        };
    })
})
//CRUDS
//ELIMINAR
app.get('/delete_proveedor/:IDPROVEEDOR', checkLoggedIn, checkUserType, (req, res) => {
    const IDPROVEEDOR = req.params.IDPROVEEDOR;
    console.log(IDPROVEEDOR);

    connection.query('UPDATE PROVEEDOR SET STATUS = 0 WHERE IDPROVEEDOR = ?', [IDPROVEEDOR], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.send('<script>alert("Eliminado con Éxito"); window.location.href = "/proveedor";</script>');
        }
    });
});



//CONTROLADORES PROVEEDOR
const crud_proveedor = require('./controllers/crud_proveedor');
//AGREGAR
app.post('/save_proveedor', crud_proveedor.save_proveedor);
app.post('/update_proveedor', crud_proveedor.update_proveedor);


//PRODUCTO
app.get('/producto', checkLoggedIn, checkUserType, (req, res) => {
    connection.query('SELECT * FROM vista_producto', (error, results) => {
        if (error) {
            throw error;
        }
        res.render('producto.ejs', {
            login: req.session.loggedin,
            userType: req.session.userType,
            results: results
        });
    });
});


app.get('/create_producto', checkLoggedIn, checkUserType, (req, res) => {
    connection.query('SELECT IDPROVEEDOR, NOMBRE_EMPRESA FROM PROVEEDOR WHERE STATUS = 1', (error, proovedores) => {
        if (error) {
            throw error;
        }
        res.render('create_producto.ejs', {
            login: req.session.loggedin,
            userType: req.session.userType,
            proovedores: proovedores
        });
    });
});


app.get('/edit_producto/:IDPRODUCTO', checkLoggedIn, checkUserType, (req, res) => {
    const IDPRODUCTO = req.params.IDPRODUCTO;

    connection.query('SELECT * FROM PRODUCTO  WHERE IDPRODUCTO = ? AND STATUS = 1', [IDPRODUCTO], (error, results) => {
        if (error) {
            throw error;
        } else {
            connection.query('SELECT IDPROVEEDOR, NOMBRE_EMPRESA FROM PROVEEDOR WHERE STATUS = 1', (error, proveedores) => {
                if (error) {
                    throw error;
                }
                res.render('edit_producto.ejs', {
                    login: req.session.loggedin,
                    userType: req.session.userType,
                    productoEdit: results[0],
                    proveedores: proveedores
                });
            });
        }
    });
});

//CRUDS
//ELIMINAR
app.get('/delete_producto/:IDPRODUCTO', checkLoggedIn, checkUserType, (req, res) => {
    const IDPRODUCTO = req.params.IDPRODUCTO;
    console.log(IDPRODUCTO);

    connection.query('UPDATE PRODUCTO SET STATUS = 0 WHERE IDPRODUCTO = ?', [IDPRODUCTO], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.send('<script>alert("Eliminado con Éxito"); window.location.href = "/producto";</script>');
        }
    });
});
//CONTROLADORES PRODUCTOS
const crud_producto = require('./controllers/crud_producto');
//AGREGAR
app.post('/save_producto', crud_producto.save_producto);
app.post('/update_producto', crud_producto.update_producto);



//AFOROS
app.get('/cotizacion_aforo', checkLoggedIn, (req, res) => {
    connection.query('CALL ConsultarCotizacionesAforos()', (error, results) => {
        if (error) {
            throw error;
        }
        // Obtener los productos
        connection.query('SELECT * FROM PRODUCTO WHERE STATUS = 1', (error, productos) => {
            if (error) {
                throw error;
            }
            connection.query('SELECT * FROM MUCHOSCOTIAFORO_PRODUCTO', (error, cotiafoprodu) => {
                if (error) {
                    throw error;
                }
                // Renderizar la vista con los resultados y los productos
                res.render('cotizacion_aforo.ejs', {
                    login: req.session.loggedin,
                    userType: req.session.userType,
                    results: results[0],
                    productos: productos
                });
            })
        });
    });
});


/////////////////////////////////////////////////////////////////////////ELIMINAR PRODUCTOS DE COTIZACIONES DE AFOROS
app.get('/delete_cotiaforoprodu/:IDCOTIZACIONAFORO', checkLoggedIn, (req, res) => {
    const IDCOTIZACIONAFORO = req.params.IDCOTIZACIONAFORO;
    connection.query('SELECT mc.IDCOTIZACIONAFORO, mc.CANTIDAD, p.IDPRODUCTO, p.NOMBRE AS NOMBRE_PRODUCTO FROM MUCHOSCOTIAFORO_PRODUCTO mc JOIN PRODUCTO p ON mc.IDPRODUCTO = p.IDPRODUCTO WHERE mc.IDCOTIZACIONAFORO = ?;', [IDCOTIZACIONAFORO], (error, results) => {
        if (error) {
            throw error;
        }
        res.render('delete_cotiaforoprodu.ejs', {
            login: req.session.loggedin,
            userType: req.session.userType,
            results: results
        });
    });
});

app.get('/Realdelete_productocotiaforo/:IDCOTIZACIONAFORO/:IDPRODUCTO', checkLoggedIn, (req, res) => {
    const IDCOTIZACIONAFORO = req.params.IDCOTIZACIONAFORO;
    const IDPRODUCTO = req.params.IDPRODUCTO;
    connection.query('DELETE FROM MUCHOSCOTIAFORO_PRODUCTO WHERE IDCOTIZACIONAFORO = ? AND IDPRODUCTO = ?', [IDCOTIZACIONAFORO, IDPRODUCTO], (error, results) => {
        if (error) {
            throw error;
        }
        res.send('<script>alert("Eliminado con Éxito"); window.location.href = "/cotizacion_aforo";</script>');
    });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const crud_aforos = require('./controllers/crud_aforos');
app.post('/add_producto', crud_aforos.add_producto);


app.get('/create_cotizacion_aforo', checkLoggedIn, (req, res) => {
    connection.query("SELECT c.IDCLIENTE, CONCAT(p.NOMBRE, ' ', p.APELLIDO_PATERNO, ' ', p.APELLIDO_MATERNO) AS NOMBRE FROM CLIENTE c INNER JOIN PERSONA p ON c.IDPERSONA = p.IDPERSONA WHERE c.STATUS = 1 AND c.QUE_NECESITA = 'AFORO'", (error, clientes) => {
        if (error) {
            throw error;
        }
        res.render('create_cotizacion_aforo.ejs', {
            login: req.session.loggedin,
            userType: req.session.userType,
            clientes: clientes
        });
    });
});

app.post('/save_cotiAforo', crud_aforos.save_cotiAforo);

app.get('/edit_cotizacion_aforo/:IDCOTIZACIONAFORO', checkLoggedIn, (req, res) => {
    const IDCOTIZACIONAFORO = req.params.IDCOTIZACIONAFORO;

    connection.query('SELECT * FROM COTIZACION_AFORO WHERE IDCOTIZACIONAFORO = ? AND STATUS = 1', [IDCOTIZACIONAFORO], (error, results) => {
        if (error) {
            throw error;
        } else {
            connection.query("SELECT c.IDCLIENTE, CONCAT(p.NOMBRE, ' ', p.APELLIDO_PATERNO, ' ', p.APELLIDO_MATERNO) AS NOMBRE_CLIENTE FROM CLIENTE c INNER JOIN PERSONA p ON c.IDPERSONA = p.IDPERSONA WHERE c.STATUS = 1 AND c.QUE_NECESITA = 'AFORO' ", (error, clientes) => {
                if (error) {
                    throw error;
                }
                res.render('edit_cotizacion_aforo.ejs', {
                    login: req.session.loggedin,
                    userType: req.session.userType,
                    cotizacionAforoEdit: results[0],
                    clientes: clientes
                });
            });
        }
    });
});

app.post('/update_cotiAforo', crud_aforos.update_cotiAforo);


//ELIMINAR
app.get('/delete_cotizacion_aforo/:IDCOTIZACIONAFORO', checkLoggedIn, (req, res) => {
    const IDCOTIZACIONAFORO = req.params.IDCOTIZACIONAFORO;
    console.log(IDCOTIZACIONAFORO);

    connection.query('UPDATE COTIZACION_AFORO SET STATUS = 0 WHERE IDCOTIZACIONAFORO = ?', [IDCOTIZACIONAFORO], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.send('<script>alert("Eliminado con Éxito"); window.location.href = "/cotizacion_aforo";</script>');
        }
    });
});

app.post('/upload_reporte_aforo', upload.single('reporte'), (req, res, next) => {
    const IDCOTIZACIONAFORO = req.body.IDCOTIZACIONAFORO_DAR_ALTA;
    const RUTA_REPORTE = req.file.filename;

    console.log(IDCOTIZACIONAFORO, RUTA_REPORTE);

    connection.query('SELECT * FROM MUCHOSCOTIAFORO_PRODUCTO WHERE IDCOTIZACIONAFORO = ?', [IDCOTIZACIONAFORO], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            if (results.length > 0) {
                // IDCOTIZACIONAFORO existe en la tabla muchoscotiaforo_producto, procede con la subida del informe y la actualización del estado
                connection.query('INSERT INTO REPORTE_AFORO SET IDCOTIZACIONAFORO = ?, RUTA_REPORTE = ?, STATUS = 1', [IDCOTIZACIONAFORO, RUTA_REPORTE], (error, results) => {
                    if (error) {
                        console.log(error);
                    } else {
                        connection.query('UPDATE COTIZACION_AFORO SET STATUS = 2 WHERE IDCOTIZACIONAFORO = ?', [IDCOTIZACIONAFORO], (error, results) => {
                            if (error) {
                                console.log(error);
                            } else {
                                res.send('<script>alert("Guardado con Éxito"); window.location.href = "/cotizacion_aforo";</script>');
                            }
                        });
                    }
                });
            } else {
                // IDCOTIZACIONAFORO no existe en la tabla muchoscotiaforo_producto, elimina el archivo y envía un mensaje de error al cliente
                fs.unlink(path.join('public/REPORTES', RUTA_REPORTE), (err) => {
                    if (err) {
                        console.log(err);
                    }
                    res.send('<script>alert("Por favor, agrega un producto antes de dar de alta la cotización."); window.location.href = "/cotizacion_aforo";</script>');
                });
            }
        }
    });
}, (error, req, res, next) => {
    // Este es el middleware de manejo de errores
    if (error instanceof multer.MulterError) {
        // Un error de Multer ocurrió cuando se subió el archivo.
        res.status(500).send('An error occurred while uploading the file.');
    } else if (error) {
        // Un error desconocido ocurrió cuando se subió el archivo.
        res.status(500).send('An unknown error occurred while uploading the file.');
    }
});

//HISTORIALES
app.get('/historiales', checkLoggedIn, (req, res) => {
    res.render('historiales.ejs', {
        login: req.session.loggedin,
        userType: req.session.userType
    });
});

//HISTORIALES AFOROS
app.get(['/historialAforos', '/historialAforos/buscar'], checkLoggedIn, (req, res) => {
    let fecha = req.query.fecha;
    let query = `
    SELECT VENTA_AFORO.*, REPORTE_AFORO.RUTA_REPORTE 
        FROM VENTA_AFORO 
        LEFT JOIN REPORTE_AFORO ON VENTA_AFORO.IDCOTIZACIONAFORO = REPORTE_AFORO.IDCOTIZACIONAFORO
        WHERE VENTA_AFORO.STATUS = 1
    `;

    if (fecha) {
        // Convertir la fecha al formato 'YYYY-MM-DD'
        fecha = new Date(fecha).toISOString().split('T')[0];
        query += ' AND VENTA_AFORO.FECHA = ?';
    }

    connection.query(query, [fecha], (error, results) => {
        if (error) {
            throw error;
        }
        res.render('historialAforos.ejs', {
            login: req.session.loggedin,
            userType: req.session.userType,
            results: results
        });
    });
});


//TICKET VENTA AFORO
app.get('/ticket_venta_aforo/:IDVENTAAFORO/:IDCOTIZACIONAFORO', checkLoggedIn, (req, res) => {
    const IDVENTAAFORO = req.params.IDVENTAAFORO;
    const IDCOTIZACIONAFORO = req.params.IDCOTIZACIONAFORO;

    connection.query('SELECT VENTA_AFORO.*, COTIZACION_AFORO.* ' +
        'FROM VENTA_AFORO ' +
        'JOIN COTIZACION_AFORO ON VENTA_AFORO.IDCOTIZACIONAFORO = COTIZACION_AFORO.IDCOTIZACIONAFORO ' +
        'WHERE VENTA_AFORO.IDVENTAAFORO = ? AND COTIZACION_AFORO.IDCOTIZACIONAFORO = ?', [IDVENTAAFORO, IDCOTIZACIONAFORO], (error, results) => {
            if (error) {
                throw error;
            }
            res.render('ticket_venta_aforo.ejs', {
                login: req.session.loggedin,
                userType: req.session.userType,
                aforo: results[0]
            });
        });
});


//COTIZACIONES EQUIPOS
app.get('/cotizacion_equipo', checkLoggedIn, (req, res) => {
    connection.query('CALL obtener_cotizaciones_equipamiento()', (error, results) => {
        if (error) {
            throw error;
        }
        // Obtener los productos
        connection.query('SELECT * FROM PRODUCTO WHERE STATUS = 1', (error, productos) => {
            if (error) {
                throw error;
            }
            connection.query('SELECT * FROM MUCHOSCOTIEQUIPO_PRODUCTO', (error, cotiequiprodu) => {
                if (error) {
                    throw error;
                }
                // Renderizar la vista con los resultados y los productos
                res.render('cotizacion_equipo.ejs', {
                    login: req.session.loggedin,
                    userType: req.session.userType,
                    results: results[0],
                    productos: productos
                });
            })
        });
    });
})

//////////////////////////////////////////////////////////////////ELIMINAR PRODUCTOS DE COTIZACIONES DE AFOROS
app.get('/delete_cotiequipoprodu/:IDCOTIZACIONEQUIPAMIENTO', checkLoggedIn, (req, res) => {
    const IDCOTIZACIONEQUIPAMIENTO = req.params.IDCOTIZACIONEQUIPAMIENTO;
    connection.query('SELECT mc.IDCOTIZACIONEQUIPAMIENTO, mc.CANTIDAD, p.IDPRODUCTO, p.NOMBRE AS NOMBRE_PRODUCTO FROM MUCHOSCOTIEQUIPO_PRODUCTO mc JOIN PRODUCTO p ON mc.IDPRODUCTO = p.IDPRODUCTO WHERE mc.IDCOTIZACIONEQUIPAMIENTO = ?;', [IDCOTIZACIONEQUIPAMIENTO], (error, results) => {
        if (error) {
            throw error;
        }
        res.render('delete_cotiequipoprodu.ejs', {
            login: req.session.loggedin,
            userType: req.session.userType,
            results: results
        });
    });
});

app.get('/Realdelete_productocotiequipo/:IDCOTIZACIONEQUIPAMIENTO/:IDPRODUCTO', checkLoggedIn, (req, res) => {
    const IDCOTIZACIONEQUIPAMIENTO = req.params.IDCOTIZACIONEQUIPAMIENTO;
    const IDPRODUCTO = req.params.IDPRODUCTO;
    connection.query('DELETE FROM MUCHOSCOTIEQUIPO_PRODUCTO WHERE IDCOTIZACIONEQUIPAMIENTO = ? AND IDPRODUCTO = ?', [IDCOTIZACIONEQUIPAMIENTO, IDPRODUCTO], (error, results) => {
        if (error) {
            throw error;
        }
        res.send('<script>alert("Eliminado con Éxito"); window.location.href = "/cotizacion_equipo";</script>');
    });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const crud_equipos = require('./controllers/crud_equipos');
app.post('/add_producto_cotiequipo', crud_equipos.add_producto_cotiequipo);

app.get('/create_cotizacion_equipo', checkLoggedIn, (req, res) => {
    connection.query("SELECT c.IDCLIENTE, CONCAT(p.NOMBRE, ' ', p.APELLIDO_PATERNO, ' ', p.APELLIDO_MATERNO) AS NOMBRE FROM CLIENTE c INNER JOIN PERSONA p ON c.IDPERSONA = p.IDPERSONA WHERE c.STATUS = 1 AND (c.QUE_NECESITA = 'CFE' OR c.QUE_NECESITA = 'SOLAR')", (error, clientes) => {
        if (error) {
            throw error;
        }
        res.render('create_cotizacion_equipo.ejs', {
            login: req.session.loggedin,
            userType: req.session.userType,
            clientes: clientes
        });
    });
});


app.post('/save_cotiEquipo', crud_equipos.save_cotiEquipo);


app.get('/edit_cotizacion_equipo/:IDCOTIZACIONEQUIPAMIENTO', checkLoggedIn, (req, res) => {
    const IDCOTIZACIONEQUIPAMIENTO = req.params.IDCOTIZACIONEQUIPAMIENTO;

    connection.query('SELECT * FROM COTIZACION_EQUIPAMIENTO WHERE IDCOTIZACIONEQUIPAMIENTO = ? AND STATUS = 1', [IDCOTIZACIONEQUIPAMIENTO], (error, results) => {
        if (error) {
            throw error;
        } else {
            connection.query("SELECT c.IDCLIENTE, CONCAT(p.NOMBRE, ' ', p.APELLIDO_PATERNO, ' ', p.APELLIDO_MATERNO) AS NOMBRE_CLIENTE FROM CLIENTE c INNER JOIN PERSONA p ON c.IDPERSONA = p.IDPERSONA WHERE c.STATUS = 1 AND (c.QUE_NECESITA = 'CFE' OR c.QUE_NECESITA = 'SOLAR')", (error, clientes) => {
                if (error) {
                    throw error;
                }
                res.render('edit_cotizacion_equipo.ejs', {
                    login: req.session.loggedin,
                    userType: req.session.userType,
                    cotizacionEquipoEdit: results[0],
                    clientes: clientes
                });
            });
        }
    });
});

app.post('/update_cotiEquipo', crud_equipos.update_cotiEquipo);


app.get('/delete_cotizacion_equipo/:IDCOTIZACIONEQUIPAMIENTO', checkLoggedIn, (req, res) => {
    const IDCOTIZACIONEQUIPAMIENTO = req.params.IDCOTIZACIONEQUIPAMIENTO;
    console.log(IDCOTIZACIONEQUIPAMIENTO);

    connection.query('UPDATE COTIZACION_EQUIPAMIENTO SET STATUS = 0 WHERE IDCOTIZACIONEQUIPAMIENTO = ?', [IDCOTIZACIONEQUIPAMIENTO], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.send('<script>alert("Eliminado con Éxito"); window.location.href = "/cotizacion_equipo";</script>');
        }
    });
});

//DAR DE ALTA EQUIPO
app.get('/dar_alta_cotizacion_equipo/:IDCOTIZACIONEQUIPAMIENTO', checkLoggedIn, (req, res) => {
    const IDCOTIZACIONEQUIPAMIENTO = req.params.IDCOTIZACIONEQUIPAMIENTO;
    console.log(IDCOTIZACIONEQUIPAMIENTO);

    connection.query('SELECT * FROM MUCHOSCOTIEQUIPO_PRODUCTO WHERE IDCOTIZACIONEQUIPAMIENTO = ?', [IDCOTIZACIONEQUIPAMIENTO], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            if (results.length > 0) {
                connection.query('UPDATE COTIZACION_EQUIPAMIENTO SET STATUS = 2 WHERE IDCOTIZACIONEQUIPAMIENTO = ?', [IDCOTIZACIONEQUIPAMIENTO], (error, results) => {
                    if (error) {
                        console.log(error);
                    } else {
                        res.send('<script>alert("Dado de alta con Éxito"); window.location.href = "/cotizacion_equipo";</script>');
                    }
                });
            } else {
                res.send('<script>alert("Por favor, agrega un producto antes de dar de alta la cotización."); window.location.href = "/cotizacion_equipo";</script>');
            }
        }
    });
});


app.get(['/historialEquipos', '/historialEquipos/buscar'], checkLoggedIn, (req, res) => {
    let fecha = req.query.fecha;
    let query = `
        SELECT VENTA_EQUIPAMIENTO.*
        FROM VENTA_EQUIPAMIENTO 
        WHERE VENTA_EQUIPAMIENTO.STATUS = 1
    `;

    if (fecha) {
        // Convertir la fecha al formato 'YYYY-MM-DD'
        fecha = new Date(fecha).toISOString().split('T')[0];
        query += ' AND VENTA_EQUIPAMIENTO.FECHA = ?';
    }

    connection.query(query, [fecha], (error, results) => {
        if (error) {
            throw error;
        }
        res.render('historialEquipos.ejs', {
            login: req.session.loggedin,
            userType: req.session.userType,
            results: results
        });
    });
});

//TICKET VENTA AFORO
app.get('/ticket_venta_equipo/:IDVENTAEQUIPAMIENTO/:IDCOTIZACIONEQUIPAMIENTO', checkLoggedIn, (req, res) => {
    const IDVENTAEQUIPAMIENTO = req.params.IDVENTAEQUIPAMIENTO;
    const IDCOTIZACIONEQUIPAMIENTO = req.params.IDCOTIZACIONEQUIPAMIENTO;

    connection.query('SELECT VENTA_EQUIPAMIENTO.*, COTIZACION_EQUIPAMIENTO.* ' +
        'FROM VENTA_EQUIPAMIENTO ' +
        'JOIN COTIZACION_EQUIPAMIENTO ON VENTA_EQUIPAMIENTO.IDCOTIZACIONEQUIPAMIENTO = COTIZACION_EQUIPAMIENTO.IDCOTIZACIONEQUIPAMIENTO ' +
        'WHERE VENTA_EQUIPAMIENTO.IDVENTAEQUIPAMIENTO = ? AND COTIZACION_EQUIPAMIENTO.IDCOTIZACIONEQUIPAMIENTO = ?', [IDVENTAEQUIPAMIENTO, IDCOTIZACIONEQUIPAMIENTO], (error, results) => {
            if (error) {
                throw error;
            }
            res.render('ticket_venta_equipo.ejs', {
                login: req.session.loggedin,
                userType: req.session.userType,
                equipo: results[0]
            });
        });
});


//-------------------------------------------------------------------------------------------------------------------------------------------------
app.listen(3000, (req, res) => {
    console.log('Server is running on port 3000');
})


