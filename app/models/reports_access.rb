# frozen_string_literal: true

class ReportsAccess < ApplicationRecord
  belongs_to :report
  belongs_to :membership
  belongs_to :assessment

  validates :membership, uniqueness: { scope: %i[report assessment] }
  validates :user_access, inclusion: { in: [true, false] }
end
