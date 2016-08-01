# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160801134001) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

# Could not dump table "assessments" because of following StandardError
#   Unknown type 'assessment_categories' for column 'category'

  create_table "blocks", force: :cascade do |t|
    t.string   "name"
    t.integer  "position"
    t.datetime "created_at",    null: false
    t.datetime "updated_at",    null: false
    t.integer  "assessment_id"
    t.datetime "deleted_at"
    t.index ["assessment_id"], name: "index_blocks_on_assessment_id", using: :btree
    t.index ["deleted_at"], name: "index_blocks_on_deleted_at", using: :btree
  end

  create_table "clients", force: :cascade do |t|
    t.string   "name"
    t.integer  "licenses",          default: 0
    t.integer  "licenses_used",     default: 0
    t.date     "licenses_expire"
    t.string   "subdomain"
    t.string   "logo_file_name"
    t.string   "logo_content_type"
    t.integer  "logo_file_size"
    t.datetime "logo_updated_at"
    t.json     "design"
    t.boolean  "disabled",          default: false
    t.datetime "created_at",                        null: false
    t.datetime "updated_at",                        null: false
    t.index ["subdomain"], name: "index_clients_on_subdomain", unique: true, using: :btree
  end

  create_table "comments", force: :cascade do |t|
    t.string   "text"
    t.integer  "created_by"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.integer  "question_id"
    t.index ["question_id"], name: "index_comments_on_question_id", using: :btree
  end

  create_table "dimensions", force: :cascade do |t|
    t.string   "name"
    t.boolean  "disabled",   default: false
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
  end

  create_table "factors", force: :cascade do |t|
    t.string   "name"
    t.integer  "subfactors_count", default: 0
    t.integer  "questions_count",  default: 0
    t.datetime "created_at",                       null: false
    t.datetime "updated_at",                       null: false
    t.integer  "dimension_id"
    t.string   "parent_id"
    t.boolean  "disabled",         default: false
    t.index ["dimension_id"], name: "index_factors_on_dimension_id", using: :btree
    t.index ["parent_id"], name: "index_factors_on_parent_id", using: :btree
  end

# Could not dump table "factors_norms" because of following StandardError
#   Unknown type 'factors_norms_types' for column 'type'

  create_table "norms", force: :cascade do |t|
    t.string   "name"
    t.boolean  "disabled",   default: false
    t.integer  "created_by"
    t.integer  "updated_by"
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
  end

  create_table "questions", force: :cascade do |t|
    t.string   "name"
    t.integer  "position"
    t.string   "type"
    t.json     "props"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer  "block_id"
    t.datetime "deleted_at"
    t.index ["block_id"], name: "index_questions_on_block_id", using: :btree
    t.index ["deleted_at"], name: "index_questions_on_deleted_at", using: :btree
  end

# Could not dump table "users" because of following StandardError
#   Unknown type 'user_roles' for column 'role'

  add_foreign_key "comments", "users", column: "created_by"
  add_foreign_key "norms", "users", column: "created_by"
  add_foreign_key "norms", "users", column: "updated_by"
end
