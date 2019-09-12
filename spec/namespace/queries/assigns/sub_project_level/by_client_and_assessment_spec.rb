# frozen_string_literal: true

require 'rails_helper'

describe Queries::Assigns::SubProjectLevel::ByClientAndAssessment do
  let(:query) { Queries::Assigns::SubProjectLevel::ByClientAndAssessment }

  let(:sub_campaign1) { create(:sub_campaign, :with_reports) }
  let(:sub_campaign2) { create(:sub_campaign, :with_reports) }

  let(:assessment1) { sub_campaign1.assessments.take }
  let(:assessment2) { sub_campaign2.assessments.take }

  let(:report1) { assessment1.reports.take }
  let(:report2) { assessment2.reports.take }

  let!(:clients_report1) { create(:clients_report, client: sub_campaign1, report: report1) }
  let!(:clients_report2) { create(:clients_report, client: sub_campaign2, report: report2) }

  let!(:project_clients_report1) { create(:clients_report, client: sub_campaign1.project, report: report1) }
  let!(:project_clients_report2) { create(:clients_report, client: sub_campaign2.project, report: report2) }

  let(:membership1) { create(:membership, client: sub_campaign1) }
  let(:membership2) { create(:membership, client: sub_campaign2) }

  let!(:assign1) { create(:assign, assessment: assessment1, membership: membership1) }
  let!(:assign2) { create(:assign, assessment: assessment2, membership: membership2) }

  context 'for sub_campaign1' do
    let(:result) { query.call(sub_campaign1.id, assessment1.id).to_a }

    it 'includes project assign from sub_campaign1' do
      expect(result).to include(assign1.project_assign)
    end

    it 'does not include original assign from sub_campaign1' do
      expect(result).not_to include(assign1)
    end

    it 'does not include original assign from sub_campaign2' do
      expect(result).not_to include(assign2)
    end

    it 'does not include project assign from sub_campaign2' do
      expect(result).not_to include(assign2.project_assign)
    end
  end
end
