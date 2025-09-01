# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::AllAssessmentsQuery do
  let!(:campaign) { create(:campaign) }
  let!(:user) { create(:user) }
  let!(:campaign_assessment_group) { create(:campaign_assessment_group, campaign: campaign) }

  let!(:campaign_assessment) { create(:assessment, name: 'Campaign Assessment', category: :psychometric) }
  let!(:assessor_assessment) { create(:assessment, name: 'Assessor Assessment', category: :assessor_form) }
  let!(:lead_assessor_assessment) do
    create(:assessment, name: 'Lead Assessor Assessment', category: :lead_assessor_form)
  end
  let!(:user_assessment_assessment) { create(:assessment, name: 'User Assessment Assessment', category: :psychometric) }
  let!(:excluded_assessment) { create(:assessment, name: 'Excluded Assessment', category: :psychometric) }

  let!(:campaign_assessment_relation) do
    create(:campaign_assessment, campaign: campaign, assessment: campaign_assessment)
  end

  let!(:assessor_campaign_assessment) do
    create(:campaign_assessor_assessment,
           campaign: campaign,
           assessment: assessor_assessment,
           campaign_assessment_group: campaign_assessment_group)
  end

  let!(:lead_assessor_campaign_assessment) do
    create(:campaign_assessor_assessment,
           campaign: campaign,
           assessment: lead_assessor_assessment,
           campaign_assessment_group: campaign_assessment_group)
  end

  let!(:user_assessment_relation) do
    create(:user_assessment,
           campaign: campaign,
           assessment: user_assessment_assessment,
           subject: user,
           evaluator: user)
  end

  describe '#query' do
    context 'without any filters' do
      let(:query_results) { described_class.new(campaign, nil, 1, 25).query }

      it 'returns all unique assessments related to the campaign' do
        expect(query_results).to include(campaign_assessment)
        expect(query_results).to include(assessor_assessment)
        expect(query_results).to include(lead_assessor_assessment)
        expect(query_results).to include(user_assessment_assessment)
        expect(query_results).not_to include(excluded_assessment)
      end

      it 'returns paginated results' do
        expect(query_results).to respond_to(:current_page)
        expect(query_results).to respond_to(:total_pages)
        expect(query_results.current_page).to eq(1)
      end
    end

    context 'with search query' do
      it 'filters assessments by name' do
        results = described_class.new(campaign, 'Assessor', 1, 25).query

        expect(results).to include(assessor_assessment)
        expect(results).to include(lead_assessor_assessment)
        expect(results).not_to include(campaign_assessment)
        expect(results).not_to include(user_assessment_assessment)
      end

      it 'filters assessments by ID when search query is numeric' do
        assessment_id = assessor_assessment.id.to_s
        results = described_class.new(campaign, assessment_id, 1, 25).query

        expect(results).to include(assessor_assessment)
        expect(results).not_to include(campaign_assessment)
        expect(results).not_to include(lead_assessor_assessment)
        expect(results).not_to include(user_assessment_assessment)
      end

      it 'returns empty result when no assessments match search' do
        results = described_class.new(campaign, 'NonExistent', 1, 25).query

        expect(results).to be_empty
      end
    end

    context 'with pagination' do
      before do
        # Create additional assessments to test pagination
        10.times do |i|
          assessment = create(:assessment, name: "Test Assessment #{i}")
          create(:campaign_assessment, campaign: campaign, assessment: assessment)
        end
      end

      it 'respects page size' do
        results = described_class.new(campaign, nil, 1, 5).query

        expect(results.size).to eq(5)
      end

      it 'returns correct page' do
        page1_results = described_class.new(campaign, nil, 1, 5).query
        page2_results = described_class.new(campaign, nil, 2, 5).query

        expect(page1_results.to_a).not_to eq(page2_results.to_a)
        expect(page2_results.current_page).to eq(2)
      end

      it 'uses default page and page_size when not provided' do
        results = described_class.new(campaign, nil, nil, nil).query

        expect(results.current_page).to eq(1)
        expect(results.limit_value).to eq(25)
      end
    end

    context 'with no assessments' do
      let!(:empty_campaign) { create(:campaign) }

      it 'returns empty result' do
        results = described_class.new(empty_campaign, nil, 1, 25).query

        expect(results).to be_empty
      end
    end

    context 'with duplicate assessments across different sources' do
      let!(:duplicate_assessment) { create(:assessment, name: 'Duplicate Assessment') }

      before do
        # Create the same assessment in multiple sources
        create(:campaign_assessment, campaign: campaign, assessment: duplicate_assessment)
        create(:campaign_assessor_assessment,
               campaign: campaign,
               assessment: duplicate_assessment,
               campaign_assessment_group: campaign_assessment_group)
        create(:user_assessment,
               campaign: campaign,
               assessment: duplicate_assessment,
               subject: user,
               evaluator: user)
      end

      it 'returns unique assessments only' do
        results = described_class.new(campaign, nil, 1, 25).query

        duplicate_count = results.count { |a| a.id == duplicate_assessment.id }
        expect(duplicate_count).to eq(1)
      end
    end
  end
end
