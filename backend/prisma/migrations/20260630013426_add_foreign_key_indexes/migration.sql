-- CreateIndex
CREATE INDEX "audio_files_setup_id_idx" ON "audio_files"("setup_id");

-- CreateIndex
CREATE INDEX "foams_setup_id_idx" ON "foams"("setup_id");

-- CreateIndex
CREATE INDEX "images_setup_id_idx" ON "images"("setup_id");

-- CreateIndex
CREATE INDEX "keyboards_user_id_idx" ON "keyboards"("user_id");

-- CreateIndex
CREATE INDEX "keycaps_setup_id_idx" ON "keycaps"("setup_id");

-- CreateIndex
CREATE INDEX "plates_setup_id_idx" ON "plates"("setup_id");

-- CreateIndex
CREATE INDEX "setup_sound_tags_tag_id_idx" ON "setup_sound_tags"("tag_id");

-- CreateIndex
CREATE INDEX "setups_keyboard_id_idx" ON "setups"("keyboard_id");

-- CreateIndex
CREATE INDEX "switches_setup_id_idx" ON "switches"("setup_id");
