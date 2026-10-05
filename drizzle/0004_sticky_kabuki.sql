CREATE TABLE `item_stores` (
	`item_id` integer NOT NULL,
	`store_id` integer NOT NULL,
	PRIMARY KEY(`item_id`, `store_id`),
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`image_uri` text,
	`quantity` real DEFAULT 1 NOT NULL,
	`unit` text DEFAULT 'pcs' NOT NULL,
	`priority` text DEFAULT 'Medium' NOT NULL,
	`category_id` integer,
	`avg_consume_days` integer,
	`last_purchased_at` integer,
	`checked_at` integer,
	`to_buy` integer DEFAULT false NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_items`("id", "name", "image_uri", "quantity", "unit", "priority", "category_id", "avg_consume_days", "last_purchased_at", "checked_at", "to_buy", "notes", "created_at", "updated_at") SELECT "id", "name", "image_uri", "quantity", "unit", "priority", "category_id", "avg_consume_days", "last_purchased_at", "checked_at", "to_buy", "notes", "created_at", "updated_at" FROM `items`;--> statement-breakpoint
DROP TABLE `items`;--> statement-breakpoint
ALTER TABLE `__new_items` RENAME TO `items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;