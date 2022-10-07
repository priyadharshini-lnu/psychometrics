# frozen_string_literal: true

class SmsRecord < ApplicationRecord
  belongs_to :creator, class_name: 'User'
  belongs_to :campaign
  has_many :sms_histories
end
