# frozen_string_literal: true

class IdpTemplateSkill < ApplicationRecord
  belongs_to :idp_template
  belongs_to :skill
  belongs_to :assessment, optional: true
  belongs_to :factor, optional: true

  include Tenantable

  tenant_source :idp_template

  enum :category, { required: 0, available: 1 }, prefix: true
  enum :scoring_source, { assessment: 0, campaign_factor: 1 }, prefix: true
  enum :assessment_score_type, { norm_score: 0, score: 1, zscore: 2, percentile: 3, percentage: 4 }, prefix: true
end
