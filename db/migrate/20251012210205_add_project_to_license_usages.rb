# frozen_string_literal: true

class AddProjectToLicenseUsages < ActiveRecord::Migration[7.1]
  def change
    add_reference :license_usages, :project, foreign_key: { to_table: :clients }
    add_reference :license_usages, :project_license, foreign_key: true
  end
end
