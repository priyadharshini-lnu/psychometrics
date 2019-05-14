class AddUserAssessments < ActiveRecord::Migration[5.1]
  def change
    create_table :users_assessments do |t|
      t.belongs_to :assessment, foreign_key: { on_delete: :restrict }
      t.belongs_to :user, foreign_key: { on_delete: :restrict }
      t.belongs_to :campaign, foreign_key: { on_delete: :restrict }
      t.string :selected_locale
      t.timestamps
    end
    add_index(:users_assessments, %i[user_id campaign_id assessment_id], unique: true)
  end
end
