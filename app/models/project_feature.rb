# frozen_string_literal: true

class ProjectFeature < ApplicationRecord
  belongs_to :project
  include Tenantable

  include ApplicationConfigurationLoggable

  validates :project, presence: true

  def self.ransackable_attributes(_auth_object = nil)
    %w[id project_id sms_notification ai_assistants ai_assisted_idp global_skills idp glint_ui]
  end
end
