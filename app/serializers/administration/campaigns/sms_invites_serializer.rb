# frozen_string_literal: true

module Administration
  module Campaigns
    class SmsInvitesSerializer < ActiveModel::Serializer
      attributes :id, :first_name, :last_name, :mobile_no, :email, :locale, :status

      attribute :created_by do
        object.creator.decorate.full_name
      end

      attribute :created_at do
        I18n.l object.created_at, format: :short
      end
    end
  end
end
