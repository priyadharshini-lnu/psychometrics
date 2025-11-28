# frozen_string_literal: true

require 'rails_helper'

RSpec.describe YoodliUserAssessment, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:user_assessment) }
  end

  describe 'delegations' do
    it { is_expected.to delegate_method(:user_reports).to(:user_assessment) }
  end

  describe 'auditing' do
    it 'is audited' do
      expect(described_class.ancestors).to include(Audited::Auditor::AuditedInstanceMethods)
    end
  end

  describe 'factory' do
    it 'creates a valid yoodli user assessment' do
      yoodli_user_assessment = create(:yoodli_user_assessment)
      expect(yoodli_user_assessment).to be_valid
      expect(yoodli_user_assessment.user_assessment).to be_present
    end

    it 'can set email' do
      yoodli_user_assessment = create(:yoodli_user_assessment, email: 'test@yoodli.com')
      expect(yoodli_user_assessment.email).to eq('test@yoodli.com')
    end
  end
end
