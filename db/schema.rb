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

ActiveRecord::Schema.define(version: 20160719133948) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "dimensions", force: :cascade do |t|
    t.string   "name"
    t.boolean  "favourite"
    t.boolean  "disabled"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
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

  create_table "norms", force: :cascade do |t|
    t.string   "name"
    t.boolean  "disabled",   default: false
    t.integer  "created_by"
    t.integer  "updated_by"
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
  end

# Could not dump table "users" because of following StandardError
#   Unknown type 'user_roles' for column 'role'

  add_foreign_key "norms", "users", column: "created_by"
  add_foreign_key "norms", "users", column: "updated_by"
end
