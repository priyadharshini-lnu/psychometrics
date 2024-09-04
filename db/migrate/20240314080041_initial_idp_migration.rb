class InitialIdpMigration < ActiveRecord::Migration[7.1]
  def change
    create_table :skills do |t|
      t.string :name, null: false
      t.string :description, null: false
      t.integer :category, null: false, default: 0 # 0 - behavioral, 1 - technical, 2 - other

      t.timestamps null: false
    end
    add_index :skills, :name, unique: true

    create_table :skill_translations do |t|
      t.string :name
      t.string :description
      t.string :locale, null: false
      t.references :skill, null: false, foreign_key: true, index: false

      t.timestamps null: false
    end

    add_index :skill_translations, :locale
    add_index :skill_translations, %i[skill_id locale], unique: true
    add_index :skill_translations, %i[name locale]
    add_index :skill_translations, %i[description locale]

    create_table :job_roles do |t|
      t.string :name, null: false
      t.string :description, null: false

      t.timestamps null: false
    end
    add_index :job_roles, :name, unique: true

    create_table :job_role_translations do |t|
      t.string :name
      t.string :description
      t.string :locale, null: false
      t.references :job_role, null: false, foreign_key: true, index: false

      t.timestamps null: false
    end
    add_index :job_role_translations, :locale
    add_index :job_role_translations, %i[job_role_id locale], unique: true
    add_index :job_role_translations, %i[name locale]
    add_index :job_role_translations, %i[description locale]

    create_table :skills_job_roles do |t|
      t.references :skill, null: false, foreign_key: { on_delete: :cascade }
      t.references :job_role, null: false, foreign_key: { on_delete: :cascade }

      t.timestamps null: false
    end


    create_table :development_actions do |t|
      t.references :owner, null: true, foreign_key: { to_table: :clients, on_delete: :cascade }
      t.integer :category, null: false, default: 0 # 0 - development_actions, 1 - online_course, offline_course
      t.integer :learning_style, null: false, default: 0 # 0 - structured_learning, 1 - learning_from_others, 2 - on_the_job
      t.string :name, null: false
      t.string :description, null: false
      t.string :course_url, null: true
      t.string :course_provider, null: true

      t.timestamps null: false
    end

    create_table :course_schedules do |t|
      t.references :development_action, null: false, foreign_key: { on_delete: :cascade }
      t.datetime :start_date_time, null: false
      t.datetime :end_date_time, null: false

      t.timestamps null: false
    end

    create_table :development_action_translations do |t|
      t.string :name
      t.string :description
      t.string :locale, null: false
      t.references :development_action, null: false, foreign_key: true, index: false
      t.timestamps null: false
    end

    add_index :development_action_translations, :locale
    add_index :development_action_translations, %i[development_action_id locale], unique: true
    add_index :development_action_translations, %i[name locale]
    add_index :development_action_translations, %i[description locale]

    create_table :skills_development_actions do |t|
      t.references :skill, null: false, foreign_key: { on_delete: :cascade }
      t.references :development_action, null: false, foreign_key: { on_delete: :cascade }

      t.timestamps null: false
    end

    create_table :idp_templates do |t|
      t.references :owner, null: true, foreign_key: { to_table: :clients, on_delete: :cascade }
      t.string :name, null: false
      t.string :description, null: false
      t.jsonb :level, null: false, default: []
      t.integer :available_skills_selection_type, null: false, default: 0 # 0 - none, 1 - all, 2 - selected
      t.integer :available_development_actions_selection_type, null: false, default: 0 # 0 - none, 1 - all, 2 - selected
      t.integer :suggested_development_actions_selection_type, null: false, default: 0 # 0 - none, 1 - all, 2 - selected
      t.jsonb :skill_gap_datasheet_columns, null: false, default: []
      t.jsonb :skill_gap_profile_field_names, null: false, default: []

      t.timestamps null: false
    end
    add_index :idp_templates, %i[owner_id name], unique: true

    create_table :idp_template_skills do |t|
      t.references :idp_template, null: false, foreign_key: { on_delete: :cascade }
      t.references :skill, null: false, foreign_key: { on_delete: :cascade }
      t.integer :category, null: false, default: 0 # 0 - required, 1 - available
      t.integer :scoring_source # 0 - assessment, 1 - campaign_factor:
      t.references :assessment, foreign_key: { on_delete: :restrict }
      t.string :campaign_factor_code
      t.float :desired_rating
      t.integer :min_rating, default: 0
      t.integer :max_rating, default: 5

      t.timestamps null: false
    end
    add_index :idp_template_skills, %i[idp_template_id skill_id category], unique: true

    create_table :idp_template_development_actions do |t|
      t.references :idp_template, null: false, foreign_key: { on_delete: :cascade }
      t.references :development_action, null: false, foreign_key: { on_delete: :cascade }
      t.integer :category, null: false, default: 0 # 0 - suggested, 1 - available

      t.timestamps null: false
    end
    add_index :idp_template_development_actions, %i[idp_template_id development_action_id category], unique: true

    create_table :user_idp_plans do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.references :idp_template, null: false, foreign_key: { on_delete: :restrict }
      t.references :creator, foreign_key: { to_table: :users, on_delete: :nullify }
      t.integer :status, null: false, default: 0 # 0 - draft, 1 - pending_approval, 2 - approved

      t.timestamps null: false
    end

    create_table :user_idp_skills do |t|
      t.references :user_idp_plan, null: false, foreign_key: { on_delete: :cascade }
      t.references :skill, null: false, foreign_key: { on_delete: :cascade }
      t.float :initial_rating
      t.float :final_rating
    end

    create_table :user_idp_development_actions do |t|
      t.references :user_idp_plan, null: false, foreign_key: { on_delete: :cascade }
      t.references :user_idp_skill, null: false, foreign_key: { on_delete: :cascade }
      t.references :development_action, foreign_key: { on_delete: :cascade }
      t.text :custom_action
      t.integer :progress, null: false, default: 0
      t.datetime :start_date_time
      t.datetime :end_date_time
      t.boolean :private, default: false
    end

    add_reference :campaigns, :default_idp_template, foreign_key: { to_table: :idp_templates, on_delete: :cascade }
  end
end
