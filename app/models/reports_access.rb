# frozen_string_literal: true

# This model is not in use. Remove it.
class ReportsAccess < ApplicationRecord
  audited

  belongs_to :report
  belongs_to :membership
  belongs_to :assessment

  validates :membership, uniqueness: { scope: %i[report assessment] }
  validates :user_access, inclusion: { in: [true, false] }
end
