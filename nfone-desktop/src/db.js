// src/db.js
import Dexie from "https://esm.sh/dexie";

export const db = new Dexie("NFOneDB");

db.version(1).stores({
  notas: "++id, numero, cliente, data, valor",
  equipamentos: "++id, tipo, potencia, rpm, tensao, valor",
  ordens: "++id, numero, cliente, equipamento, tecnico, status",
  agenda: "++id, dataUnica, titulo, descricao, cor",
});
