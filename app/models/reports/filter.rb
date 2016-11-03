module Reports
  class Filter < ApplicationRecord
    belongs_to :report

    validates :report, presence: true

    after_initialize :init

    def init
      self.conditions  ||= []
    end

    def self.table_name_prefix
      'reports_'
    end
  end
end
