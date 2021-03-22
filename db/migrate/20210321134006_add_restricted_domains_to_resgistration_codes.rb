# frozen_string_literal: true

class AddRestrictedDomainsToResgistrationCodes < ActiveRecord::Migration[5.2]
  def change
    add_column :registration_codes, :restricted_domains, :text, array: true
  end
end
