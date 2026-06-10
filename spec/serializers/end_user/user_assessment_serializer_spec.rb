# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::UserAssessmentSerializer do
  include Rails.application.routes.url_helpers

  let(:user) { create(:user, :with_project_membership) }
  let(:campaign_user) { create(:campaign_user, user: user) }
  let(:campaign) { campaign_user.campaign }
  let(:assessment) { create(:assessment, :microsite) }
  let(:user_assessment) do
    create(:user_assessment, evaluator: user, subject: user, assessment: assessment, campaign: campaign)
  end

  subject { described_class.new(context: { current_user: user }).serialize(user_assessment) }

  describe '#type' do
    context 'when microsite internal assessment taking is disabled' do
      before do
        allow(Settings.microsite).to receive(:internal_assessment_enabled).and_return(false)
      end

      it 'returns microsite' do
        expect(subject['type']).to eq('microsite')
      end
    end

    context 'when microsite internal assessment taking is enabled' do
      before do
        allow(Settings.microsite).to receive(:internal_assessment_enabled).and_return(true)
      end

      it 'returns user_assessment' do
        expect(subject['type']).to eq('user_assessment')
      end
    end
  end
end
