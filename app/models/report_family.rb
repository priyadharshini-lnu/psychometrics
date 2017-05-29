class ReportFamily < ApplicationRecord
  has_and_belongs_to_many :reports
  validates :name, presence: true
end
