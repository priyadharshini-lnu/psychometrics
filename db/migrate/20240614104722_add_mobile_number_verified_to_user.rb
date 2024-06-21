class AddMobileNumberVerifiedToUser < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :mobile_verified, :boolean, default: false

    reversible do |dir|
      dir.up do
        execute <<-SQL
          UPDATE users
          SET mobile_verified = true
          WHERE mobile_number IS NOT NULL
        SQL
      end
    end
  end
end
