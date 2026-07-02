import { pgTable, pgEnum, serial, varchar, text, decimal, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const categoryEnum = pgEnum("category", ["beleza", "casa", "eletronicos", "esportes", "moda", "outros"]);
export const statusEnum = pgEnum("status", ["pendente", "processando", "enviado", "entregue", "cancelado"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }).notNull(),
  category: categoryEnum("category").notNull(),
  image: text("image").notNull(),
  stock: integer("stock").default(10).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
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
  total: decimal("total", { precision: 10, scale: 2 }).notNull().$type<number>(),
  status: statusEnum("status").default("pendente").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }).default("pix").notNull(),
  paymentId: varchar("paymentId", { length: 255 }),
  paymentStatus: varchar("paymentStatus", { length: 50 }),
  pixQrCode: text("pixQrCode"),
  pixCopyPaste: text("pixCopyPaste"),
  barcodeNumber: varchar("barcodeNumber", { length: 255 }),
  barcodePicture: text("barcodePicture"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export const adminSessions = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

export type AdminSession = typeof adminSessions.$inferSelect;
