# frozen_string_literal: true

class Api::V2::Administration::Campaigns::SmsHistoryResource < Api::V2::Administration::BaseResource
  attributes :mobile_no, :first_name, :last_name, :segment_length, :price, :created_at, :status

  has_one :sms_record

  ransack_filters %i[filterable_fields]

  def created_at
    I18n.l @model.created_at, format: :short
  end

  def self.records(opts = {})
    campaign = opts[:context][:campaign]

    SmsHistory.joins(:sms_record).
      where(sms_record: { campaign_id: campaign.id }).
      ransack(opts[:context][:params][:filters]).result
  end
end
