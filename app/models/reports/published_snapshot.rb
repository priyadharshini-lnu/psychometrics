# frozen_string_literal: true

module Reports
  class PublishedSnapshot < ApplicationRecord
    self.table_name_prefix = 'reports_'

    belongs_to :report
    belongs_to :published_by, class_name: 'User', optional: true

    tenant_config has_global_records: true, optional: true
    include Tenantable

    tenant_source :report

    has_many :translations, as: :resource, dependent: :delete_all
  end
end
