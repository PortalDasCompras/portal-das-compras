import { describe, it, expect, beforeEach } from "vitest";
import { createOrder, getAllOrders } from "./db";

describe("Checkout - Criação de Pedidos", () => {
  beforeEach(() => {
    // Limpar dados de teste antes de cada teste
  });

  it("deve criar um pedido com dados válidos", async () => {
    const orderData = {
      customerName: "João Silva",
      customerEmail: "joao@test.com",
      customerPhone: "11999999999",
      customerCpf: "12345678901",
      addressCep: "01310100",
      addressStreet: "Avenida Paulista",
      addressNumber: "1000",
      addressNeighborhood: "Centro",
      addressCity: "São Paulo",
      addressState: "SP",
      items: [
        {
          productId: 1,
          name: "Smartphone Samsung Galaxy A12",
          price: 899.99,
          quantity: 1,
          image: "https://via.placeholder.com/300x300",
        },
      ],
      total: 899.99,
      paymentMethod: "pix",
    };

    const order = await createOrder(orderData);

    expect(order).toBeDefined();
    expect(order.id).toBeGreaterThan(0);
    expect(order.customerName).toBe("João Silva");
    expect(order.customerEmail).toBe("joao@test.com");
    expect(order.total).toBe(899.99);
    expect(order.status).toBe("pendente");
    expect(order.paymentMethod).toBe("pix");
  });

  it("deve criar um pedido com múltiplos itens", async () => {
    const orderData = {
      customerName: "Maria Santos",
      customerEmail: "maria@test.com",
      customerPhone: "21988888888",
      customerCpf: "98765432109",
      addressCep: "20040020",
      addressStreet: "Avenida Rio Branco",
      addressNumber: "500",
      addressNeighborhood: "Centro",
      addressCity: "Rio de Janeiro",
      addressState: "RJ",
      items: [
        {
          productId: 1,
          name: "Smartphone",
          price: 899.99,
          quantity: 1,
          image: "https://via.placeholder.com/300x300",
        },
        {
          productId: 2,
          name: "Fone de Ouvido",
          price: 299.99,
          quantity: 2,
          image: "https://via.placeholder.com/300x300",
        },
      ],
      total: 1499.97,
      paymentMethod: "credit_card",
    };

    const order = await createOrder(orderData);

    expect(order).toBeDefined();
    expect(order.id).toBeGreaterThan(0);
    expect(order.total).toBe(1499.97);
    expect(order.paymentMethod).toBe("credit_card");
    expect(Array.isArray(order.items)).toBe(true);
    expect(order.items.length).toBe(2);
  });

  it("deve criar um pedido com método de pagamento boleto", async () => {
    const orderData = {
      customerName: "Pedro Costa",
      customerEmail: "pedro@test.com",
      customerPhone: "85987654321",
      customerCpf: "55566677788",
      addressCep: "60060140",
      addressStreet: "Rua Senador Pompeu",
      addressNumber: "100",
      addressNeighborhood: "Centro",
      addressCity: "Fortaleza",
      addressState: "CE",
      items: [
        {
          productId: 3,
          name: "Camiseta Básica",
          price: 49.99,
          quantity: 3,
          image: "https://via.placeholder.com/300x300",
        },
      ],
      total: 149.97,
      paymentMethod: "boleto",
    };

    const order = await createOrder(orderData);

    expect(order).toBeDefined();
    expect(order.paymentMethod).toBe("boleto");
    expect(order.status).toBe("pendente");
  });

  it("deve listar todos os pedidos criados", async () => {
    // Criar alguns pedidos
    await createOrder({
      customerName: "Cliente 1",
      customerEmail: "cliente1@test.com",
      customerPhone: "11999999999",
      customerCpf: "12345678901",
      addressCep: "01310100",
      addressStreet: "Rua A",
      addressNumber: "100",
      addressNeighborhood: "Centro",
      addressCity: "São Paulo",
      addressState: "SP",
      items: [],
      total: 100,
      paymentMethod: "pix",
    });

    await createOrder({
      customerName: "Cliente 2",
      customerEmail: "cliente2@test.com",
      customerPhone: "21988888888",
      customerCpf: "98765432109",
      addressCep: "20040020",
      addressStreet: "Rua B",
      addressNumber: "200",
      addressNeighborhood: "Centro",
      addressCity: "Rio de Janeiro",
      addressState: "RJ",
      items: [],
      total: 200,
      paymentMethod: "credit_card",
    });

    const orders = await getAllOrders();

    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length).toBeGreaterThanOrEqual(2);
  });

  it("deve preservar dados do cliente corretamente", async () => {
    const orderData = {
      customerName: "Ana Paula Silva Santos",
      customerEmail: "ana.paula@test.com",
      customerPhone: "11987654321",
      customerCpf: "11122233344",
      addressCep: "04543130",
      addressStreet: "Rua das Flores",
      addressNumber: "999",
      addressComplement: "Apto 42",
      addressNeighborhood: "Vila Mariana",
      addressCity: "São Paulo",
      addressState: "SP",
      items: [],
      total: 500,
      paymentMethod: "pix",
    };

    const order = await createOrder(orderData);

    expect(order.customerName).toBe("Ana Paula Silva Santos");
    expect(order.customerEmail).toBe("ana.paula@test.com");
    expect(order.customerPhone).toBe("11987654321");
    expect(order.customerCpf).toBe("11122233344");
    expect(order.addressComplement).toBe("Apto 42");
    expect(order.addressNeighborhood).toBe("Vila Mariana");
  });

  it("deve gerar IDs únicos para cada pedido", async () => {
    const order1 = await createOrder({
      customerName: "Cliente A",
      customerEmail: "a@test.com",
      customerPhone: "11999999999",
      customerCpf: "12345678901",
      addressCep: "01310100",
      addressStreet: "Rua A",
      addressNumber: "100",
      addressNeighborhood: "Centro",
      addressCity: "São Paulo",
      addressState: "SP",
      items: [],
      total: 100,
      paymentMethod: "pix",
    });

    const order2 = await createOrder({
      customerName: "Cliente B",
      customerEmail: "b@test.com",
      customerPhone: "11999999999",
      customerCpf: "12345678901",
      addressCep: "01310100",
      addressStreet: "Rua A",
      addressNumber: "100",
      addressNeighborhood: "Centro",
      addressCity: "São Paulo",
      addressState: "SP",
      items: [],
      total: 100,
      paymentMethod: "pix",
    });

    expect(order1.id).not.toBe(order2.id);
    expect(order1.id).toBeLessThan(order2.id);
  });

  it("deve manter status pendente para novos pedidos", async () => {
    const order = await createOrder({
      customerName: "Novo Cliente",
      customerEmail: "novo@test.com",
      customerPhone: "11999999999",
      customerCpf: "12345678901",
      addressCep: "01310100",
      addressStreet: "Rua A",
      addressNumber: "100",
      addressNeighborhood: "Centro",
      addressCity: "São Paulo",
      addressState: "SP",
      items: [],
      total: 100,
      paymentMethod: "pix",
    });

    expect(order.status).toBe("pendente");
  });

  it("deve armazenar método de pagamento corretamente", async () => {
    const methods = ["pix", "boleto", "credit_card"] as const;

    for (const method of methods) {
      const order = await createOrder({
        customerName: "Cliente",
        customerEmail: `cliente.${method}@test.com`,
        customerPhone: "11999999999",
        customerCpf: "12345678901",
        addressCep: "01310100",
        addressStreet: "Rua A",
        addressNumber: "100",
        addressNeighborhood: "Centro",
        addressCity: "São Paulo",
        addressState: "SP",
        items: [],
        total: 100,
        paymentMethod: method,
      });

      expect(order.paymentMethod).toBe(method);
    }
  });
});
