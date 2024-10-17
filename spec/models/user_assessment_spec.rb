# frozen_string_literal: true

require 'rails_helper'
require 'sidekiq/testing'

RSpec.describe UserAssessment, type: :model do
  include ActiveJob::TestHelper

  it {
    should define_enum_for(:status).
      with_values(not_started: 0, in_progress: 1, completed: 2, interrupted: 3, timed_out: 4, ineligible: 5)
  }

  describe '#user_reports' do
    it 'returns saville user_reports' do
      assessment = create(:assessment, :saville)
      report = create(:report, :saville, assessments: [assessment])
      user_assessment = create(:user_assessment, assessment: assessment)
      user_report = create(:user_report, user_id: user_assessment.subject_id,
        report_id: report.id, campaign_id: user_assessment.campaign_id)
      saville_user_reports = user_assessment.user_reports(:saville)

      expect(saville_user_reports).to include(user_report)
    end

    it 'returns chainable empty ActiveRecord::Relation object if there are no saville user_report' do
      user_assessment = create(:user_assessment)
      saville_user_reports = user_assessment.user_reports(:saville)

      expect(saville_user_reports.is_a?(ActiveRecord::Relation)).to eq(true)
      expect(saville_user_reports.count).to eq(0)
    end
  end

  describe '#applicable_external_norm_id' do
    it 'returns external_norm_id of campaign_assessment if present' do
      campaign_assessment = create(:campaign_assessment, external_norm_id: 'abc')
      campaign_assessment.assessment.update(external_settings: { norm_id: 'another_norm' })
      user_assessment = create(:user_assessment, campaign_id: campaign_assessment.campaign_id,
        assessment_id: campaign_assessment.assessment_id)

      expect(user_assessment.applicable_external_norm_id).to eq(campaign_assessment.external_norm_id)
    end

    it 'returns saville_norm_id of assessment if campaign_assessment is not present' do
      assessment = create(:assessment, :saville)
      user_assessment = create(:user_assessment, assessment: assessment)

      expect(user_assessment.applicable_external_norm_id).to eq(assessment.external_settings[:norm_id])
    end

    it 'returns pearson_norm_id of assessment if campaign_assessment is not present' do
      assessment = create(:assessment, :pearson)
      user_assessment = create(:user_assessment, assessment: assessment)

      expect(user_assessment.applicable_external_norm_id).to eq(assessment.external_settings[:norm_id])
    end
  end

  describe '#norm_name' do
    it 'returns saville_norm_name is assessment is saville' do
      user_assessment = build(
        :user_assessment,
        assessment: build(
          :assessment,
          :saville,
          external_settings: { assessment_id: 'A830E4AB-BC66-4238-92E0-6E6FD3FD1EDF' }
        )
      )
      build(
        :saville_user_assessment,
        user_assessment: user_assessment,
        norm_id: '05EDB032-2AB3-4B9E-8CCC-F5BCB7FE4337'
      )

      expect(user_assessment.norm_name).to eq('Wave Focus Styles V4 - Graduates - All (INT, IA, 2021)')
    end

    it 'returns pearson_norm_name is assessment is pearson' do
      norms = {
        'items' =>
          [{
            'label' => 'pearson_norm_name',
            'normId' => 'pearson_norm_id'
          }]
      }
      assessment = build(:assessment, :pearson)
      user_assessment = build(:user_assessment, assessment: assessment)
      create(:pearson_assessment, product_id: assessment.external_assessment_id, norms: norms)
      build(
        :pearson_user_assessment,
        user_assessment: user_assessment,
        norm_id: 'pearson_norm_id'
      )

      expect(user_assessment.norm_name).to eq('pearson_norm_name')
    end

    it 'returns hogan_norm_name is assessment is hogan' do
      user_assessment = create(:user_assessment, :with_hogan_assessment)
      create(:hogan_credential, norm: 'Global', user: user_assessment.user)

      expect(user_assessment.norm_name).to eq('Global')
    end

    it 'returns regular norm name using norm_id column' do
      norm = create(:norm)
      user_assessment = build(:user_assessment, norm: norm)

      expect(user_assessment.norm_name).to eq(norm.name)
    end

    describe 'closed?' do
      let(:user) { create(:user) }

      it 'returns true if assessment is completed timed_out or ineligible' do
        user_assessment = create(:user_assessment, status: :completed)
        expect(user_assessment.closed?).to eq(true)

        user_assessment = create(:user_assessment, status: :timed_out)
        expect(user_assessment.closed?).to eq(true)

        user_assessment = create(:user_assessment, status: :ineligible)
        expect(user_assessment.closed?).to eq(true)

        user_assessment = create(:user_assessment, status: :in_progress)
        expect(user_assessment.closed?).to eq(false)
      end

      it 'returns true if campaign is closed inactive or archived' do
        user_assessment = create(:user_assessment, subject: user, evaluator: user, status: :in_progress)

        user_assessment.campaign.update(status: :closed)
        expect(user_assessment.reload.closed?).to eq(true)

        user_assessment.campaign.update(status: :inactive)
        expect(user_assessment.closed?).to eq(true)

        user_assessment.campaign.update(status: :archived)
        expect(user_assessment.closed?).to eq(true)

        user_assessment.campaign.update(status: :active)
        expect(user_assessment.closed?).to eq(false)
      end

      it 'returns false for non self assessment even if campaign is closed' do
        user_assessment = create(:user_assessment, subject: user, evaluator: create(:user), status: :in_progress)

        user_assessment.campaign.update(status: :closed)
        expect(user_assessment.reload.closed?).to eq(false)

        user_assessment.campaign.update(status: :inactive)
        expect(user_assessment.closed?).to eq(false)

        user_assessment.campaign.update(status: :archived)
        expect(user_assessment.closed?).to eq(false)
      end

      it 'returns true is if campaign_user schedule_start_date is in future' do
        campaign = create(:campaign)
        create(:campaign_user, campaign: campaign, user: user, schedule_start_date: 1.day.from_now)
        user_assessment = create(:user_assessment, campaign: campaign, subject: user, evaluator: user,
status: :in_progress)

        expect(user_assessment.closed?).to eq(true)
      end

      it 'returns true if campaign_user schedule_end_date is in past' do
        campaign = create(:campaign)
        create(:campaign_user, campaign: campaign, user: user, schedule_end_date: 1.day.ago)
        user_assessment = create(:user_assessment, campaign: campaign, subject: user, evaluator: user,
status: :in_progress)

        expect(user_assessment.closed?).to eq(true)
      end

      it 'returns false if campaign_user if current time is between schedule_start_date and schedule_end_date' do
        campaign = create(:campaign, status: :active)
        create(:campaign_user, campaign: campaign, user: user, schedule_start_date: 1.day.ago,
schedule_end_date: 1.day.from_now)
        user_assessment = create(:user_assessment, campaign: campaign, subject: user, evaluator: user,
status: :in_progress)

        expect(user_assessment.closed?).to eq(false)
      end
    end
  end

  describe '#update_norm!' do
    it 'updates saville norms' do
      assessment = create(:assessment, :saville)
      user_assessment = create(:user_assessment, assessment: assessment)
      saville_user_assessment = create(:saville_user_assessment, user_assessment: user_assessment)
      norm_id = '05EDB032-2AB3-4B9E-8CCC-F5BCB7FE4337'
      user_assessment.update_norm!(norm_id)

      expect(saville_user_assessment.norm_id).to eq(norm_id)
      expect(user_assessment.fixed_norm).to eq(true)
    end

    it 'updates pearson norm if user assessment is not stated' do
      assessment = create(:assessment, :pearson)
      user_assessment = create(:user_assessment, assessment: assessment, status: :not_started)
      pearson_user_assessment = create(:pearson_user_assessment, user_assessment: user_assessment)
      norm_id = '00000000-0000-0000-0000-000000000000'
      user_assessment.update_norm!(norm_id)

      expect(pearson_user_assessment.norm_id).to eq(norm_id)
      expect(user_assessment.fixed_norm).to eq(true)
    end

    it 'does not updates pearson norm if user assessment is started' do
      assessment = create(:assessment, :pearson)
      user_assessment = create(:user_assessment, assessment: assessment, status: :in_progress)
      pearson_user_assessment = create(:pearson_user_assessment, user_assessment: user_assessment)
      norm_id = '00000000-0000-0000-0000-000000000000'
      user_assessment.update_norm!(norm_id)

      expect(pearson_user_assessment.norm_id).to_not eq(norm_id)
      expect(user_assessment.fixed_norm).to eq(false)
    end

    it 'updates regular user assessment norm' do
      user_assessment = create(:user_assessment)
      norm_id = create(:norm).id
      user_assessment.update_norm!(norm_id)

      expect(user_assessment.norm_id).to eq(norm_id)
      expect(user_assessment.fixed_norm).to eq(true)
    end
  end

  describe '#update_mettl_schedule!' do
    let!(:assessment) { create(:assessment, type: Assessments::Mettl) }
    let!(:user_assessment) { create(:user_assessment, assessment: assessment) }
    let!(:mettl_schedule_record) do
      create(:mettl_schedule_record, project: assessment.project, assessment: assessment)
    end
    let!(:mettl_user_assessment) do
      create(:mettl_user_assessment, user_assessment: user_assessment)
    end
    let(:mettl_schedule_record_id) { mettl_schedule_record.id }

    context 'when user assessment is not started and is mettl type' do
      it 'updates mettl schedule record id' do
        user_assessment.update!(status: 'not_started')

        user_assessment.update_mettl_schedule!(mettl_schedule_record_id)

        expect(mettl_user_assessment.reload.mettl_schedule_record_id).to eq(mettl_schedule_record_id)
      end
    end

    context 'when user assessment is completed' do
      it 'does not update mettl schedule record id' do
        user_assessment.update!(status: 'completed')

        user_assessment.update_mettl_schedule!(mettl_schedule_record_id)

        expect(mettl_user_assessment.reload.mettl_schedule_record_id).to eq(nil)
      end
    end

    context 'when user assessment is not mettl type' do
      it 'does not update mettl schedule record id' do
        assessment.update!(type: Assessments::Hogan)
        user_assessment.update!(status: 'not_started')

        user_assessment.update_mettl_schedule!(mettl_schedule_record_id)

        expect(mettl_user_assessment.reload.mettl_schedule_record_id).to eq(nil)
      end
    end
  end

  describe '#update_content_variation!' do
    let!(:assessment) { create(:assessment, type: Assessments::Simulation) }
    let!(:user_assessment) { create(:user_assessment, assessment: assessment) }
    let!(:simulation_user_assessment) do
      create(:simulation_user_assessment, user_assessment: user_assessment)
    end
    let(:content_variation_id) { 'spicyFood' }

    context 'when user assessment is not started and is simulation type' do
      it 'updates content variation id' do
        user_assessment.update!(status: 'not_started')

        user_assessment.update_content_variation!(content_variation_id)

        expect(simulation_user_assessment.reload.content_variation_id).to eq(content_variation_id)
      end
    end

    context 'when user assessment is not simulation type' do
      it 'does not update content variation id' do
        allow(user_assessment).to receive(:simulation?).and_return(false)

        user_assessment.update_content_variation!(content_variation_id)

        expect(simulation_user_assessment.reload.content_variation_id).not_to eq(content_variation_id)
      end
    end

    context 'when user assessment is not started' do
      it 'does not update content variation id' do
        user_assessment.update!(status: 'completed')

        user_assessment.update_content_variation!(content_variation_id)

        expect(simulation_user_assessment.reload.content_variation_id).not_to eq(content_variation_id)
      end
    end
  end

  describe 'Calculate and save campaign scoring' do
    let(:campaign) { create(:campaign) }
    let(:assessment) { create(:assessment) }
    let(:user) { create(:user) }
    let(:factor1) { create(:factor, dimension: assessment.dimension) }
    let!(:users_result) do
      scoring = {}
      scoring[factor1.id.to_s] = { 'norm_score' => 1, 'score' => 2 }
      create(
        :users_result, campaign: campaign, assessment: assessment,
        scoring: scoring, subject: user, evaluator: user, status: :in_progress
      )
    end

    it 'saves campaign scoring' do
      create(:campaign_user, campaign: campaign, user: user)
      cf_factor1 = create(
        :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
        factor_type: 'assessment', assessment_score_type: 'score'
      )
      perform_enqueued_jobs do
        users_result.user_assessment.update!(status: :completed, score_calculated: true,
                                             score_calculated_at: Time.current)
      end

      campaign_factor = user.campaign_factor_values.find_by(
        campaign_factor: cf_factor1, numeric_value: 2, campaign: users_result.campaign
      )
      expect(campaign_factor).to_not eq nil
    end

    it 'ignore calculating campaign scoring if score_calculated is not true' do
      cf_factor1 = create(
        :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
        factor_type: 'assessment', assessment_score_type: 'score'
      )
      perform_enqueued_jobs do
        users_result.user_assessment.update!(status: :completed)
      end
      campaign_factor = user.campaign_factor_values.find_by(
        campaign_factor: cf_factor1, numeric_value: 10, campaign: users_result.campaign
      )

      expect(campaign_factor).to eq nil
    end

    it 'ignore calculating campaign scoring if user_assessment is not completed' do
      cf_factor1 = create(
        :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
        factor_type: 'assessment', assessment_score_type: 'score'
      )
      perform_enqueued_jobs do
        users_result.user_assessment.update!(status: :not_started)
      end
      campaign_factor = user.campaign_factor_values.find_by(
        campaign_factor: cf_factor1, numeric_value: 10, campaign: users_result.campaign
      )

      expect(campaign_factor).to eq nil
    end

    it 'ignore calculating campaign scoring if it is not a self assessment' do
      users_result.update!(evaluator: create(:user))
      cf_factor1 = create(
        :campaign_factor, code: 'factor1', campaign: campaign, assessment: assessment, factor: factor1,
        factor_type: 'assessment', assessment_score_type: 'score'
      )
      perform_enqueued_jobs do
        users_result.user_assessment.update!(status: :completed)
      end
      campaign_factor = user.campaign_factor_values.find_by(
        campaign_factor: cf_factor1, numeric_value: 10, campaign: users_result.campaign
      )

      expect(campaign_factor).to eq nil
    end
  end

  describe 'Calculate and save campaign factor values' do
    let!(:campaign_user) { create(:campaign_user) }
    let!(:campaign) { campaign_user.campaign }
    let(:factor1) { create(:factor) }
    let!(:campaign_factor) do
      create(:campaign_factor, campaign: campaign, factor_type: :assessor_scoring, factor: factor1)
    end

    let!(:assessor_user_assessment) do
      create(:user_assessment, campaign: campaign, subject: campaign_user.user,
        assessment: create(:assessment, category: :assessor_form), relationship: Relationship.assessor_relationship,
        status: :in_progress)
    end

    let!(:users_result) do
      assessor_user_assessment.users_result.update!(
        scoring: {
          factor1.id.to_s => { 'norm_score' => 3 }
        }
      )
    end

    let!(:factors_scoring) do
      FactoryBot.create(:factors_scoring, factor: factor1, assessment: assessor_user_assessment.assessment)
    end

    it 'saves campaign factor values' do
      perform_enqueued_jobs do
        assessor_user_assessment.update!(status: :completed, score_calculated: true)
      end

      expect(campaign_user.campaign_factor_values.first.numeric_value).to eq(3)
    end

    it 'ignore calculating factor values if it is not a assessor assessment' do
      assessor_user_assessment.update!(assessment: create(:assessment, category: :lead_assessor_form))

      perform_enqueued_jobs do
        assessor_user_assessment.update!(status: :completed)
      end

      expect(campaign_user.campaign_factor_values).to be_empty
    end
  end
end
