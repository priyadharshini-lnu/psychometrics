# frozen_string_literal: true

class IdpTemplateSkill < ApplicationRecord
  belongs_to :idp_template
  belongs_to :skill
  belongs_to :assessment

  enum category: { required: 0, available: 1 }, _prefix: true
  enum scoring_source: { assessment: 0, campaign_factor: 1 }, _prefix: true
end
