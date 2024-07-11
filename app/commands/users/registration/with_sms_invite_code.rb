# frozen_string_literal: true

module Users
  module Registration
    class WithSmsInviteCode < BaseCommand
      private_attr_reader :form, :sms_invite

      def initialize(form, project)
        @form = form
        @sms_invite = project.sms_invites.find_by(code: form.sms_invite_code)
      end

      def call
        transaction do
          user_form = Campaigns::Users::CreateForm.new(form.attributes.slice(:first_name, :last_name, :email,
                                                                             :mobile_number, :mobile_verified))
          user = Campaigns::Users::Create.call!(user_form, sms_invite.campaign) do
            on(:insufficient_license) do
              raise Errors::LicenseError.new(nil, nil, user, 'LicenseError')
            end
          end

          sms_invite.update!(registered_user: user, status: :registered)
          broadcast(:ok, user)
        end
      rescue ActiveRecord::RecordInvalid, Errors::LicenseError => e
        form.errors.add(:base, e.message)
        broadcast(:error, form)
      end
    end
  end
end
