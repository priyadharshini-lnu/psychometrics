# frozen_string_literal: true

class SmsHistory < ApplicationRecord
  audited

  belongs_to :sms_invite
  belongs_to :sms_record
end
