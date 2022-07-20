const fs = require("fs");
const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const { Server: HttpServer } = require("http");
const { Server: IOServer } = require("socket.io");
const engine = require("ejs-mate");
const session = require('express-session');
const passport = require("passport");
const morgan = require('morgan')
const Pokes = require("./daoPokemons");
const Carris = require("./daoCarrito");
const User = require("./models/user")

const app = express();
require('./config');
require('./passport/local-auth');
const flash = require('connect-flash');

//dotenv y process
require('dotenv').config({path:'./.env'});
const puerto = process.env.PORT || 8080;

//express
app.use(morgan('dev'));
app.use(session({
  secret: 'coderhouse-session',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use((req, res, next) => {
  app.locals.signupMessage = req.flash('signupMessage');
  app.locals.signinMessage = req.flash('signinMessage');
  app.locals.user = req.user;
  next();
});


// view engine setup (Para renderizar ejs)
app.set("views", path.join(__dirname, "views"));
app.engine('ejs', engine);
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

//Server
const httpServer = new HttpServer(app);
const connectedServer = httpServer.listen(puerto, () => {
  console.log(
    `Servidor http escuchando en el puerto ${connectedServer.address().port}`
  );
});
connectedServer.on("error", (error) =>
  console.log(`Error en servidor ${error}`)
);

// FS

/*class Archivo {
  constructor() {
    this.productos = [];
  }

  async guardar(producto) {
    producto.id = this.productos.length + 1;
    const data = this.productos;
    data.push(producto);
    try {
      await fs.promises.writeFile(
        "productos.js",
        JSON.stringify(data, null, "\t")
      );
      return;
    } catch (err) {
      console.log("error al guardar");
    }
  }
}*/
//---------------------------------------------------------------------------------
// Pagina de inicio

app.get("/", isAuthenticated, async (req, res) => {
  const datos = await fs.promises.readFile("productos.js", "utf-8");
  const arrayPokemon = JSON.parse(datos);
  const pokemons = arrayPokemon;
  res.render("index", { pokemons });
});

//---------------------------------------------------------------------------------
//SignIn y SignUp

app.get("/signin", (req, res, next) => {
  res.render("signin");
});

app.post("/signin", passport.authenticate('local-signin' ,{

  successRedirect: '/profile',
  failureRedirect: '/signin',
  passReqToCallback: true
}));

app.get("/signup", (req, res, next) => {
  res.render("signup");
});

app.post("/signup", passport.authenticate('local-signup' ,{
  successRedirect: '/signin',
  failureRedirect: '/signup',
  passReqToCallback: true
}));

app.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { 
      return next(err); 
    }
    res.redirect("/signin");
  });
});

function isAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('/signin')
};

//HOME

app.get("/profile", (req, res) => {
  User.findById(req.user,(err,User)=>{
    if(err){
      console.log(err);
    } else {
      console.log(User);
      return res.render("profile", {User});
    }
  })
  
});

//---------------------------------------------------------------------------------
//render pagina agregar nuevo pokemon

app.get("/newProduct", (req, res) => {
  res.render("newProduct");
});

//---------------------------------------------------------------------------------
//render pagina agregar nuevo pokemon
app.get("/:id/carrito", async (req, res) => {
  const datos = await fs.promises.readFile("carrito.js", "utf-8");
  const arrayPokemonCar = JSON.parse(datos);
  
  return res.render("car", { car: arrayPokemonCar });
});

//---------------------------------------------------------------------------------
//mostrar pokemon en en especifico
app.get("/:id", async (req, res) => {
  const datos = await fs.promises.readFile("productos.js", "utf-8");
  const arrayPokemon = JSON.parse(datos);
  const pokemons = arrayPokemon;
  const id = req.params.id;
  const filter = pokemons.filter(function (array) {
    return array.id == id;
  });
  if (filter.length == 0) {
    return res.json({ error: "producto no encontrado" });
  }
  return res.render("productID", { pokemonID: filter[0] });
});

//---------------------------------------------------------------------------------
//render a carrito
app.post("/:id/carrito", async (req, res) => {
  //const carritoUser = [{id:0, object:[]}];
  const datos = await fs.promises.readFile("productos.js", "utf-8");
  const datosDos = await fs.promises.readFile("carrito.js", "utf-8");
  const arrayPokemonDos = JSON.parse(datosDos);
  const arrayPokemon = JSON.parse(datos);
  const pokemonsDos = arrayPokemonDos;
  const pokemons = arrayPokemon;
  const id = req.params.id;

  const pokemonBuy = pokemons.find(function (pokemonbuyID) {
    if (pokemonbuyID.id == id) {
      return pokemonbuyID;
    } else {
      return;
    }
  });
  pokemonsDos.push(pokemonBuy)

  try {
    fs.promises.writeFile("carrito.js", JSON.stringify(pokemonsDos, null, "\t"));
    console.log("Guardado");
    const {title: title, stock: stock, price: price} = req.body;
    const Carri = new Carris({id: id,title: title, stock: stock, price: price})
    await Carri.save()
  } catch (err) {
    console.log("error al guardar");
  }
  return res.render("car", { car: pokemonsDos });
});

//---------------------------------------------------------------------------------
//mostrar pokemon en especifico
app.get("/:id/edit", async (req, res) => {
  const datos = await fs.promises.readFile("productos.js", "utf-8");
  const arrayPokemon = JSON.parse(datos);
  const pokemons = arrayPokemon;
  const id = req.params.id;
  const filter = pokemons.filter(function (array) {
    return array.id == id;
  });
  if (filter.length == 0) {
    return res.json({ error: "producto no encontrado" });
  }
  res.render("updateProduct", { pokemonEdit: filter[0] });
});

//---------------------------------------------------------------------------------
//render subir al producto.js el nuevo pokemon
app.post("/newProduct", async (req, res) => {
  const datos = await fs.promises.readFile("productos.js", "utf-8");
  const arrayPokemon = JSON.parse(datos);
  const pokemons = arrayPokemon;
  pokemons.push({
    ...req.body,
    price: parseInt(req.body.price),
    stock: parseInt(req.body.stock),
    id: parseInt(pokemons.length + 1),
  });
  try {
    fs.promises.writeFile("productos.js", JSON.stringify(pokemons, null, "\t"));
    const {id: id, title, stock: stock, price: price} = req.body;
    const Poke = new Pokes({id: id,title: title, stock: stock, price: price})
    await Poke.save()
    console.log("Guardado");
  } catch (err) {
    console.log("error al guardar");
  }
  res.render("index", { pokemons });
});

//---------------------------------------------------------------------------------
//editar un pokemon en especifico
app.put("/:id", async (req, res) => {
  const datos = await fs.promises.readFile("productos.js", "utf-8");
  const arrayPokemon = JSON.parse(datos);
  const pokemons = arrayPokemon;
  const id = req.params.id;
  const editPokemon = pokemons.map(function (pokemonEdit) {
    if (pokemonEdit.id == id) {
      return (pokemonEdit = {
        ...req.body,
        price: parseInt(req.body.price),
        stock: parseInt(req.body.stock),
        id: parseInt(id),
      });
    } else {
      return pokemonEdit;
    }
  });
  try {
    fs.promises.writeFile(
      "productos.js",
      JSON.stringify(editPokemon, null, "\t")
    );
    console.log("Guardado");
    const {id: id, title, stock: stock, price: price} = req.body;
    await Pokes.findByIdAndUpdate(id, {id: id, title: title, stock: stock, price: price})
  } catch (err) {
    console.log("error al guardar");
  }
  res.render("index", { pokemons });
});

//---------------------------------------------------------------------------------
//borrar un pokemon en especifico
app.delete("/:id/edit", async (req, res) => {
  const datos = await fs.promises.readFile("productos.js", "utf-8");
  const arrayPokemon = JSON.parse(datos);
  const pokemons = arrayPokemon;
  const id = req.params.id;
  const filter = pokemons.filter(function (array) {
    return array.id != id;
  });
  try {
    fs.promises.writeFile("productos.js", JSON.stringify(filter, null, "\t"));
    console.log("Guardado");
    await Pokes.findByIdAndDelete(id)
  } catch (err) {
    console.log("error al guardar");
  }
  res.render("index", { pokemons });
});

//---------------------------------------------------------------------------------
app.delete("/:id/carrito", async (req, res) => {
  const datos = await fs.promises.readFile("carrito.js", "utf-8");
  const arrayPokemon = JSON.parse(datos);
  const carritoUser = arrayPokemon;
  const id = req.params.id;
  const filter = carritoUser.filter(function (array) {
    return array.id != id;
  });
  try {
    fs.promises.writeFile("carrito.js", JSON.stringify(filter, null, "\t"));
    console.log("Guardado");
    await Carris.findByIdAndDelete(id)
  } catch (err) {
    console.log("error al guardar");
  }
  res.render("car", { car: carritoUser });
});

//---------------------------------------------------------------------------------
app.delete("/:id/carrito/delet", async (req, res) => {
  const pokemon = [];


  try {
    fs.promises.writeFile("carrito.js", JSON.stringify(pokemon, null, "\t"));
    console.log("Guardado");
  } catch (err) {
    console.log("error al guardar");
  }
  res.render("car", { car: pokemon });
});

//---------------------------------------------------------------------------------
