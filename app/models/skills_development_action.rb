# frozen_string_literal: true

class SkillsDevelopmentAction < ApplicationRecord
  belongs_to :skill
  belongs_to :development_action

  include Tenantable

  tenant_source :skill, :development_action
end
