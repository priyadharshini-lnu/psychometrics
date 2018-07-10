class ReportsAccess < ApplicationRecord
  belongs_to :report
  belongs_to :membership

  validates :membership, uniqueness: { scope: :report }
  validates :user_access, inclusion: { in: [true, false] }
end
