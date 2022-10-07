# frozen_string_literal: true

module Reports
  class Page < ApplicationRecord
    include Copyable

    belongs_to :report, touch: true

    has_many :modules, class_name: 'Reports::Module', dependent: :destroy

    default_scope { order(:position) }

    acts_as_list scope: :report_id

    validates :report, presence: true

    def self.table_name_prefix
      'reports_'
    end
  end
end
