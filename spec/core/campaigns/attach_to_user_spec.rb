require 'rails_helper'

describe Campaigns::AttachToUser do

  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client, id: 101) }
  let!(:campaign_102) { create(:campaign, parent: project, id: 102) }
  let!(:campaign_103) { create(:campaign, parent: project, id: 103) }

  describe 'broadcast ok' do
    let(:valid_form) { Rectify::StubForm.new(valid?: true, campaign_ids: [102, 103]) }

    it do
      events = described_class.call(valid_form, membership.user)
      user   = events[:ok]
      expect(user.memberships.map(&:client_id)).to include(102, 103)
    end
  end
end
