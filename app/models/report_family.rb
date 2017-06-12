# == Schema Information
#
# Table name: report_families
#
#  id         :integer          not null, primary key
#  name       :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class ReportFamily < ApplicationRecord
  has_and_belongs_to_many :reports
  validates :name, presence: true
end
