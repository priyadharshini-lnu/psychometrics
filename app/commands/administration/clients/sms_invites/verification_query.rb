# frozen_string_literal: true

module Administration
  module Clients
    module SmsInvites
      class VerificationQuery < Rectify::Query
        private_attr_reader :project, :sms_invite_code

        def initialize(project, sms_invite_code)
          @project = project
          @sms_invite_code = sms_invite_code
        end

        def query
          project.
            sms_invites.
            where.not(status: :registered).
            where('expiry >= :now', now: Time.zone.now).
            find_by(code: sms_invite_code)
        end
      end
    end
  end
end
