# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Idp::IdpPlan::Reset do
  let!(:user_idp_plan) do
    create(
      :user_idp_plan,
      approval_status: :draft,
      completion_status: :in_progress,
      started_at: 2.days.ago,
      completed_at: 1.day.ago,
      last_approved_at: 3.days.ago,
      review_note: 'Some review note'
    )
  end
  let!(:user_idp_skills) { create_list(:user_idp_skill, 3, user_idp_plan: user_idp_plan) }
  let!(:user_idp_development_actions) { create_list(:user_idp_development_action, 3, user_idp_plan: user_idp_plan) }
  let!(:user_idp_comments) { create_list(:user_idp_comment, 2, user_idp_plan: user_idp_plan) }
  let!(:reflection_question) { create(:reflection_question, project_id: user_idp_plan.campaign.project_id) }
  let!(:user_reflection_question_answer) do
    create(:user_reflection_question_answer, user_idp_plan: user_idp_plan, reflection_question: reflection_question)
  end
  let!(:existing_session) { create(:assisted_user_idp_session, assistable: user_idp_plan, user: user_idp_plan.user) }

  let(:document_blob) do
    ActiveStorage::Blob.create_and_upload!(
      io: StringIO.new('Test PDF content'),
      filename: 'test_document.pdf',
      content_type: 'application/pdf'
    )
  end

  before do
    user_idp_plan.user_document.attach(document_blob)
  end

  subject(:command) { described_class.new(user_idp_plan) }

  describe '#call' do
    it 'resets the user IDP plan and associated records' do
      PaperTrail.request.enable_model(UserIdpPlan)
      user_idp_plan.update!(approval_status: :approved)
      expect(user_idp_plan.versions.count).to be > 0
      expect do
        command.call
      end.to change { user_idp_plan.user_idp_skills.count }.from(3).to(0).
        and change { user_idp_plan.user_idp_development_actions.count }.from(3).to(0).
        and change { user_idp_plan.user_idp_comments.count }.from(2).to(0).
        and change { user_idp_plan.user_reflection_question_answers.count }.from(1).to(0).
        and change { user_idp_plan.versions.count }.from(user_idp_plan.versions.count).to(0).
        and change { user_idp_plan.user_document.attached? }.from(true).to(false)

      expect(user_idp_plan.reload.ai_assisted_idp_session).to be_nil
      expect(user_idp_plan.reload.approval_status).to eq('not_started')
      expect(user_idp_plan.reload.completion_status).to eq('not_started')
      expect(user_idp_plan.started_at).to be_nil
      expect(user_idp_plan.completed_at).to be_nil
      expect(user_idp_plan.last_approved_at).to be_nil
      expect(user_idp_plan.review_note).to be_nil
      PaperTrail.request.disable_model(UserIdpPlan)
    end

    it 'broadcasts :ok on success' do
      expect(command).to receive(:broadcast).with(:ok)
      command.call
    end

    it 'broadcasts :error on failure' do
      allow(user_idp_plan).to receive(:update!).and_raise(StandardError.new('Update failed'))
      expect(command).to receive(:broadcast).with(:error, 'Update failed')
      command.call
    end
  end
end
