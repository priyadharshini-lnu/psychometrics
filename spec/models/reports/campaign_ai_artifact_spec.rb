# frozen_string_literal: true

require 'rails_helper'

describe Reports::CampaignAIArtifact do
  describe 'touch behavior' do
    let(:report) { create(:report) }

    it 'touches the report when created' do
      report.update_column(:updated_at, 1.day.ago)

      expect { create(:report_campaign_ai_artifact, report: report) }.to(change { report.reload.updated_at })
    end

    it 'touches the report when destroyed' do
      artifact = create(:report_campaign_ai_artifact, report: report)
      report.update_column(:updated_at, 1.day.ago)

      expect { artifact.destroy }.to(change { report.reload.updated_at })
    end
  end
end
