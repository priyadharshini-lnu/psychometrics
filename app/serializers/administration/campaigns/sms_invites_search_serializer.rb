# frozen_string_literal: true

module Administration
  module Campaigns
    class SmsInvitesSearchSerializer < ActiveModel::Serializer
      attributes :id

      attribute :full_name do
        "#{object.first_name} #{object.last_name}"
      end
    end
  end
end
