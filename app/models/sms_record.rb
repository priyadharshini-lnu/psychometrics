# frozen_string_literal: true

class SmsRecord < ApplicationRecord
  belongs_to :creator, class_name: 'User', foreign_key: :creator_id
  belongs_to :campaign
  has_many :sms_histories
end
