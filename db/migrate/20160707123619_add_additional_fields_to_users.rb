class AddAdditionalFieldsToUsers < ActiveRecord::Migration[5.0]
  def change
    execute <<-SQL
      CREATE TYPE user_roles AS ENUM ('superadmin', 'admin', 'manager', 'user');
    SQL

    change_table :users do |t|
      t.column :first_name, :string
      t.column :last_name, :string
      t.column :disabled, :boolean, default: false
      t.column :role, :user_roles, default: :user
    end
  end
end
