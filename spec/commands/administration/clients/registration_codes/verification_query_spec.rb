# frozen_string_literal: true

require 'rails_helper'

describe Administration::Clients::RegistrationCodes::VerificationQuery do
  let(:registration_code) { create(:registration_code) }
  let(:upcoming_registration_code) { create(:registration_code, start_date: Time.now + 15.days) }
  let(:expired_registration_code) do
    create(:registration_code, start_date: Time.now - 2.days, end_date: Time.now - 1.days)
  end
  let(:used_up_registration_code) { create(:registration_code, total_count: 1000, use_count: 1000) }

  context 'Execution' do
    it 'returns a registration code' do
      allow(Time).to receive(:now).and_return(Time.local(2019, 10, 8, 0, 0, 0))
      queried_record = described_class.new(registration_code.project, registration_code.code.upcase).query
      expect(queried_record.present?).to be_truthy
      expect(queried_record.take).to be_an_instance_of(RegistrationCode)
    end

    it 'does not return an expired registration_code' do
      allow(Time).to receive(:now).and_return(Time.local(2022, 1, 8, 0, 0, 0))
      queried_record = described_class.new(registration_code.project, registration_code.code).query
      expect(queried_record.present?).to_not be_truthy
    end

    it 'does not return with any out of context code' do
      allow(Time).to receive(:now).and_return(Time.local(2019, 10, 8, 0, 0, 0))
      queried_record = described_class.new(registration_code.project, 'random').query
      expect(queried_record.present?).to_not be_truthy
    end

    it 'does not return an upcoming registration code' do
      queried_record = described_class.new(upcoming_registration_code.project, registration_code.code).query
      expect(queried_record.present?).to_not be_truthy
    end

    it 'does not return an expired registration code' do
      queried_record = described_class.new(expired_registration_code.project, registration_code.code).query
      expect(queried_record.present?).to_not be_truthy
    end

    it 'does not return an used up registration code' do
      queried_record = described_class.new(used_up_registration_code.project, registration_code.code).query
      expect(queried_record.present?).to_not be_truthy
    end
  end
end
