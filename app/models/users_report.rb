# frozen_string_literal: true

class UsersReport < ApplicationRecord
  belongs_to :user, inverse_of: :users_reports
  belongs_to :report
  belongs_to :campaign

  enum status: { not_prepared: 0, generating: 1, failed: 2, prepared: 3 }
end
