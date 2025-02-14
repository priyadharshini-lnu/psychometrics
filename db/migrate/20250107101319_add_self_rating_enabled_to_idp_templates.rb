# frozen_string_literal: true

class AddSelfRatingEnabledToIdpTemplates < ActiveRecord::Migration[7.1]
  def change
    add_column :idp_templates, :self_rating_enabled, :boolean, default: false
  end
end
