# frozen_string_literal: true

class SkillsJobRole < ApplicationRecord
  belongs_to :skill
  belongs_to :job_role
end
