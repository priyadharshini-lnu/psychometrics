# frozen_string_literal: true

require 'rails_helper'

# This spec reproduces the EXACT workflow from the bug report:
# 1. Add a report with user assessment and assessor assessment
# 2. Add report to campaign and assign to user
# 3. Set up report approval (QC) in campaign settings
# 4. Add assessor as global assessor
# 5. Create assessment centre (slot 1) and add user
# 6. Add assessor to slot and allocate to user
# 7. Schedule activity and mark attendance
# 8. User completes their assessment
# 9. Assessor completes their assessment
# 10. View report as QC user - status should be Pending QC
# 11. Approve the report
# 12. Mark user as cancelled from slot 1
# 13. Create new slot (slot 2) and add user
# 14. Delete the assessor response
# 15. Status should be Not Ready
# 16. Assessor completes new assessment
# 17. EXPECTED: Status should be Pending QC
# 18. ACTUAL (BUG): Status remains Not Ready
RSpec.describe 'UserReport Approval Bug - Exact Workflow Reproduction', type: :model do
  let(:campaign) { create(:campaign) }
  let(:user) { create(:user) }
  let(:assessor_user) { create(:user) }
  let(:qc_user) { create(:user) }

  # Create assessments - one for user (self), one for assessor
  let(:user_assessment_def) { create(:assessment, category: :psychometric) }
  let(:assessor_assessment_def) { create(:assessment, category: :assessor_form) }

  # Create report linked to both assessments
  let(:report) { create(:report, assessments: [user_assessment_def, assessor_assessment_def]) }

  # Add report to campaign
  let!(:campaign_report) { create(:campaign_report, campaign: campaign, report: report) }

  # Create user report
  let!(:user_report) do
    create(:user_report,
           campaign: campaign,
           report: report,
           user: user,
           approval_status: :not_ready)
  end

  # Set up report approval with QC user
  let!(:report_approval_setting) do
    create(:report_approval_setting,
           report: report,
           campaign: campaign,
           qc_user_ids: [qc_user.id],
           approver_user_ids: [],
           approvers_not_required: true)
  end

  # Add assessor as global assessor in campaign
  let!(:assessor) { create(:assessor, campaign: campaign, user: assessor_user) }

  # Create assessment centre (assessment group)
  let!(:assessment_group) do
    create(:campaign_assessment_group,
           campaign: campaign,
           name: 'Assessment Center',
           group_type: :assessment_center)
  end

  # Link assessments to assessment group
  let!(:campaign_user_assessment) do
    create(:campaign_assessment,
           campaign: campaign,
           assessment: user_assessment_def,
           campaign_assessment_group: assessment_group)
  end

  let!(:campaign_assessor_assessment) do
    create(:campaign_assessor_assessment,
           campaign: campaign,
           assessment: assessor_assessment_def,
           campaign_assessment_group: assessment_group)
  end

  let(:self_relationship) { Relationship.self_relationship }
  let(:assessor_relationship) { Relationship.assessor_relationship }

  describe 'Bug reproduction: Deleting assessor response and re-adding' do
    it 'correctly resets status to not_ready when assessor assessment is deleted' do
      # Step 1: Create assessment center slot 1 and add user with assessor
      workshop1 = create(:workshop,
                         campaign: campaign,
                         campaign_assessment_group: assessment_group,
                         total_seats: 10)
      workshop_subject1 = create(:workshop_subject, workshop: workshop1, user: user)
      create(:workshop_assessor, workshop: workshop1, user: assessor_user)

      # Step 2: User completes their self assessment
      create(:user_assessment,
             campaign: campaign,
             assessment: user_assessment_def,
             subject: user,
             evaluator: user,
             relationship: self_relationship,
             status: :completed,
             score_calculated: true,
             completed_at: 1.hour.ago)

      # Step 3: Assessor completes their assessment for the user
      assessor_assessment1 = create(:user_assessment,
                                    campaign: campaign,
                                    assessment: assessor_assessment_def,
                                    subject: user,
                                    evaluator: assessor_user,
                                    relationship: assessor_relationship,
                                    status: :completed,
                                    score_calculated: true,
                                    completed_at: 1.hour.ago)

      # Verify all assessments are scored
      user_report.reload
      expect(user_report.all_assessments_are_scored?).to be_truthy

      # Step 4: Trigger approval workflow - status should become pending_qc
      user_report.start_approval!
      expect(user_report.reload.approval_status).to eq('pending_qc')

      # Step 5: QC user reviews and approves
      user_report.start_qc!
      user_report.send_for_approval!
      user_report.approve!
      expect(user_report.reload.approval_status).to eq('approved')

      # Step 6: Cancel user from slot 1
      workshop_subject1.update!(scheduling_status: :cancelled)

      # Step 7: Create new slot (slot 2) and add user
      workshop2 = create(:workshop,
                         campaign: campaign,
                         campaign_assessment_group: assessment_group,
                         total_seats: 10)
      create(:workshop_subject, workshop: workshop2, user: user)
      create(:workshop_assessor, workshop: workshop2, user: assessor_user)

      # Step 8: Delete assessor response - callback should reset status to not_ready
      assessor_assessment1.destroy!

      user_report.reload
      expect(user_report.all_assessments_are_scored?).to be_falsey

      # FIXED: Status is now automatically reset to 'not_ready' by the callback
      expect(user_report.approval_status).to eq('not_ready')

      # Step 9: Assessor completes new assessment in slot 2
      create(:user_assessment,
             campaign: campaign,
             assessment: assessor_assessment_def,
             subject: user,
             evaluator: assessor_user,
             relationship: assessor_relationship,
             status: :completed,
             score_calculated: true,
             completed_at: Time.current)

      user_report.reload
      expect(user_report.all_assessments_are_scored?).to be_truthy

      # Step 10: PostScoringTasks calls start_approval! after scoring
      user_report.start_approval!
      user_report.reload

      # Status should be pending_qc now that the workflow is fixed
      expect(user_report.approval_status).to eq('pending_qc')
    end

    it 'correctly transitions to pending_qc after new assessor completes assessment' do
      # Setup: Complete assessments and approve
      create(:user_assessment,
             campaign: campaign,
             assessment: user_assessment_def,
             subject: user,
             evaluator: user,
             relationship: self_relationship,
             status: :completed,
             score_calculated: true,
             completed_at: 1.hour.ago)

      assessor_assessment1 = create(:user_assessment,
                                    campaign: campaign,
                                    assessment: assessor_assessment_def,
                                    subject: user,
                                    evaluator: assessor_user,
                                    relationship: assessor_relationship,
                                    status: :completed,
                                    score_calculated: true,
                                    completed_at: 1.hour.ago)

      user_report.reload
      user_report.start_approval!
      user_report.start_qc!
      user_report.send_for_approval!
      user_report.approve!
      expect(user_report.reload.approval_status).to eq('approved')

      # Delete assessor assessment - callback should reset status
      assessor_assessment1.destroy!

      user_report.reload
      # FIXED: Status is now reset to not_ready by the callback
      expect(user_report.approval_status).to eq('not_ready')
      expect(user_report.all_assessments_are_scored?).to be_falsey

      # New assessor completes assessment
      create(:user_assessment,
             campaign: campaign,
             assessment: assessor_assessment_def,
             subject: user,
             evaluator: assessor_user,
             relationship: assessor_relationship,
             status: :completed,
             score_calculated: true,
             completed_at: Time.current)

      user_report.reload
      expect(user_report.all_assessments_are_scored?).to be_truthy

      # start_approval! is called by PostScoringTasks and now works correctly
      # because status is 'not_ready'
      user_report.start_approval!
      user_report.reload

      # FIXED: Status correctly transitions to 'pending_qc'
      expect(user_report.approval_status).to eq('pending_qc')
    end
  end

  describe 'Expected fix behavior' do
    it 'deleting assessor assessment should reset approved status to not_ready' do
      # Setup
      create(:user_assessment,
             campaign: campaign,
             assessment: user_assessment_def,
             subject: user,
             evaluator: user,
             relationship: self_relationship,
             status: :completed,
             score_calculated: true)

      assessor_assessment = create(:user_assessment,
                                   campaign: campaign,
                                   assessment: assessor_assessment_def,
                                   subject: user,
                                   evaluator: assessor_user,
                                   relationship: assessor_relationship,
                                   status: :completed,
                                   score_calculated: true)

      user_report.reload
      user_report.start_approval!
      user_report.start_qc!
      user_report.send_for_approval!
      user_report.approve!

      expect(user_report.reload.approval_status).to eq('approved')

      # Delete assessor assessment - callback should reset user_report status
      assessor_assessment.destroy!

      user_report.reload

      # Status should automatically reset to 'not_ready' when critical assessment is deleted
      expect(user_report.approval_status).to eq('not_ready')
    end

    it 'completing new assessor assessment should transition to pending_qc' do
      # Setup and approve
      create(:user_assessment,
             campaign: campaign,
             assessment: user_assessment_def,
             subject: user,
             evaluator: user,
             relationship: self_relationship,
             status: :completed,
             score_calculated: true)

      assessor_assessment1 = create(:user_assessment,
                                    campaign: campaign,
                                    assessment: assessor_assessment_def,
                                    subject: user,
                                    evaluator: assessor_user,
                                    relationship: assessor_relationship,
                                    status: :completed,
                                    score_calculated: true)

      user_report.reload
      user_report.start_approval!
      user_report.start_qc!
      user_report.send_for_approval!
      user_report.approve!

      # Delete assessor assessment - callback should reset status to not_ready
      assessor_assessment1.destroy!

      user_report.reload
      expect(user_report.approval_status).to eq('not_ready')

      # Create new assessor assessment
      create(:user_assessment,
             campaign: campaign,
             assessment: assessor_assessment_def,
             subject: user,
             evaluator: assessor_user,
             relationship: assessor_relationship,
             status: :completed,
             score_calculated: true)

      user_report.reload

      # Simulate PostScoringTasks calling start_approval!
      user_report.start_approval!
      user_report.reload

      expect(user_report.approval_status).to eq('pending_qc')
    end
  end

  describe 'Campaign factor scoring dependency for report approval' do
    let(:campaign_factor) { create(:campaign_factor, campaign: campaign, factor_type: :formula) }
    let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }

    let(:report_with_campaign_factor) { create(:report, assessments: [user_assessment_def]) }
    let!(:report_campaign_factor) do
      create(:report_campaign_factor, report: report_with_campaign_factor, code: campaign_factor.code)
    end

    let!(:campaign_report_with_factor) do
      create(:campaign_report, campaign: campaign, report: report_with_campaign_factor)
    end

    let!(:user_report_with_factor) do
      create(:user_report,
             campaign: campaign,
             report: report_with_campaign_factor,
             user: user,
             approval_status: :not_ready)
    end

    let!(:report_approval_setting_with_factor) do
      create(:report_approval_setting,
             report: report_with_campaign_factor,
             campaign: campaign,
             qc_user_ids: [qc_user.id],
             approver_user_ids: [],
             approvers_not_required: true)
    end

    it 'does not transition to pending_qc when campaign scores are not finalized' do
      # Complete the assessment
      create(:user_assessment,
             campaign: campaign,
             assessment: user_assessment_def,
             subject: user,
             evaluator: user,
             relationship: self_relationship,
             status: :completed,
             score_calculated: true)

      user_report_with_factor.reload
      expect(user_report_with_factor.all_assessments_are_scored?).to be_truthy

      # Campaign scores not finalized yet
      expect(campaign_user.campaign_scores_finalized?).to be_falsey

      # Try to start approval
      user_report_with_factor.start_approval!
      user_report_with_factor.reload

      # Should NOT transition to pending_qc because campaign scores are not finalized
      expect(user_report_with_factor.approval_status).to eq('not_ready')
    end

    it 'transitions to pending_qc when campaign scores are finalized' do
      # Complete the assessment
      create(:user_assessment,
             campaign: campaign,
             assessment: user_assessment_def,
             subject: user,
             evaluator: user,
             relationship: self_relationship,
             status: :completed,
             score_calculated: true)

      user_report_with_factor.reload
      expect(user_report_with_factor.all_assessments_are_scored?).to be_truthy

      # Finalize campaign scores
      campaign_user.update!(campaign_scores_finalized: true)

      # start_approval! should be called by the callback, but we test it explicitly
      user_report_with_factor.start_approval!
      user_report_with_factor.reload

      # Should transition to pending_qc because campaign scores are now finalized
      expect(user_report_with_factor.approval_status).to eq('pending_qc')
    end

    it 'triggers start_approval! via callback when campaign scores are finalized' do
      # Complete the assessment
      create(:user_assessment,
             campaign: campaign,
             assessment: user_assessment_def,
             subject: user,
             evaluator: user,
             relationship: self_relationship,
             status: :completed,
             score_calculated: true)

      user_report_with_factor.reload
      expect(user_report_with_factor.all_assessments_are_scored?).to be_truthy
      expect(user_report_with_factor.approval_status).to eq('not_ready')

      # Finalize campaign scores - callback should trigger start_approval!
      allow(UserReports::GenerateAndSavePdfJob).to receive_message_chain(:set, :perform_later)

      campaign_user.update!(campaign_scores_finalized: true)

      user_report_with_factor.reload
      # Should transition to pending_qc via the callback
      expect(user_report_with_factor.approval_status).to eq('pending_qc')
    end
  end

  describe 'AI artifact dependency for report approval' do
    let(:assistant) { create(:assistant) }
    let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }

    let(:report_with_ai_artifact) { create(:report, assessments: [user_assessment_def]) }
    let!(:report_campaign_ai_artifact) do
      create(:report_campaign_ai_artifact, report: report_with_ai_artifact, ai_assistant: assistant)
    end

    let!(:campaign_report_with_artifact) do
      create(:campaign_report, campaign: campaign, report: report_with_ai_artifact)
    end

    let!(:user_report_with_artifact) do
      create(:user_report,
             campaign: campaign,
             report: report_with_ai_artifact,
             user: user,
             approval_status: :not_ready)
    end

    let!(:report_approval_setting_with_artifact) do
      create(:report_approval_setting,
             report: report_with_ai_artifact,
             campaign: campaign,
             qc_user_ids: [qc_user.id],
             approver_user_ids: [],
             approvers_not_required: true)
    end

    it 'does not transition to pending_qc when artifact results are not finalized' do
      # Complete the assessment
      create(:user_assessment,
             campaign: campaign,
             assessment: user_assessment_def,
             subject: user,
             evaluator: user,
             relationship: self_relationship,
             status: :completed,
             score_calculated: true)

      user_report_with_artifact.reload
      expect(user_report_with_artifact.all_assessments_are_scored?).to be_truthy

      # Artifact results not finalized yet
      expect(campaign_user.campaign_artifact_results_finalized?).to be_falsey

      # Try to start approval
      user_report_with_artifact.start_approval!
      user_report_with_artifact.reload

      # Should NOT transition to pending_qc because artifact results are not finalized
      expect(user_report_with_artifact.approval_status).to eq('not_ready')
    end

    it 'transitions to pending_qc when artifact results are finalized' do
      # Complete the assessment
      create(:user_assessment,
             campaign: campaign,
             assessment: user_assessment_def,
             subject: user,
             evaluator: user,
             relationship: self_relationship,
             status: :completed,
             score_calculated: true)

      user_report_with_artifact.reload
      expect(user_report_with_artifact.all_assessments_are_scored?).to be_truthy

      # Finalize artifact results
      campaign_user.update!(campaign_artifact_results_finalized: true)

      # start_approval! should be called by the callback, but we test it explicitly
      user_report_with_artifact.start_approval!
      user_report_with_artifact.reload

      # Should transition to pending_qc because artifact results are now finalized
      expect(user_report_with_artifact.approval_status).to eq('pending_qc')
    end

    it 'triggers start_approval! via callback when artifact results are finalized' do
      # Complete the assessment
      create(:user_assessment,
             campaign: campaign,
             assessment: user_assessment_def,
             subject: user,
             evaluator: user,
             relationship: self_relationship,
             status: :completed,
             score_calculated: true)

      user_report_with_artifact.reload
      expect(user_report_with_artifact.all_assessments_are_scored?).to be_truthy
      expect(user_report_with_artifact.approval_status).to eq('not_ready')

      # Finalize artifact results - callback should trigger start_approval!
      allow(UserReports::GenerateAndSavePdfJob).to receive_message_chain(:set, :perform_later)

      campaign_user.update!(campaign_artifact_results_finalized: true)

      user_report_with_artifact.reload
      # Should transition to pending_qc via the callback
      expect(user_report_with_artifact.approval_status).to eq('pending_qc')
    end
  end
end
