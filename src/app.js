const fs = require("fs");
const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const { Server: HttpServer } = require("http");
const { Server: IOServer } = require("socket.io");
const app = express();
require('./config');
const Pokes = require("./daoPokemons");
const Carris = require("./daoCarrito");

//express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//server
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

// view engine setup (Para renderizar ejs)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
//Server

const PORT = 8080;
const connectedServer = httpServer.listen(PORT, () => {
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
// "Login" falso para admins


const esAdmin = true;
//LO PONGO EN TRUE PARA QUE VAYA A TODOS LADOS.

function soloParaAdmins(req, res, next) {
  if (esAdmin) {
    next();
  } else {
    return res.sendStatus(403);
  }
}
//---------------------------------------------------------------------------------
// render pagina de inicio
app.get("/", async (req, res) => {
  const datos = await fs.promises.readFile("productos.js", "utf-8");
  const arrayPokemon = JSON.parse(datos);
  const pokemons = arrayPokemon;
  res.render("index", { pokemons });
});
//---------------------------------------------------------------------------------
//render pagina agregar nuevo pokemon
app.get("/newProduct", soloParaAdmins, (req, res) => {
  res.render("newProduct");
});

//---------------------------------------------------------------------------------
//render pagina agregar nuevo pokemon
app.get("/:id/carrito", soloParaAdmins, async (req, res) => {
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
  /*const pokemonBuyID = carritoUser.find(function (car) {
    if (car.id === 0) {
      return car.object.push(pokemonBuy)
    } else {
      return;
    }
  });*/
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
app.get("/:id/edit", soloParaAdmins, async (req, res) => {
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
app.post("/newProduct", soloParaAdmins, async (req, res) => {
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
app.put("/:id", soloParaAdmins, async (req, res) => {
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
app.delete("/:id/edit", soloParaAdmins, async (req, res) => {
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
app.delete("/:id/carrito", soloParaAdmins, async (req, res) => {
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
app.delete("/:id/carrito/delet", soloParaAdmins, async (req, res) => {
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
