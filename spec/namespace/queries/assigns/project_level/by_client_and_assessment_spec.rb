# frozen_string_literal: true

require 'rails_helper'

describe Queries::Assigns::ProjectLevel::ByClientAndAssessment do
  let(:query) { Queries::Assigns::ProjectLevel::ByClientAndAssessment }

  let(:project1) { create(:project) }
  let(:project2) { create(:project) }

  let(:assessment1) { project1.assessments.take }
  let(:assessment2) { project2.assessments.take }

  let(:report1) { create(:report, assessment: assessment1) }
  let(:report2) { create(:report, assessment: assessment2) }

  let!(:clients_report1) { create(:clients_report, client: project1, report: report1) }
  let!(:clients_report2) { create(:clients_report, client: project2, report: report2) }

  let(:membership1) { create(:membership, client: project1) }
  let(:membership2) { create(:membership, client: project2) }

  let!(:assign1) { create(:assign, assessment: assessment1, membership: membership1) }
  let!(:assign2) { create(:assign, assessment: assessment2, membership: membership2) }

  let(:result) { query.call(project1.id, assessment1.id).to_a }

  it 'includes original assign from the current project' do
    expect(result).to include(assign1)
  end

  it 'does not include original assign from the other project' do
    expect(result).not_to include(assign2)
  end
end
