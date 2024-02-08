# frozen_string_literal: true

module Administration
  module Campaigns
    class SmsInvitesSearchSerializer < Panko::Serializer
      attributes :id, :full_name

      def full_name
        "#{object.first_name} #{object.last_name}"
      end
    end
  end
end
