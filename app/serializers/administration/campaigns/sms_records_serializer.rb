# frozen_string_literal: true

module Administration
  module Campaigns
    class SmsRecordsSerializer < Panko::Serializer
      attributes :id, :message
    end
  end
end
