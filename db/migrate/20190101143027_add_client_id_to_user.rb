class AddClientIdToUser < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :project_id, :integer
    add_index :users, [:email, :project_id, :role], unique: true
    remove_index :users, :email
    add_foreign_key :users, :clients, column: :project_id, foreign_key: { on_delete: :cascade }

    Users::Regular.includes(:clients).find_each do |user|
      project = user.clients.find(&:project?)
      if project
        user.project_id = project.id
        user.save!
      end
    end
  end
end
