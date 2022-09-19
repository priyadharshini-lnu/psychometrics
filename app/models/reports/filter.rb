# frozen_string_literal: true

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
