class AddThreesixtyRelations < ActiveRecord::Migration[5.1]
  def change
    create_table :campaigns do |t|
      t.belongs_to :project, foreign_key: { to_table: :clients, on_delete: :restrict }
      t.string :name
      t.integer :type

      t.timestamps
    end
    execute "SELECT setval('campaigns_id_seq', 10000)"
    create_table :threesixty_campaigns do |t|
      t.belongs_to :campaign, foreign_key: { on_delete: :restrict }
      t.belongs_to :assessment, foreign_key: { on_delete: :restrict }
      t.belongs_to :report, foreign_key: { on_delete: :restrict }
      t.integer :status

      t.timestamps
    end
    create_table :threesixty_options do |t|
      t.belongs_to :threesixty_campaign, foreign_key: { on_delete: :restrict }
      t.jsonb :participants
      t.jsonb :messages
      t.jsonb :reports

      t.timestamps
    end
    create_table :relationships do |t|
      t.belongs_to :campaign, foreign_key: { on_delete: :restrict }
      t.string :name
      t.integer :type
      t.timestamps
    end
    create_table :campaigns_users do |t|
      t.belongs_to :campaign, foreign_key: { on_delete: :restrict }
      t.belongs_to :users, foreign_key: { on_delete: :restrict }
      t.timestamps
    end
    create_table :participants do |t|
      t.belongs_to :project, foreign_key: { to_table: :clients, on_delete: :restrict }
      t.belongs_to :campaign, foreign_key: { on_delete: :restrict }
      t.belongs_to :relationship, foreign_key: { on_delete: :restrict }
      t.belongs_to :subject, foreign_key: { to_table: :campaigns_users, on_delete: :restrict }
      t.belongs_to :evaluator, foreign_key: { to_table: :campaigns_users, on_delete: :restrict }
      t.integer :manager_status
      t.integer :evaluator_status
      t.timestamps
    end
    create_table :email_templates do |t|
      t.belongs_to :campaign, foreign_key: { on_delete: :restrict }
      t.string :subject
      t.text :body
      t.string :from_email
      t.string :from_name
      t.jsonb :translations
      t.integer :type

      t.timestamps
    end

    add_reference :assigns, :evaluator, foreign_key: { to_table: :campaigns_users, on_delete: :restrict }
    add_reference :assigns, :subject, foreign_key: { to_table: :campaigns_users, on_delete: :restrict }
    add_reference :assigns, :campaign, foreign_key: { on_delete: :restrict }
  end
end
