# frozen_string_literal: true

module Users
  module Registration
    class WithSmsInviteCodeForm < BaseForm
      attribute :sms_invite_code, String

      validates :sms_invite_code, presence: true
      validate :validate_sms_invite_code, if: -> { sms_invite_code.present? }

      private

      def validate_sms_invite_code
        sms_invite = context.project.sms_invites.
                     where.not(status: :registered).
                     where('expiry >= :now', now: Time.zone.now).
                     find_by(code: sms_invite_code)
        if sms_invite.nil?
          errors.add(:sms_invite_code,
                     I18n.t('activemodel.errors.models.register.attributes.sms_invite_code.invalid'))
        end
      end
    end
  end
end
