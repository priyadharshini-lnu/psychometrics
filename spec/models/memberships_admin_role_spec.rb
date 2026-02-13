# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MembershipsAdminRole, type: :model do
  describe '#log_security_context_change' do
    let(:project) do
      create(
        :project,
        number: '12345',
        country: 'Barbados',
        year: Time.zone.now.year,
        project_manager: create(:superadmin)
      )
    end
    let(:membership) { create(:membership, user: create(:user), client: project) }
    let(:admin_role) { create(:admin_role, name: 'CustomAdmin') }
    let(:modifier) { create(:user, email: 'modifier@example.com') }

    before do
      allow(SiemLogger).to receive(:log_security_event!)
      allow(Settings.features).to receive(:dont_send_pi_to_siem).and_return(true)
      Current.user = modifier
    end

    context 'when admin role is assigned' do
      it 'logs UserSecurityContextChange event' do
        MembershipsAdminRole.create(membership: membership, admin_role: admin_role)

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'UserSecurityContextChange',
          actor_name: modifier.id.to_s,
          context: "User: #{membership.user.id}",
          msg: "Admin Role 'CustomAdmin' assigned for client #{membership.client_id}"
        )
      end
    end

    context 'when admin role is removed' do
      let(:memberships_admin_role) { MembershipsAdminRole.create(membership: membership, admin_role: admin_role) }

      it 'logs UserSecurityContextChange event' do
        memberships_admin_role.destroy

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'UserSecurityContextChange',
          actor_name: modifier.id.to_s,
          context: "User: #{membership.user.id}",
          msg: "Admin Role 'CustomAdmin' removed for client #{membership.client_id}"
        )
      end
    end
  end
end
