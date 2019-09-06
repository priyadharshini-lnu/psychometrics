class CreateTableThreesixtySubjects < ActiveRecord::Migration[5.1]
  def change
    create_table :threesixty_subjects do |t|
      t.belongs_to :campaign, foreign_key: { on_delete: :restrict }
      t.belongs_to :campaigns_user, foreign_key: { on_delete: :restrict }

      t.timestamps
    end

    remove_column :campaigns_users, :users_id
    add_reference :campaigns_users, :user, foreign_key: { on_delete: :restrict }
  end
end
