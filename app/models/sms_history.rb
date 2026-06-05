# frozen_string_literal: true

class SmsHistory < ApplicationRecord
  audited

  belongs_to :sms_invite
  belongs_to :sms_record
  include Tenantable

  tenant_source :sms_record

  scope :filterable_fields, lambda { |query|
                              where(
                                'sms_histories.first_name ILIKE :query OR ' \
                                'sms_histories.last_name ILIKE :query OR ' \
                                'sms_histories.mobile_no ILIKE :query',
                                query: "%#{query}%"
                              )
                            }

  def self.ransackable_scopes(_)
    %i[filterable_fields]
  end
end
