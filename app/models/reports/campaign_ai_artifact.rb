# frozen_string_literal: true

module Reports
  class CampaignAIArtifact < ApplicationRecord
    self.table_name_prefix = 'reports_'

    audited

    belongs_to :report
    belongs_to :ai_assistant, class_name: 'AI::Assistant'

    include Tenantable

    tenant_source :report

    validates :report, presence: true
    validates :ai_assistant, presence: true
    validates :code, presence: true, uniqueness: { scope: :report_id }
  end
end
