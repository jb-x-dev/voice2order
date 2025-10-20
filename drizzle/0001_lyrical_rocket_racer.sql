CREATE TABLE `article_history` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`articleId` varchar(64) NOT NULL,
	`articleName` varchar(255) NOT NULL,
	`supplier` varchar(255),
	`ean` varchar(20),
	`unit` varchar(50),
	`lastPrice` int,
	`orderCount` int DEFAULT 1,
	`lastOrderedAt` timestamp DEFAULT (now()),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `article_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jbx_settings` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`jbxUsername` varchar(255),
	`jbxPassword` text,
	`jbxOrganization` varchar(255),
	`defaultCostCenter` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `jbx_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` varchar(64) NOT NULL,
	`voiceOrderId` varchar(64) NOT NULL,
	`articleName` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`unit` varchar(50),
	`matchedArticleId` varchar(64),
	`matchedArticleName` text,
	`matchedSupplier` varchar(255),
	`matchedPrice` int,
	`confidence` int,
	`confirmed` boolean DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `voice_orders` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`audioUrl` text,
	`transcription` text,
	`status` enum('pending','processing','completed','error') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `voice_orders_id` PRIMARY KEY(`id`)
);
