# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SavilleAssessmentSetting, type: :model do
  let(:saville_assessment_setting) do
    create(:saville_assessment_setting, saville_assessment_id: 'A830E4AB-BC66-4238-92E0-6E6FD3FD1EDF')
  end

  it 'sets saville_norm_id to default_norm_id' do
    expect(saville_assessment_setting.saville_norm_id).to eq('05EDB032-2AB3-4B9E-8CCC-F5BCB7FE4337')
  end

  describe '#saville_norms' do
    it 'returns all saville_norms for particula assessment' do
      expect(saville_assessment_setting.saville_norms).to eq(
        [
          { id: '05EDB032-2AB3-4B9E-8CCC-F5BCB7FE4337',
            name: 'Wave Focus Styles V4 - Graduates - All (INT, IA, 2021)' },
          { id: 'A0F63805-6099-47EB-9037-187929E80021',
            name: 'Wave Focus Styles V4 - Graduates - Recent (INT, IA, 2021)' }
        ]
      )
    end
  end
end
