import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), '.local-db');
const PRODUCTS_FILE = path.join(DB_DIR, 'products.json');
const ORDERS_FILE = path.join(DB_DIR, 'orders.json');
const USERS_FILE = path.join(DB_DIR, 'users.json');

// Garantir que o diretório existe
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  originalPrice: number;
  category: string;
  image: string;
  stock: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpf: string;
  addressCep: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement?: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  items: any[];
  total: number;
  status: string;
  paymentMethod: string;
  paymentId?: string;
  paymentStatus?: string;
  pixQrCode?: string;
  pixCopyPaste?: string;
  barcodeNumber?: string;
  barcodePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}

// Carregar dados do arquivo ou retornar array vazio
function loadData<T>(file: string, defaultValue: T[] = []): T[] {
  try {
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Erro ao carregar ${file}:`, error);
  }
  return defaultValue;
}

// Salvar dados no arquivo
function saveData<T>(file: string, data: T[]): void {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Erro ao salvar ${file}:`, error);
  }
}

// Gerenciador de produtos
let products: Product[] = loadData<Product>(PRODUCTS_FILE);
let nextProductId = Math.max(...products.map(p => p.id), 0) + 1;
console.log(`[LocalDB] Carregados ${products.length} produtos do arquivo`);

export const productDb = {
  getAll: () => products.filter(p => p.active),
  getById: (id: number) => products.find(p => p.id === id),
  getByCategory: (category: string) => products.filter(p => p.active && p.category === category),
  search: (query: string) => products.filter(p => 
    p.active && (
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description?.toLowerCase().includes(query.toLowerCase())
    )
  ),
  create: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const product: Product = {
      ...data,
      id: nextProductId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    products.push(product);
    saveData(PRODUCTS_FILE, products);
    return product;
  },
  update: (id: number, data: Partial<Product>) => {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    products[index] = {
      ...products[index],
      ...data,
      id,
      createdAt: products[index].createdAt,
      updatedAt: new Date(),
    };
    saveData(PRODUCTS_FILE, products);
    return products[index];
  },
  delete: (id: number) => {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return false;
    products.splice(index, 1);
    saveData(PRODUCTS_FILE, products);
    return true;
  },
};

// Gerenciador de pedidos
let orders: Order[] = loadData<Order>(ORDERS_FILE);
let nextOrderId = Math.max(...orders.map(o => o.id), 0) + 1;

export const orderDb = {
  getAll: () => orders,
  getById: (id: number) => orders.find(o => o.id === id),
  getByEmail: (email: string) => orders.filter(o => o.customerEmail === email),
  create: (data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const order: Order = {
      ...data,
      id: nextOrderId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    orders.push(order);
    saveData(ORDERS_FILE, orders);
    return order;
  },
  update: (id: number, data: Partial<Order>) => {
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return null;
    orders[index] = {
      ...orders[index],
      ...data,
      id,
      createdAt: orders[index].createdAt,
      updatedAt: new Date(),
    };
    saveData(ORDERS_FILE, orders);
    return orders[index];
  },
};

// Gerenciador de usuários
let users: User[] = loadData<User>(USERS_FILE);
let nextUserId = Math.max(...users.map(u => u.id), 0) + 1;

export const userDb = {
  getAll: () => users,
  getById: (id: number) => users.find(u => u.id === id),
  getByOpenId: (openId: string) => users.find(u => u.openId === openId),
  create: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastSignedIn'>) => {
    const user: User = {
      ...data,
      id: nextUserId++,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
    users.push(user);
    saveData(USERS_FILE, users);
    return user;
  },
  update: (id: number, data: Partial<User>) => {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    users[index] = {
      ...users[index],
      ...data,
      id,
      createdAt: users[index].createdAt,
      updatedAt: new Date(),
    };
    saveData(USERS_FILE, users);
    return users[index];
  },
  upsertByOpenId: (openId: string, data: Partial<User>) => {
    let user = users.find(u => u.openId === openId);
    if (user) {
      user = {
        ...user,
        name: data.name !== undefined ? data.name : user.name,
        email: data.email !== undefined ? data.email : user.email,
        loginMethod: data.loginMethod !== undefined ? data.loginMethod : user.loginMethod,
        role: data.role || user.role,
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };
      const index = users.findIndex(u => u.id === user!.id);
      if (index !== -1) users[index] = user;
    } else {
      user = {
        id: nextUserId++,
        openId,
        name: data.name || null,
        email: data.email || null,
        loginMethod: data.loginMethod || null,
        role: data.role || 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };
      users.push(user);
    }
    saveData(USERS_FILE, users);
    return user;
  },
};
