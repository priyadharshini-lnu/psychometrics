# frozen_string_literal: true

class ClientFeature < ApplicationRecord
  belongs_to :client
  include ApplicationConfigurationLoggable

  include Tenantable

  validates :client, presence: true

  after_update :update_project_feature

  def self.ransackable_attributes(_auth_object = nil)
    %w[id client_id]
  end

  FEATURES_TO_PROPAGATE = %i[
    sms_notification
    ai_assistants
    ai_assisted_idp
    global_skills
    enhance_with_ai
    idp
    ai_content_analysis
  ].freeze

  def update_project_feature
    features_to_disable = FEATURES_TO_PROPAGATE.each_with_object({}) do |feature, hash|
      if saved_change_to_attribute?(feature) && public_send(feature) == false
        hash[feature] = false
      end
    end

    return if features_to_disable.empty?

    ProjectFeature.where(project_id: client.children.select(:id)).update_all(features_to_disable)
  end
end
