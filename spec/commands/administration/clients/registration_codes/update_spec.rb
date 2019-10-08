# frozen_string_literal: true

require 'rails_helper'

describe Administration::Clients::RegistrationCodes::Update do
  let(:registration_code) { build_stubbed(:registration_code) }

  before do
    @form = Administration::Clients::RegistrationCodes::SaveForm.from_params(
      'start_date' => registration_code.start_date,
      'end_date' => registration_code.end_date,
      'name' => 'TTE 2.0', 'code' => 'tte-2020',
      'end_level_id' => registration_code.end_level_id,
      'total_count' => registration_code.total_count,
      'use_count' => registration_code.use_count,
      'disabled' => registration_code.disabled
    )
  end

  context 'Success' do
    subject { described_class.call(@form, registration_code) }
    it 'broadcasts :ok' do
      expect { subject }.to broadcast(:ok)
      expect(subject[:ok][:end_level_id]).to eql(registration_code.end_level_id)
      expect(subject[:ok][:project_id]).to eql(registration_code.end_level.project.id)
      expect(subject[:ok][:code]).to eql('tte-2020')
      expect(subject[:ok][:name]).to eql('TTE 2.0')
    end
  end
end
