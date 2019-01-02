class AddClientIdToUser < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :project_id, :integer
    add_index :users, [:email, :project_id, :role], unique: true
    remove_index :users, :email
    add_foreign_key :users, :clients, column: :project_id, foreign_key: { on_delete: :cascade }

    Membership.includes(:user).where(role: ['project_admin', 'client_admin']).find_each do |m|
      user = Users::Admin.find_by(email: m.user.email, project_id: nil)
      unless user
        user = Users::Admin.new(m.user.attributes.except('role', 'id', 'authentication_token', 'project_id', 'invitation_token', 'reset_password_token'))
        user.save(validate: false)
      end

      m.user_id = user.id
      m.save(validate: false)
    end


    Users::Regular.includes(:clients, :memberships).select do |user|
      member = user.memberships.find { |m| ['member', 'manager'].include?(m.role) && m.client.project? }
      if member
        user.project_id = member.client_id
        user.save!
      end
    end
  end
end
