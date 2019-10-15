# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RegistrationCode, type: :model do
  let(:registration_code) { create(:registration_code) }
  let(:client) { create(:project) }

  before do
    @form = Administration::Clients::RegistrationCodes::SaveForm.from_params(
      'name' => 'First Registration Code', 'code' => 'test-rc-1',
      'total_count' => '10', 'disabled' => 'true',
      'start_date' => '1 Oct 2019 / 11:33 +04:00', 'end_date' => '31 Oct 2019 / 11:33 +04:00'
    )
  end

  context 'Valid' do
    subject { Administration::Clients::RegistrationCodes::Create.call(@form, client) }

    it 'creates a new registration code' do
      expect(@form.valid?).to be_truthy
      expect { subject }.to broadcast(:ok)
      expect(subject[:ok].persisted?).to be_truthy
    end

    it 'updates a registration code' do
      new_form = Administration::Clients::RegistrationCodes::SaveForm.
                 from_params(@form.attributes).
                 with_context(registration_code: registration_code)
      new_form.name = 'RC Update Success'
      new_form.total_count = 2000
      expect(new_form.valid?).to be_truthy
      Administration::Clients::RegistrationCodes::Update.call(new_form, registration_code)
      expect(registration_code.reload.name).to eql('RC Update Success')
      expect(registration_code.reload.total_count).to eql(2000)
    end
  end

  context 'Invalid because' do
    it 'needs a name' do
      new_form = @form
      new_form.name = nil
      expect(new_form.valid?).to be_falsy
      expect(new_form.errors.messages[:name].present?).to be_truthy
    end

    it 'needs the code to be between 4-32 characters long' do
      new_form = @form
      new_form.code = '123'
      expect(new_form.valid?).to be_falsy
      expect(new_form.errors.messages[:code].present?).to be_truthy
    end

    it 'needs the code to be uniquely scoped to the end_level' do
      new_form = @form
      new_form.code = registration_code.code
      new_form.end_level_id = registration_code.end_level_id
      expect(new_form.valid?).to be_falsy
      expect(new_form.errors.messages[:code].present?).to be_truthy
      expect(new_form.errors.messages[:code][0]).to eql('is in use. Try another one.')
    end

    it 'needs a total_count greater than use_count' do
      new_form = Administration::Clients::RegistrationCodes::SaveForm.
                 from_params(@form.attributes).
                 with_context(registration_code: registration_code)
      new_form.total_count = 50
      # Validation should run while updating record
      expect(new_form.valid?).to be_falsy
      expect(new_form.errors.messages[:total_count].present?).to be_truthy
    end

    it 'needs a sensible start and end date' do
      new_form = @form
      new_form.start_date = Time.now + 20.days
      new_form.end_date = Time.now + 19.days
      expect(new_form.valid?).to be_falsy
      expect(new_form.errors.messages[:end_date].present?).to be_truthy
    end
  end
end
