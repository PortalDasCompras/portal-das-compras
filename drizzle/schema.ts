import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }).notNull(),
  category: mysqlEnum("category", ["beleza", "casa", "eletronicos", "esportes", "moda", "outros"]).notNull(),
  image: text("image").notNull(),
  stock: int("stock").default(10).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  customerCpf: varchar("customerCpf", { length: 14 }).notNull(),
  addressCep: varchar("addressCep", { length: 9 }).notNull(),
  addressStreet: varchar("addressStreet", { length: 255 }).notNull(),
  addressNumber: varchar("addressNumber", { length: 20 }).notNull(),
  addressComplement: varchar("addressComplement", { length: 100 }),
  addressNeighborhood: varchar("addressNeighborhood", { length: 100 }).notNull(),
  addressCity: varchar("addressCity", { length: 100 }).notNull(),
  addressState: varchar("addressState", { length: 2 }).notNull(),
  items: json("items").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pendente", "processando", "enviado", "entregue", "cancelado"]).default("pendente").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }).default("pix").notNull(),
  paymentId: varchar("paymentId", { length: 255 }),
  paymentStatus: varchar("paymentStatus", { length: 50 }),
  pixQrCode: text("pixQrCode"),
  pixCopyPaste: text("pixCopyPaste"),
  barcodeNumber: varchar("barcodeNumber", { length: 255 }),
  barcodePicture: text("barcodePicture"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export const adminSessions = mysqlTable("admin_sessions", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

export type AdminSession = typeof adminSessions.$inferSelect;
