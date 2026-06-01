# frozen_string_literal: true

module Reports
  class CampaignFactor < ApplicationRecord
    self.table_name_prefix = 'reports_'

    audited

    belongs_to :report

    tenant_config has_global_records: true, optional: true
    include Tenantable

    tenant_source :report

    has_many :translations, as: :translateable, dependent: :destroy

    validates :report, presence: true
    validates :code, presence: true, uniqueness: { scope: :report_id }
  end
end
