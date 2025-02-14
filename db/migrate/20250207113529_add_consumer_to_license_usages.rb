# frozen_string_literal: true

class AddConsumerToLicenseUsages < ActiveRecord::Migration[7.1]
  def change
    add_column :license_usages, :consumer_id, :bigint
    add_column :license_usages, :consumer_type, :string
  end
end
