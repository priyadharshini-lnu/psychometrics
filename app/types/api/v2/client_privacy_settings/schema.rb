# frozen_string_literal: true

class Api::V2::ClientPrivacySettings::Schema < Api::Base::Schema
  def self.resource
    'client_privacy_settings'
  end

  def self.attributes(_attribute, _)
    proc do
      required(:disable_data_processing).filled(:bool)
    end
  end
end
