# == Schema Information
#
# Table name: reports_pages
#
#  id         :integer          not null, primary key
#  report_id  :integer
#  name       :string
#  props      :json
#  position   :integer
#  deleted_at :datetime
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

module Reports
  class Page < ApplicationRecord
    belongs_to :report
    has_many :modules, class_name: 'Reports::Module', dependent: :destroy

    validates :report, presence: true

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
