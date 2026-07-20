# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Campaigns::CopyAsTemplateOrCampaign do
  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client) }
  let!(:dimension) { create(:dimension, owner: membership.client) }
  let!(:assessment) { create(:assessment, dimension: dimension, name: 'Assessment') }
  let!(:report) { create(:report, name: 'Report', assessment: assessment) }
  let!(:campaign) { create(:campaign, project: project, name: 'Original Campaign', type: :threesixty) }
  let!(:threesixty_campaign) do
    create(:threesixty_campaign, campaign: campaign, assessment: assessment, report: report, category: :normal)
  end

  let!(:threesixty_option) { create(:threesixty_option, threesixty_campaign: threesixty_campaign) }
  let!(:email_template) { create(:threesixty_email_template, threesixty_campaign: threesixty_campaign) }
  let!(:instruction_template) { create(:threesixty_instruction_template, threesixty_campaign: threesixty_campaign) }

  let!(:block1) { create(:block, assessment: assessment, name: 'First Block') }
  let!(:block2) { create(:block, assessment: assessment, name: 'Second Block') }

  let!(:factor1) { create(:factor, name: 'Leadership', description: 'Leadership skills', dimension: dimension) }
  let!(:factor2) do
    create(:factor, name: 'Communication', description: 'Communication abilities', dimension: dimension)
  end
  let!(:factor3) { create(:factor, name: 'Teamwork', description: 'Team collaboration', dimension: dimension) }

  let!(:question1) { create(:question, block: block1, assessment: assessment) }
  let!(:question2) { create(:question, block: block1, assessment: assessment) }
  let!(:question3) { create(:question, block: block2, assessment: assessment) }

  let!(:factor_scoring1) { create(:factors_scoring, question: question1, factor: factor1, assessment: assessment) }
  let!(:factor_scoring2) { create(:factors_scoring, question: question1, factor: factor2, assessment: assessment) }
  let!(:factor_scoring3) { create(:factors_scoring, question: question2, factor: factor2, assessment: assessment) }
  let!(:factor_scoring4) { create(:factors_scoring, question: question3, factor: factor3, assessment: assessment) }

  let!(:campaign_assessment) { create(:campaign_assessment, campaign: campaign, assessment: assessment) }
  let!(:campaign_report) { create(:campaign_report, campaign: campaign, report: report) }
  let!(:campaign_options) { create(:campaign_option, campaign: campaign) }

  let!(:campaign_user) { create(:campaign_user, campaign: campaign) }
  let!(:user_assessment) { create(:user_assessment, campaign: campaign, assessment: assessment) }
  let!(:user_report) { create(:user_report, campaign: campaign, report: report) }

  let!(:report_approval_setting) { create(:report_approval_setting, campaign: campaign) }

  describe '#call' do
    context 'when campaign is a normal 360 campaign' do
      subject(:result) { described_class.call!(campaign) }

      it 'creates a cloned 360 campaign as template' do
        expect { result }.to change(Campaign, :count).by(1)

        cloned_campaign = result[:campaign]
        expect(cloned_campaign.is_template).to be true
        expect(cloned_campaign.name).to eq('Template from Original Campaign')
        expect(cloned_campaign.threesixty?).to be true
      end

      it 'clones threesixty_campaign and associated assessment/report' do
        original_threesixty_id = threesixty_campaign.id
        original_assessment_id = assessment.id
        original_report_id = report.id

        expect { result }.to change(Threesixty::Campaign, :count).by(1)

        cloned_campaign = result[:campaign].reload
        cloned_threesixty = cloned_campaign.threesixty_campaign.reload

        expect(cloned_threesixty).to be_present
        expect(cloned_threesixty.id).not_to eq(original_threesixty_id)
        expect(cloned_threesixty.assessment.reload.id).not_to eq(original_assessment_id)
        expect(cloned_threesixty.report.reload.id).not_to eq(original_report_id)
      end

      it 'clones dimension and assessment correctly' do
        expect { result }.to change(Dimension, :count).by(1)

        cloned_campaign = result[:campaign]
        cloned_assessment = cloned_campaign.threesixty_campaign.assessment
        cloned_dimension = cloned_assessment.dimension

        expect(cloned_dimension).to be_present
        expect(cloned_dimension.id).not_to eq(dimension.id)
        expect(cloned_dimension).to have_attributes(dimension.attributes.except(
                                                      'id', 'created_at', 'updated_at', 'name',
                                                      'default_occupation_condition_set_id'
                                                    ))

        cloned_campaign = result[:campaign]
        cloned_assessment = cloned_campaign.threesixty_campaign.assessment

        expect(cloned_assessment.blocks.count).to eq(2)
        cloned_blocks = cloned_assessment.blocks.order(:name)
        expect(cloned_blocks.first.name).to eq('First Block')
        expect(cloned_blocks.second.name).to eq('Second Block')

        expect(cloned_assessment.blocks.flat_map(&:questions).count).to eq(3)

        cloned_block1 = cloned_blocks.first
        cloned_block2 = cloned_blocks.second

        expect(cloned_block1.questions.count).to eq(2)
        expect(cloned_block2.questions.count).to eq(1)

        cloned_assessment.blocks.flat_map(&:questions).each do |question|
          expect(question.assessment_id).to eq(cloned_assessment.id)
        end
      end

      it 'clones factors and factors_scorings correctly without duplicates' do
        expect { result }.to change(Factor, :count).by(3).
          and change(FactorsScoring, :count).by(4)

        cloned_campaign = result[:campaign]
        cloned_assessment = cloned_campaign.threesixty_campaign.assessment
        cloned_dimension = cloned_assessment.dimension

        cloned_factors = cloned_dimension.all_factors.order(:name)
        expect(cloned_factors.count).to eq(3)
        expect(cloned_factors.map(&:name)).to eq(%w[Communication Leadership Teamwork])

        cloned_factors.each do |factor|
          expect(factor.dimension_id).to eq(cloned_dimension.id)
        end

        cloned_factors_scorings = cloned_assessment.factors_scoring
        expect(cloned_factors_scorings.count).to eq(4)

        cloned_factors_scorings.each do |fs|
          expect(fs.assessment_id).to eq(cloned_assessment.id)
          expect(fs.question.assessment_id).to eq(cloned_assessment.id)
          expect(cloned_factors.map(&:id)).to include(fs.factor_id)
        end

        cloned_questions = cloned_assessment.blocks.flat_map(&:questions).sort_by(&:id)

        q1_scorings = cloned_factors_scorings.select { |fs| fs.question_id == cloned_questions[0].id }
        expect(q1_scorings.count).to eq(2)

        q2_scorings = cloned_factors_scorings.select { |fs| fs.question_id == cloned_questions[1].id }
        expect(q2_scorings.count).to eq(1)

        q3_scorings = cloned_factors_scorings.select { |fs| fs.question_id == cloned_questions[2].id }
        expect(q3_scorings.count).to eq(1)
      end

      it 'clones threesixty options and templates' do
        original_counts = {
          option: Threesixty::Option.count,
          email_template: Threesixty::EmailTemplate.count,
          instruction_template: Threesixty::InstructionTemplate.count
        }

        original_ids = {
          option: threesixty_option.id,
          email_template: email_template.id,
          instruction_template: instruction_template.id
        }

        cloned_campaign = result[:campaign]

        expect(Threesixty::Option.count).to eq(original_counts[:option] + 1)
        expect(Threesixty::EmailTemplate.count).to eq(original_counts[:email_template] + 1)
        expect(Threesixty::InstructionTemplate.count).to eq(original_counts[:instruction_template] + 1)

        cloned_threesixty = cloned_campaign.reload.threesixty_campaign.reload

        expect(cloned_threesixty.option.id).not_to eq(original_ids[:option])
        expect(cloned_threesixty.email_templates.first.id).not_to eq(original_ids[:email_template])
        expect(cloned_threesixty.instruction_templates.first.id).not_to eq(original_ids[:instruction_template])
      end

      it 'updates campaign_assessment to point to cloned assessment' do
        expect { result }.to change(CampaignAssessment, :count).by(1)

        cloned_campaign = result[:campaign]
        cloned_campaign_assessment = CampaignAssessment.find_by(campaign: cloned_campaign)

        expect(cloned_campaign_assessment.assessment_id).to eq(cloned_campaign.threesixty_campaign.assessment.id)
        expect(cloned_campaign_assessment.assessment_id).not_to eq(assessment.id)
      end

      it 'updates campaign_report to point to cloned report' do
        expect { result }.to change(CampaignReport, :count).by(1)

        cloned_campaign = result[:campaign]
        cloned_campaign_report = CampaignReport.find_by(campaign: cloned_campaign)

        expect(cloned_campaign_report.report_id).to eq(cloned_campaign.threesixty_campaign.report.id)
        expect(cloned_campaign_report.report_id).not_to eq(report.id)
      end

      it 'creates campaign template' do
        expect { result }.to change(CampaignTemplate, :count).by(1)

        cloned_campaign = result[:campaign]
        campaign_template = CampaignTemplate.find_by(campaign: cloned_campaign)

        expect(campaign_template).to be_present
        expect(campaign_template.name).to eq(cloned_campaign.name)
        expect(campaign_template.assessment).to eq(cloned_campaign.threesixty_campaign.assessment)
        expect(campaign_template.report).to eq(cloned_campaign.threesixty_campaign.report)
        expect(campaign_template.owner).to eq(project.client)
      end

      it 'does not clone user-related data' do
        expect { result }.not_to change(CampaignUser, :count)
        expect { result }.not_to change(UserAssessment, :count)
        expect { result }.not_to change(UserReport, :count)

        cloned_campaign = result[:campaign]
        expect(cloned_campaign.campaign_users).to be_empty
        expect(cloned_campaign.user_assessments).to be_empty
        expect(cloned_campaign.user_reports).to be_empty
      end
      it 'factor_benchmark_scores use original factor_ids' do
        create(:factor_benchmark_score, campaign: campaign, assessment: assessment, factor: factor1)
        create(:factor_benchmark_score, campaign: campaign, assessment: assessment, factor: factor2)

        expect { result }.to change(FactorBenchmarkScore, :count).by(2)

        cloned_campaign = result[:campaign]
        cloned_assessment = cloned_campaign.threesixty_campaign.assessment
        cloned_dimension = cloned_assessment.dimension
        cloned_factors = cloned_dimension.all_factors

        cloned_scores = FactorBenchmarkScore.where(campaign: cloned_campaign)
        expect(cloned_scores.count).to eq(2)

        cloned_scores.each do |score|
          expect(score.assessment_id).to eq(cloned_assessment.id)
          expect(cloned_factors).to include(score.factor)
        end
      end
    end

    context 'when threesixty_campaign category is skill_rater' do
      before do
        threesixty_campaign.update!(category: :skill_rater)
      end

      subject(:result) { described_class.call!(campaign) }

      it 'does not clone dimension' do
        expect { result }.not_to change(Dimension, :count)

        cloned_campaign = result[:campaign]
        cloned_assessment = cloned_campaign.threesixty_campaign.assessment

        expect(cloned_assessment.dimension_id).to eq(dimension.id)
      end

      it 'keeps original factor_id but updates assessment_id and question_id to cloned ones' do
        original_factor_ids = assessment.factors_scoring.pluck(:factor_id).sort
        original_question_ids = assessment.factors_scoring.pluck(:question_id).sort

        cloned_campaign = result[:campaign]
        cloned_assessment = cloned_campaign.threesixty_campaign.assessment
        cloned_factors_scorings = cloned_assessment.factors_scoring

        expect(cloned_factors_scorings.pluck(:factor_id).sort).to eq(original_factor_ids)
        expect(cloned_factors_scorings.pluck(:assessment_id).uniq).to eq([cloned_assessment.id])
        expect(cloned_factors_scorings.pluck(:question_id).sort).not_to eq(original_question_ids)
        expect(cloned_factors_scorings.count).to eq(4)
      end

      it 'factor_benchmark_scores use original factor_ids' do
        factor_benchmark_score1 = create(:factor_benchmark_score, campaign: campaign, assessment: assessment,
factor: factor1)
        factor_benchmark_score2 = create(:factor_benchmark_score, campaign: campaign, assessment: assessment,
factor: factor2)

        expect { result }.to change(FactorBenchmarkScore, :count).by(2)

        cloned_campaign = result[:campaign]

        cloned_scores = FactorBenchmarkScore.where(campaign: cloned_campaign)
        expect(cloned_scores.count).to eq(2)

        cloned_factor_ids = cloned_scores.pluck(:factor_id).sort
        original_factor_ids = [factor_benchmark_score1.factor_id, factor_benchmark_score2.factor_id].sort
        expect(cloned_factor_ids).to eq(original_factor_ids)
      end
    end
  end
end
