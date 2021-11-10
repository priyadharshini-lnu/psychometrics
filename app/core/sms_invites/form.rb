# frozen_string_literal: true

module SmsInvites
  class Form < Rectify::Form
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
      existing_sms_invite = context.campaign.sms_invites.where(mobile_no: mobile_no)
      existing_sms_invite = existing_sms_invite.where.not(id: context.sms_invite.id) if context.sms_invite
      return unless existing_sms_invite.exists?

      errors.add(:mobile_no, :invite_exists_in_campaign)
    end
  end
end
