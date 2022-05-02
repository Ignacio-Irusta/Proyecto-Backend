const fs = require("fs");
const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const { Server: HttpServer } = require("http");
const { Server: IOServer } = require("socket.io");
const app = express();
const productos = require("../productos");

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
//preguntar como sobreescribir el productos.js sin que cambie a formato json (que quede como array de objetos exportable)
//cambiar inpur de url a imagen
//---------------------------------------------------------------------------------
// "Login" falso para admins

const esAdmin = true;

function soloParaAdmins(req, res, next) {
  if (esAdmin) {
    next();
  } else {
    return res.sendStatus(403);
  }
}

// render pagina de inicio
app.get("/", (req, res) => {
  const pokemons = productos;
  res.render("index", { pokemons });
});

//render pagina agregar nuevo pokemon
app.get("/newProduct", soloParaAdmins, (req, res) => {
  res.render("newProduct");
});

//mostrar pokemon en en especifico
app.get("/:id", (req, res) => {
  const pokemons = productos;
  const id = req.params.id;
  const filter = pokemons.filter(function (array) {
    return array.id == id;
  });
  if (filter.length == 0) {
    return res.json({ error: "producto no encontrado" });
  }
  return res.render("productID", { pokemonID: filter[0] });
});

//mostrar pokemon en especifico
app.get("/:id/edit", soloParaAdmins, (req, res) => {
  const pokemons = productos;
  const id = req.params.id;
  const filter = pokemons.filter(function (array) {
    return array.id == id;
  });
  if (filter.length == 0) {
    return res.json({ error: "producto no encontrado" });
  }
  res.render("updateProduct", { pokemonEdit: filter[0] });
});

//render subir al producto.js el nuevo pokemon
app.post("/newProduct", soloParaAdmins, (req, res) => {
  const pokemons = productos;
  pokemons.push({
    ...req.body,
    price: parseInt(req.body.price),
    stock: parseInt(req.body.stock),
    id: parseInt(pokemons.length + 1),
  });
  //sobreescribir el productos.js sin que cambie a formato json (que quede como array de objetos exportable)
  res.render("index", { pokemons });
});

//editar un pokemon en especifico
app.put("/:id", soloParaAdmins, (req, res) => {
  const id = req.params.id;
  const pokemons = productos;
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
    console.log("holabuenas");
  } catch (err) {
    console.log("error al guardar");
  }
  res.render("index", { pokemons });
});

//borrar un pokemon en especifico
app.delete("/:id/edit", soloParaAdmins, (req, res) => {
  const id = req.params.id;
  const pokemons = productos;
  const filter = pokemons.filter(function (array) {
    return array.id != id;
  });
  //sobreescribir el productos.js sin que cambie a formato json (que quede como array de objetos exportable)
  //preguntar sobre el mal renderizado a index y css
  res.render("index", { pokemons });
});

//---------------------------------------------------------------------------------
