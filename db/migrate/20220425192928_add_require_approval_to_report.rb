# frozen_string_literal: true

class AddRequireApprovalToReport < ActiveRecord::Migration[5.2]
  def change
    add_column :reports, :require_approval, :boolean, default: false
  end
end
