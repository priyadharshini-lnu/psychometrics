require 'rails_helper'

describe Users::Create do

  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client, id: 101) }
  let!(:campaign) { create(:campaign, parent: project, id: 102) }

  describe 'broadcast invalid' do
    let(:invalid_form) { Rectify::StubForm.new(valid?: false) }
    it do
      events = described_class.call(invalid_form, project)
      expect(events[:invalid]).not_to be_nil
    end
  end

  describe 'broadcast ok' do
    let(:valid_form) { Api::V1::Users::CreateForm.new(first_name: 'Tiago', last_name: "Santos", email: 'tiago@santos.com', password: "qweasd", campaign_ids: [102]).with_context(project: project) }
    it do
      events = described_class.call(valid_form, project)
      user   = events[:ok]
      expect(user.client_ids).to eq [101, 102]
      expect(user.first_name).to eq 'Tiago'
      expect(user.project_id).to eq 101
      expect(user.last_name).to eq 'Santos'
      expect(user.email).to eq 'tiago@santos.com'
    end
  end
end
