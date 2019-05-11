# frozen_string_literal: true

class UsersReport < ApplicationRecord
  belongs_to :user
  belongs_to :report
  belongs_to :campaign

  enum status: { not_prepared: 0, prepared: 1 }
end
