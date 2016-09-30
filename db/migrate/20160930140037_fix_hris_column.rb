class FixHrisColumn < ActiveRecord::Migration[5.0]
  def change
    change_column(:users, :hris, :jsonb, default: {})
  end
end
