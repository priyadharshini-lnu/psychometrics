# frozen_string_literal: true

class SkillAlias < ApplicationRecord
  belongs_to :client
  belongs_to :skill

  include Tenantable
end
