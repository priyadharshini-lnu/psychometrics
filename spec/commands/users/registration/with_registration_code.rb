# frozen_string_literal: true

require 'rails_helper'

describe Users::Registration::WithRegistrationCode do
  let(:registration_code) { create(:registration_code, use_count: 546) }
  let(:project) { registration_code.project }

  before do
    @form = Users::Registration::WithRegistrationCodeForm.from_params(
      'email' => 'email-1@tte-test.com', 'first_name' => 'Tester',
      'last_name' => 'Person', 'registration_code' => 'tte-2019',
      'password' => 'ComplexPass129',
      'password_confirmation' => 'ComplexPass129'
    ).with_context(project: project)
  end

  context 'Success' do
    subject { described_class.call(@form, project) }

    it 'broadcasts :ok' do
      allow(Time).to receive(:now).and_return(Time.zone.local(2019, 10, 8, 0, 0, 0))
      expect { subject }.to broadcast(:ok)
      user = User.find_by(email: 'email-1@tte-test.com')
      expect(user.persisted?).to be_truthy
      expect(registration_code.reload.use_count).to eql(547) # incremented by one
      expect(user.license_usages.exists?(registration_code_id: registration_code.id)).to be_truthy
    end

    it 'creates user for new campaign' do
      campaign = create(:campaign, project: project)
      create(:registration_code, use_count: 1, campaign: campaign, code: 'Abc', project: project)
      @form.registration_code = 'Abc'
      expect { subject }.to broadcast(:ok)

      user = campaign.campaign_users.first.user

      expect(user.slice(:first_name, :last_name, :email)).to eq({
        'first_name' => 'Tester',
        'last_name' => 'Person',
        'email' => 'email-1@tte-test.com'
      })
    end
  end
end
