-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    customerName VARCHAR(255) NOT NULL,
    customerEmail VARCHAR(255) NOT NULL,
    customerPhone VARCHAR(20) NOT NULL,
    customerCpf VARCHAR(14) NOT NULL,
    addressCep VARCHAR(9) NOT NULL,
    addressStreet VARCHAR(255) NOT NULL,
    addressNumber VARCHAR(20) NOT NULL,
    addressComplement VARCHAR(100),
    addressNeighborhood VARCHAR(100) NOT NULL,
    addressCity VARCHAR(100) NOT NULL,
    addressState VARCHAR(2) NOT NULL,
    items JSONB NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    paymentMethod VARCHAR(50),
    paymentId VARCHAR(255),
    paymentStatus VARCHAR(50),
    pixQrCode TEXT,
    pixCopyPaste TEXT,
    barcodeNumber VARCHAR(255),
    barcodePicture TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir usuário admin
INSERT INTO users (email, password, name, role) 
VALUES ('admin@portalcompras.com', 'admin123', 'Admin', 'admin')
ON CONFLICT (email) DO NOTHING;
