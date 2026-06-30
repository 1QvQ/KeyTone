-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "keyboards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "layout" TEXT NOT NULL,
    "colour" TEXT NOT NULL,
    "image_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "keyboards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "setups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keyboard_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "typing_feel" INTEGER NOT NULL DEFAULT 5,
    "favourite" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "setups_keyboard_id_fkey" FOREIGN KEY ("keyboard_id") REFERENCES "keyboards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "switches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "setup_id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "lubed" BOOLEAN NOT NULL DEFAULT false,
    "filmed" BOOLEAN NOT NULL DEFAULT false,
    "spring" TEXT,
    CONSTRAINT "switches_setup_id_fkey" FOREIGN KEY ("setup_id") REFERENCES "setups" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "keycaps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "setup_id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "profile" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    CONSTRAINT "keycaps_setup_id_fkey" FOREIGN KEY ("setup_id") REFERENCES "setups" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "plates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "setup_id" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    CONSTRAINT "plates_setup_id_fkey" FOREIGN KEY ("setup_id") REFERENCES "setups" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "foams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "setup_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "foams_setup_id_fkey" FOREIGN KEY ("setup_id") REFERENCES "setups" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audio_files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "setup_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "duration" INTEGER,
    "format" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audio_files_setup_id_fkey" FOREIGN KEY ("setup_id") REFERENCES "setups" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "setup_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "caption" TEXT,
    CONSTRAINT "images_setup_id_fkey" FOREIGN KEY ("setup_id") REFERENCES "setups" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sound_tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tag" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "setup_sound_tags" (
    "setup_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    PRIMARY KEY ("setup_id", "tag_id"),
    CONSTRAINT "setup_sound_tags_setup_id_fkey" FOREIGN KEY ("setup_id") REFERENCES "setups" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "setup_sound_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "sound_tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sound_tags_tag_key" ON "sound_tags"("tag");
