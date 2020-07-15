# frozen_string_literal: true

class AddUserIdToHoganCredentials < ActiveRecord::Migration[5.1]
  def change
    add_reference :hogan_credentials, :user, foreign_key: { on_delete: :nullify }
    change_column_null :hogan_credentials, :membership_id, true
  end
end
