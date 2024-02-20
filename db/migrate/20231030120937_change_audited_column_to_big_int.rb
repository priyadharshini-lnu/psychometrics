class ChangeAuditedColumnToBigInt < ActiveRecord::Migration[7.0]
  def change
    change_column :audits, :auditable_id, :bigint
    change_column :audits, :associated_id, :bigint
    change_column :audits, :user_id, :bigint
  end
end
