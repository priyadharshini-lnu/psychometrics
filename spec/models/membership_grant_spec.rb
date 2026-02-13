# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MembershipGrant, type: :model do
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
    let(:modifier) { create(:user, email: 'modifier@example.com') }

    before do
      allow(SiemLogger).to receive(:log_security_event!)
      allow(Settings.features).to receive(:dont_send_pi_to_siem).and_return(true)
      Current.user = modifier
    end

    context 'when grants are created' do
      it 'logs UserSecurityContextChange event' do
        create(:membership_grants, membership: membership, data: { 'projects' => ['view'] })

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'UserSecurityContextChange',
          actor_name: modifier.id.to_s,
          context: "User: #{membership.user.id}",
          msg: "Membership grants assigned for client #{membership.client_id}"
        )
      end
    end

    context 'when grants are updated' do
      let(:grant) { create(:membership_grants, membership: membership, data: { 'projects' => ['view'] }) }

      it 'logs UserSecurityContextChange event' do
        grant.update(data: { 'projects' => ['manage'] })

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'UserSecurityContextChange',
          actor_name: modifier.id.to_s,
          context: "User: #{membership.user.id}",
          msg: "Membership grants updated for client #{membership.client_id}"
        )
      end
    end

    context 'when grants are destroyed' do
      let(:grant) { create(:membership_grants, membership: membership) }

      it 'logs UserSecurityContextChange event' do
        grant.destroy

        expect(SiemLogger).to have_received(:log_security_event!).with(
          'UserSecurityContextChange',
          actor_name: modifier.id.to_s,
          context: "User: #{membership.user.id}",
          msg: "Membership grants removed for client #{membership.client_id}"
        )
      end
    end
  end
end
