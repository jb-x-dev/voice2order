CREATE TABLE `articleHistory` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`articleId` varchar(128) NOT NULL,
	`articleName` text NOT NULL,
	`supplier` varchar(256),
	`ean` varchar(64),
	`unit` varchar(32),
	`lastPrice` int,
	`orderCount` int DEFAULT 0,
	`lastOrderedAt` datetime,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `articleHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`transcription` text,
	`audioUrl` text,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`items` text,
	`totalAmount` int,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weeklyOrderSuggestions` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`weekNumber` int NOT NULL,
	`year` int NOT NULL,
	`weekStartDate` datetime NOT NULL,
	`weekEndDate` datetime NOT NULL,
	`items` text NOT NULL,
	`totalAmount` int,
	`confidence` int DEFAULT 0,
	`isApproved` boolean DEFAULT false,
	`approvedAt` datetime,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `weeklyOrderSuggestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `article_history`;--> statement-breakpoint
DROP TABLE `jbx_settings`;--> statement-breakpoint
DROP TABLE `order_items`;--> statement-breakpoint
DROP TABLE `voice_orders`;