# frozen_string_literal: true

module Reports
  class Filter < ApplicationRecord
    self.table_name_prefix = 'reports_'

    audited

    include Copyable

    belongs_to :report

    include Tenantable

    tenant_source :report

    has_many :translations, as: :translateable, dependent: :destroy

    validates :report, presence: true

    after_initialize :init

    def init
      self.conditions ||= []
    end
  end
end
