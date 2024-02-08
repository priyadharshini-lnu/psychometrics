# frozen_string_literal: true

module Administration
  module Campaigns
    class SmsInvitesSerializer < Panko::Serializer
      attributes :id, :first_name, :last_name, :mobile_no, :email, :locale, :status, :created_by, :created_at

      def created_by
        object.creator.decorate.full_name
      end

      def created_at
        I18n.l object.created_at, format: :short
      end
    end
  end
end
