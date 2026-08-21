# frozen_string_literal: true

module Users
  class Admin < User
    def scope
      :user
    end

    def invite_assessor!
      raw_token = ::Users::FindOrCreateInvitationToken.call!(self)
      InvitationMailer.invite_admin(id, raw_token).deliver_later
    end

    private

    def should_force_tenant_resolution?
      true
    end
  end
end
