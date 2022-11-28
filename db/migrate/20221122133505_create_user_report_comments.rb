class CreateUserReportComments < ActiveRecord::Migration[6.1]
  def change
    create_table :user_report_comments do |t|
      t.references :parent, foreign_key: { to_table: :comments, on_delete: :cascade }
      t.references :user_report, foreign_key: { on_delete: :cascade }
      t.references :reports_module, foreign_key: { on_delete: :cascade }
      t.references :creator, foreign_key: { to_table: :users, on_delete: :cascade }
      t.string :text
      t.boolean :resolved, default: false
      t.datetime :deleted_at
      t.references :deleted_by, foreign_key: { on_delete: :nullify, to_table: :users }

      t.timestamps
    end
  end
end
