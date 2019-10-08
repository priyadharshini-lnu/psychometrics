# frozen_string_literal: true

require 'rails_helper'

describe Users::Register do
  let(:registration_code) { create(:registration_code, use_count: 546) }
  let(:project) { registration_code.project }

  before do
    @form = Users::RegisterForm.from_params(
      'email' => 'email-1@tte-test.com', 'first_name' => 'Tester',
      'last_name' => 'Person', 'registration_code' => 'tte-2019',
      'password' => 'ComplexPass123',
      'password_confirmation' => 'ComplexPass123'
    ).with_context(project: project)
  end

  context 'Success' do
    subject { described_class.call(@form, project) }

    it 'broadcasts :ok' do
      allow(Time).to receive(:now).and_return(Time.local(2019, 10, 8, 0, 0, 0))
      expect { subject }.to broadcast(:ok)
      user = User.find_by(email: 'email-1@tte-test.com')
      expect(user.persisted?).to be_truthy
      expect(registration_code.reload.use_count).to eql(547) # incremented by one
      expect(user.license_usages.where(registration_code_id: registration_code.id).exists?).to be_truthy
    end

    it 'broadcasts :error' do
      allow(Time).to receive(:now).and_return(Time.local(2019, 10, 8, 0, 0, 0))
      allow(Administration::Clients::CreateUser).to receive(:call).and_raise(ActiveRecord::RecordInvalid)
      expect { subject }.to broadcast(:error)
    end
  end
end
