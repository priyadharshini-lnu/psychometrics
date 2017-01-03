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

ActiveRecord::Schema.define(version: 20161215061834) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "assessment_clients", force: :cascade do |t|
    t.integer  "assessment_id"
    t.integer  "client_id"
    t.datetime "created_at",    null: false
    t.datetime "updated_at",    null: false
    t.index ["assessment_id"], name: "index_assessment_clients_on_assessment_id", using: :btree
    t.index ["client_id"], name: "index_assessment_clients_on_client_id", using: :btree
  end

# Could not dump table "assessments" because of following StandardError
#   Unknown type 'assessment_categories' for column 'category'

  create_table "assigns", force: :cascade do |t|
    t.integer  "assessment_id"
    t.jsonb    "results"
    t.jsonb    "scoring"
    t.jsonb    "embedded_data"
    t.integer  "status",        default: 0
    t.integer  "role",          default: 0
    t.datetime "completed_at"
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
    t.integer  "step"
    t.integer  "membership_id"
    t.jsonb    "norm_data"
    t.jsonb    "agile_scoring"
    t.datetime "started_at"
    t.index ["membership_id"], name: "index_assigns_on_membership_id", using: :btree
  end

  create_table "blocks", force: :cascade do |t|
    t.string   "name"
    t.integer  "position"
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
    t.integer  "assessment_id"
    t.datetime "deleted_at"
    t.json     "props"
    t.integer  "view",          default: 0
    t.boolean  "disabled",      default: false
    t.integer  "template_id"
    t.index ["assessment_id"], name: "index_blocks_on_assessment_id", using: :btree
    t.index ["template_id"], name: "index_blocks_on_template_id", using: :btree
  end

  create_table "client_reports", force: :cascade do |t|
    t.integer  "client_id"
    t.integer  "report_id"
    t.datetime "created_at",        null: false
    t.datetime "updated_at",        null: false
    t.datetime "access_reports_at"
    t.index ["client_id"], name: "index_client_reports_on_client_id", using: :btree
    t.index ["report_id"], name: "index_client_reports_on_report_id", using: :btree
  end

  create_table "clients", force: :cascade do |t|
    t.string   "name"
    t.integer  "licenses",        default: 0
    t.integer  "licenses_used",   default: 0
    t.date     "licenses_expire"
    t.string   "subdomain"
    t.string   "logo"
    t.json     "design"
    t.boolean  "disabled",        default: false
    t.datetime "created_at",                      null: false
    t.datetime "updated_at",                      null: false
    t.string   "background"
    t.index ["subdomain"], name: "index_clients_on_subdomain", unique: true, using: :btree
  end

  create_table "comments", force: :cascade do |t|
    t.string   "text"
    t.integer  "created_by"
    t.datetime "created_at",       null: false
    t.datetime "updated_at",       null: false
    t.integer  "commentable_id"
    t.string   "commentable_type"
  end

  create_table "communication_emails", force: :cascade do |t|
    t.integer  "membership_id"
    t.integer  "communication_id"
    t.datetime "created_at",       null: false
    t.datetime "updated_at",       null: false
    t.index ["communication_id"], name: "index_communication_emails_on_communication_id", using: :btree
    t.index ["membership_id"], name: "index_communication_emails_on_membership_id", using: :btree
  end

  create_table "communications", force: :cascade do |t|
    t.string   "subject"
    t.text     "body"
    t.integer  "assessment_id"
    t.integer  "client_id"
    t.integer  "recipients",        default: 0
    t.boolean  "disabled",          default: false
    t.integer  "delivery_rule",     default: 0
    t.datetime "delivery_at"
    t.string   "delivery_interval"
    t.datetime "created_at",                        null: false
    t.datetime "updated_at",                        null: false
    t.index ["assessment_id"], name: "index_communications_on_assessment_id", using: :btree
    t.index ["client_id"], name: "index_communications_on_client_id", using: :btree
  end

  create_table "communications_copy_memberships", id: false, force: :cascade do |t|
    t.integer "communication_id", null: false
    t.integer "membership_id",    null: false
    t.index ["communication_id", "membership_id"], name: "index_communications_copy_memberships", using: :btree
  end

  create_table "communications_memberships", id: false, force: :cascade do |t|
    t.integer "communication_id", null: false
    t.integer "membership_id",    null: false
    t.index ["communication_id", "membership_id"], name: "index_communications_memberships", using: :btree
  end

  create_table "data_geos", force: :cascade do |t|
    t.string   "country_code"
    t.string   "country_name"
    t.string   "region_code"
    t.string   "region_name"
    t.string   "city"
    t.datetime "created_at",   null: false
    t.datetime "updated_at",   null: false
  end

  create_table "dimensions", force: :cascade do |t|
    t.string   "name"
    t.boolean  "disabled",      default: false
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
    t.integer  "factors_count", default: 0
  end

  create_table "factors", force: :cascade do |t|
    t.string   "name"
    t.integer  "subfactors_count", default: 0
    t.datetime "created_at",                       null: false
    t.datetime "updated_at",                       null: false
    t.integer  "dimension_id"
    t.integer  "parent_id"
    t.boolean  "disabled",         default: false
    t.string   "icon"
    t.text     "description"
    t.index ["dimension_id"], name: "index_factors_on_dimension_id", using: :btree
    t.index ["parent_id"], name: "index_factors_on_parent_id", using: :btree
  end

# Could not dump table "factors_norms" because of following StandardError
#   Unknown type 'factors_norms_types' for column 'type'

  create_table "factors_scoring", force: :cascade do |t|
    t.json    "props"
    t.integer "factor_id"
    t.integer "assessment_id"
    t.integer "question_id"
    t.index ["assessment_id"], name: "index_factors_scoring_on_assessment_id", using: :btree
    t.index ["factor_id"], name: "index_factors_scoring_on_factor_id", using: :btree
    t.index ["question_id"], name: "index_factors_scoring_on_question_id", using: :btree
  end

  create_table "libraries", force: :cascade do |t|
    t.string   "name"
    t.text     "description"
    t.integer  "type",           default: 0
    t.string   "file"
    t.integer  "parent_id"
    t.integer  "lft",                        null: false
    t.integer  "rgt",                        null: false
    t.integer  "depth",          default: 0, null: false
    t.integer  "children_count", default: 0, null: false
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
    t.index ["lft"], name: "index_libraries_on_lft", using: :btree
    t.index ["parent_id"], name: "index_libraries_on_parent_id", using: :btree
    t.index ["rgt"], name: "index_libraries_on_rgt", using: :btree
  end

  create_table "memberships", force: :cascade do |t|
    t.integer  "client_id"
    t.integer  "user_id"
    t.integer  "parent_id"
    t.integer  "lft"
    t.integer  "rgt"
    t.integer  "depth"
    t.integer  "children_count"
    t.jsonb    "hris",           default: {}
    t.boolean  "disabled",       default: false
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
    t.index ["client_id", "user_id"], name: "index_memberships_on_client_id_and_user_id", unique: true, using: :btree
    t.index ["client_id"], name: "index_memberships_on_client_id", using: :btree
    t.index ["hris"], name: "index_memberships_on_hris", using: :gin
    t.index ["lft"], name: "index_memberships_on_lft", using: :btree
    t.index ["parent_id"], name: "index_memberships_on_parent_id", using: :btree
    t.index ["rgt"], name: "index_memberships_on_rgt", using: :btree
    t.index ["user_id"], name: "index_memberships_on_user_id", using: :btree
  end

  create_table "norms", force: :cascade do |t|
    t.string   "name"
    t.boolean  "disabled",     default: false
    t.integer  "created_by"
    t.integer  "updated_by"
    t.datetime "created_at",                   null: false
    t.datetime "updated_at",                   null: false
    t.integer  "dimension_id"
    t.index ["dimension_id"], name: "index_norms_on_dimension_id", using: :btree
  end

  create_table "notifications", force: :cascade do |t|
    t.string   "text"
    t.datetime "created_at",    null: false
    t.datetime "updated_at",    null: false
    t.integer  "assessment_id"
    t.integer  "membership_id"
    t.index ["assessment_id"], name: "index_notifications_on_assessment_id", using: :btree
    t.index ["membership_id"], name: "index_notifications_on_membership_id", using: :btree
  end

  create_table "occupations", force: :cascade do |t|
    t.string   "name"
    t.string   "icon"
    t.text     "description"
    t.integer  "dimension_id"
    t.datetime "created_at",                         null: false
    t.datetime "updated_at",                         null: false
    t.text     "full_description"
    t.text     "potential_areas_of_study"
    t.text     "key_career_tracks"
    t.text     "high_school_entry_roles"
    t.text     "diploma_qualification"
    t.text     "bachelors_or_masters_qualification"
    t.index ["dimension_id"], name: "index_occupations_on_dimension_id", using: :btree
  end

  create_table "occupations_factors", force: :cascade do |t|
    t.integer  "occupation_id"
    t.integer  "factor_id"
    t.string   "predicate"
    t.float    "value"
    t.datetime "created_at",    null: false
    t.datetime "updated_at",    null: false
    t.index ["factor_id"], name: "index_occupations_factors_on_factor_id", using: :btree
    t.index ["occupation_id"], name: "index_occupations_factors_on_occupation_id", using: :btree
  end

  create_table "questions", force: :cascade do |t|
    t.string   "name"
    t.integer  "position"
    t.string   "type"
    t.json     "props"
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
    t.integer  "block_id"
    t.datetime "deleted_at"
    t.json     "required_validation"
    t.json     "validation"
    t.json     "display_logic"
    t.json     "skip_logic"
    t.integer  "view",                default: 0
    t.boolean  "disabled",            default: false
    t.integer  "template_id"
    t.integer  "assessment_id"
    t.index ["assessment_id"], name: "index_questions_on_assessment_id", using: :btree
    t.index ["block_id"], name: "index_questions_on_block_id", using: :btree
    t.index ["template_id"], name: "index_questions_on_template_id", using: :btree
  end

  create_table "reports", force: :cascade do |t|
    t.integer  "assessment_id"
    t.string   "name"
    t.boolean  "disabled",      default: false
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
    t.index ["assessment_id"], name: "index_reports_on_assessment_id", using: :btree
  end

  create_table "reports_filters", force: :cascade do |t|
    t.integer  "report_id"
    t.string   "name"
    t.json     "conditions"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["report_id"], name: "index_reports_filters_on_report_id", using: :btree
  end

  create_table "reports_modules", force: :cascade do |t|
    t.integer  "page_id"
    t.string   "name"
    t.json     "props"
    t.integer  "position"
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string   "type"
    t.index ["page_id"], name: "index_reports_modules_on_page_id", using: :btree
  end

  create_table "reports_pages", force: :cascade do |t|
    t.integer  "report_id"
    t.string   "name"
    t.json     "props"
    t.integer  "position"
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["report_id"], name: "index_reports_pages_on_report_id", using: :btree
  end

  create_table "tasks", force: :cascade do |t|
    t.integer  "membership_id"
    t.integer  "factor_id"
    t.integer  "assessment_id"
    t.string   "name"
    t.text     "description"
    t.integer  "priority"
    t.integer  "status"
    t.datetime "planned_completed_at"
    t.datetime "completed_at"
    t.datetime "created_at",           null: false
    t.datetime "updated_at",           null: false
    t.integer  "parent_id"
    t.index ["assessment_id"], name: "index_tasks_on_assessment_id", using: :btree
    t.index ["factor_id"], name: "index_tasks_on_factor_id", using: :btree
    t.index ["membership_id"], name: "index_tasks_on_membership_id", using: :btree
  end

  create_table "translations", force: :cascade do |t|
    t.string   "translateable_type"
    t.integer  "translateable_id"
    t.json     "props",                        default: {}
    t.string   "locale",             limit: 4
    t.datetime "created_at",                                null: false
    t.datetime "updated_at",                                null: false
    t.string   "resource_type"
    t.integer  "resource_id"
    t.index ["resource_type", "resource_id"], name: "index_translations_on_resource_type_and_resource_id", using: :btree
    t.index ["translateable_type", "translateable_id"], name: "index_translations_on_translateable_type_and_translateable_id", using: :btree
  end

  create_table "users", force: :cascade do |t|
    t.string   "email",                             default: "",              null: false
    t.string   "encrypted_password",                default: "",              null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",                     default: 0,               null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet     "current_sign_in_ip"
    t.inet     "last_sign_in_ip"
    t.datetime "created_at",                                                  null: false
    t.datetime "updated_at",                                                  null: false
    t.string   "first_name"
    t.string   "last_name"
    t.boolean  "disabled",                          default: false
    t.string   "role",                              default: "Users::Member"
    t.string   "invitation_token"
    t.datetime "invitation_created_at"
    t.datetime "invitation_sent_at"
    t.datetime "invitation_accepted_at"
    t.integer  "invitation_limit"
    t.string   "invited_by_type"
    t.integer  "invited_by_id"
    t.integer  "invitations_count",                 default: 0
    t.string   "authentication_token",   limit: 30
    t.boolean  "is_anonym",                         default: false
    t.index ["authentication_token"], name: "index_users_on_authentication_token", unique: true, using: :btree
    t.index ["email"], name: "index_users_on_email", unique: true, using: :btree
    t.index ["invitation_token"], name: "index_users_on_invitation_token", unique: true, using: :btree
    t.index ["invitations_count"], name: "index_users_on_invitations_count", using: :btree
    t.index ["invited_by_id"], name: "index_users_on_invited_by_id", using: :btree
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree
  end

  add_foreign_key "comments", "users", column: "created_by", on_delete: :nullify
  add_foreign_key "memberships", "clients", on_delete: :cascade
  add_foreign_key "memberships", "users", on_delete: :cascade
  add_foreign_key "norms", "users", column: "created_by", on_delete: :nullify
  add_foreign_key "norms", "users", column: "updated_by", on_delete: :nullify
end
