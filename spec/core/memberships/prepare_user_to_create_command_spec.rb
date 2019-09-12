# frozen_string_literal: true

require 'rails_helper'

describe Memberships::PrepareUserToCreateCommand do
  describe '.call' do
    it 'returns prepared membership with new user' do
      events = described_class.call(stub_form(valid?: true, email: 'carpazzi@gmail.com'), 'assessments' => ['view'])

      expect(events[:ok].grants.data).to eq('assessments' => ['view'])
      expect(events[:ok].user.email).to eq('carpazzi@gmail.com')
    end

    context 'returns prepared membership with existing user' do
      before { create(:client_admin, email: 'vasiliy@gmail.com', first_name: 'Vasiliy', last_name: 'Pupkin') }
      it {
        events = described_class.call(stub_form(valid?: true, email: 'vasiliy@gmail.com'), 'assessments' => ['view'])

        expect(events[:ok].grants.data).to eq('assessments' => ['view'])
        expect(events[:ok].user.first_name).to eq('Vasiliy')
        expect(events[:ok].user.last_name).to eq('Pupkin')
      }
    end
  end
end
