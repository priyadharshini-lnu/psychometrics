# frozen_string_literal: true

module SmsInvites
  class CreateForm < Rectify::Form
    mimic :sms_invites_create

    attribute :first_name, String
    attribute :last_name, String
    attribute :mobile_no, String
    attribute :locale, String, default: 'en'

    validates :first_name, :last_name, :mobile_no, presence: true
    validates :mobile_no, format: { with: /\A\+(?:[0-9] ?){6,14}[0-9]\z/ }, allow_blank: true
    validates :locale, inclusion: { in: I18n.available_locales.map(&:to_s), allow_blank: true }
    validate :invite_exists_in_campaign

    def invite_exists_in_campaign
      return unless context.campaign.sms_invites.exists?(mobile_no: mobile_no)

      errors.add(:mobile_no, :invite_exists_in_campaign)
    end
  end
end
