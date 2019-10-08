# frozen_string_literal: true

require 'rails_helper'

describe Administration::Clients::RegistrationCodes::Create do
  let(:client) { create(:project) }

  before do
    @form = Administration::Clients::RegistrationCodes::SaveForm.from_params(
      {
        'name' => 'First Registration Code', 'code' => 'test-rc-1',
        'total_count' => '10', 'disabled' => 'true',
        'start_date' => '1 Oct 2019 / 11:33 +04:00', 'end_date' => '31 Oct 2019 / 11:33 +04:00'
      }, end_level_id: client.id
    )
  end

  context 'Success' do
    subject { described_class.call(@form, client) }
    it 'broadcasts :ok' do
      expect { subject }.to broadcast(:ok)
      expect(subject[:ok]).to be_an_instance_of(RegistrationCode)
      expect(subject[:ok].persisted?).to be_truthy
      expect(subject[:ok][:code]).to eql('test-rc-1')
      expect(subject[:ok][:end_level_id]).to eql(client.id)
      expect(subject[:ok][:project_id]).to eql(client.project.id)
    end
  end
end
