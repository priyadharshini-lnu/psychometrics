# frozen_string_literal: true

module Reports
  class Page < ApplicationRecord
    self.table_name_prefix = 'reports_'

    audited

    include Copyable

    belongs_to :report, touch: true

    include Tenantable

    tenant_source :report

    has_many :modules, class_name: 'Reports::Module', dependent: :destroy

    default_scope { order(:position) }

    acts_as_list scope: :report_id

    validates :report, presence: true
  end
end
