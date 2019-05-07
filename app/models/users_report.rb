# frozen_string_literal: true

class UsersReport < ApplicationRecord
  belongs_to :user
  belongs_to :report
  belongs_to :campaign
  enum status: %i[not_prepared prepared]
end
