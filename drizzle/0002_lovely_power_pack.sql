ALTER TABLE `orders` ADD `paymentId` varchar(255);--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentStatus` varchar(50);--> statement-breakpoint
ALTER TABLE `orders` ADD `pixQrCode` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `pixCopyPaste` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `barcodeNumber` varchar(255);--> statement-breakpoint
ALTER TABLE `orders` ADD `barcodePicture` text;