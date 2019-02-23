require 'rails_helper'

describe Users::Update do

  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client, id: 101) }
  let!(:user) { create(:user, project: project) }

  describe 'broadcast invalid' do
    let(:invalid_form) { Rectify::StubForm.new(valid?: false) }
    it do
      events = described_class.call(invalid_form, project, nil)
      expect(events[:invalid]).not_to be_nil
    end
  end

  describe 'broadcast ok' do
    let(:valid_form) { Api::V1::Users::UpdateForm.new(first_name: 'Tiago', last_name: "Santos", email: 'tiago@santos.com', password: "qweasd").with_context(project: project, user: user) }
    it do
      events = described_class.call(valid_form, project, user)
      user   = events[:ok]
      expect(user.first_name).to eq 'Tiago'
      expect(user.last_name).to eq 'Santos'
      expect(user.email).to eq 'tiago@santos.com'
    end
  end
end
