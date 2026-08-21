# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InvitationMailer do
  describe '#link_to_client' do
    let(:project) { create(:project) }
    let(:user) { create(:user, project: project) }
    let(:campaign) do
      Mobility.with_locale(:en) { create(:campaign, name: 'English Campaign Name', project: project) }
    end
    let(:membership) { create(:campaign_admin_membership, user: user, campaign: campaign) }

    before do
      Mobility.with_locale(:ar) do
        campaign.update!(name: 'Arabic Campaign Name')
      end
    end

    context 'when the participant locale is English' do
      before { user.user_profile.update!(locale: 'en') }

      it 'renders the campaign name in the participant locale' do
        mail = described_class.link_to_client(user.id, membership)
        expect(mail.body.encoded).to include('English Campaign Name')
        expect(mail.body.encoded).not_to include('Arabic Campaign Name')
      end
    end

    context 'when the participant locale is Arabic' do
      before { user.user_profile.update!(locale: 'ar') }

      it 'renders the campaign name in the participant locale' do
        mail = described_class.link_to_client(user.id, membership)
        expect(mail.body.encoded).to include('Arabic Campaign Name')
        expect(mail.body.encoded).not_to include('English Campaign Name')
      end
    end
  end
end
