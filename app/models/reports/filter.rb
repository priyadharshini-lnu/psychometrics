# frozen_string_literal: true

# == Schema Information
#
# Table name: reports_filters
#
#  id         :integer          not null, primary key
#  report_id  :integer
#  name       :string
#  conditions :json
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

module Reports
  class Filter < ApplicationRecord
    include Copyable

    belongs_to :report
    has_many :translations, as: :translateable, dependent: :destroy

    validates :report, presence: true

    after_initialize :init

    def init
      self.conditions ||= []
    end

    def self.table_name_prefix
      'reports_'
    end
  end
end
