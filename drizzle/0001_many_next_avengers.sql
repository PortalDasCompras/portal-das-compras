CREATE TABLE `admin_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `admin_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_sessions_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`customerPhone` varchar(20) NOT NULL,
	`customerCpf` varchar(14) NOT NULL,
	`addressCep` varchar(9) NOT NULL,
	`addressStreet` varchar(255) NOT NULL,
	`addressNumber` varchar(20) NOT NULL,
	`addressComplement` varchar(100),
	`addressNeighborhood` varchar(100) NOT NULL,
	`addressCity` varchar(100) NOT NULL,
	`addressState` varchar(2) NOT NULL,
	`items` json NOT NULL,
	`total` decimal(10,2) NOT NULL,
	`status` enum('pendente','processando','enviado','entregue','cancelado') NOT NULL DEFAULT 'pendente',
	`paymentMethod` varchar(50) NOT NULL DEFAULT 'pix',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`originalPrice` decimal(10,2) NOT NULL,
	`category` enum('beleza','casa','eletronicos','esportes','moda','outros') NOT NULL,
	`image` text NOT NULL,
	`stock` int NOT NULL DEFAULT 10,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
