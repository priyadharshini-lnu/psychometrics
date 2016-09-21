module Reports
  class Page < ApplicationRecord
    belongs_to :report
    has_many :modules, class_name: 'Reports::Module', dependent: :destroy

    amoeba do
      enable
      append name: 'Copy of '
      include_association :modules
    end

    acts_as_list scope: :report_id

    def self.table_name_prefix
      'reports_'
    end
  end
end
