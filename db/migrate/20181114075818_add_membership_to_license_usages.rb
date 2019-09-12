# frozen_string_literal: true

class AddMembershipToLicenseUsages < ActiveRecord::Migration[5.1]
  def change
    add_reference :license_usages, :membership, foreign_key: { on_delete: :cascade }
  end
end
