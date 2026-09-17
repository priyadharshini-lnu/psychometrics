# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserIdpPlan, type: :model do
  describe '#schedule_idp_assigned_notification' do
    let(:user) { create(:user) }
    let(:campaign_user) { create(:campaign_user, user: user) }
    let(:campaign) { campaign_user.campaign }
    let(:communication) { create(:communication, kind: :idp_template_assigned, campaign_id: campaign.id) }
    let(:user_idp_plan) do
      create(:user_idp_plan, user: user, campaign_id: campaign.id)
    end

    describe 'Callbacks' do
      describe '#update_completed_at_or_started_at' do
        let(:frozen_time) { Time.current }

        before { allow(Time).to receive(:current).and_return(frozen_time) }

        context 'when completion_status changes to in_progress' do
          it 'sets started_at to current time' do
            expect do
              user_idp_plan.update(completion_status: :in_progress)
            end.to change { user_idp_plan.reload.started_at }.from(nil).to(frozen_time)
          end

          it 'does not change completed_at' do
            expect do
              user_idp_plan.update(completion_status: :in_progress)
            end.not_to(change { user_idp_plan.reload.completed_at })
          end
        end

        context 'when completion_status changes to completed' do
          it 'sets completed_at to current time' do
            expect do
              user_idp_plan.update(completion_status: :completed)
            end.to change { user_idp_plan.reload.completed_at }.from(nil).to(frozen_time)
          end

          it 'does not change started_at if already set' do
            user_idp_plan.update(completion_status: :in_progress)
            expect do
              user_idp_plan.update(completion_status: :completed)
            end.not_to change(user_idp_plan.reload, :started_at)
          end
        end

        context 'when completion_status does not change' do
          it 'does not update started_at or completed_at' do
            expect do
              user_idp_plan.update(review_note: 'New Note')
            end.not_to(change { user_idp_plan.reload.started_at })
            expect do
              user_idp_plan.update(review_note: 'Another Note')
            end.not_to(change { user_idp_plan.reload.completed_at })
          end
        end
      end
    end

    context 'when communication exists' do
      before { communication }

      it 'creates communication email with the resource' do
        expect do
          user_idp_plan.save!
        end.to change(CommunicationEmail, :count).by(1)

        communication_email = CommunicationEmail.last
        expect(communication_email.communication).to eq(communication)
        expect(communication_email.user).to eq(user)
        expect(communication_email.campaign_user).to eq(campaign_user)
        expect(communication_email.communication_email_resources.first.resource).to eq(user_idp_plan)
      end
    end

    context 'when no communication exists' do
      it 'does not create any communication emails' do
        expect do
          user_idp_plan.save!
        end.not_to change(CommunicationEmail, :count)
      end
    end

    context 'when communication email already exists' do
      before do
        communication
        email = create(:communication_email,
                       communication: communication,
                       user: user,
                       campaign_user: campaign_user)
        create(:communication_email_resource,
               communication_email: email,
               resource: user_idp_plan)
      end

      it 'does not create another communication email' do
        expect do
          user_idp_plan.save!
        end.not_to change(CommunicationEmail, :count)
      end
    end

    context 'when an active campaign-scoped CommunicationDelivery exists' do
      let(:project) { campaign.project }
      let(:client) { project.client }
      let!(:delivery) do
        create(:communication_delivery, :idp_template_assigned, client: client, project: project, campaign: campaign)
      end

      before { client.client_feature.update!(use_new_communication_center: true) }

      it 'creates a communication email sourced from the delivery' do
        expect do
          user_idp_plan.save!
        end.to change(CommunicationEmail, :count).by(1)

        communication_email = CommunicationEmail.last
        expect(communication_email.communication_delivery).to eq(delivery)
        expect(communication_email.user).to eq(user)
        expect(communication_email.campaign_user).to eq(campaign_user)
        expect(communication_email.communication_email_resources.first.resource).to eq(user_idp_plan)
      end

      it 'does not create a duplicate delivery-sourced email on repeat scheduling' do
        user_idp_plan.save!

        expect do
          user_idp_plan.send(:schedule_idp_notification, 'idp_template_assigned')
        end.not_to change(CommunicationEmail, :count)
      end

      context 'and a project-scoped delivery for the same kind also exists' do
        let!(:project_delivery) do
          create(:communication_delivery, :idp_template_assigned, :project_scoped, client: client, project: project)
        end

        it 'prefers the campaign-scoped delivery' do
          user_idp_plan.save!

          expect(CommunicationEmail.last.communication_delivery).to eq(delivery)
        end
      end
    end

    context 'when only a project-scoped CommunicationDelivery exists' do
      let(:project) { campaign.project }
      let(:client) { project.client }
      let!(:delivery) do
        create(:communication_delivery, :idp_template_assigned, :project_scoped, client: client, project: project)
      end

      before { client.client_feature.update!(use_new_communication_center: true) }

      it 'creates a communication email sourced from the project delivery' do
        expect do
          user_idp_plan.save!
        end.to change(CommunicationEmail, :count).by(1)

        expect(CommunicationEmail.last.communication_delivery).to eq(delivery)
      end
    end
  end

  describe '#schedule_idp_status_notification' do
    let(:user) { create(:user) }
    let(:campaign_user) { create(:campaign_user, user: user) }
    let(:user_idp_plan) do
      create(:user_idp_plan, user: user, campaign_id: campaign_user.campaign_id, approval_status: :pending_approval)
    end

    context 'when plan is approved' do
      let(:communication) do
        create(:communication, kind: :idp_template_approved, campaign_id: user_idp_plan.campaign_id)
      end

      context 'when communication exists' do
        before { communication }

        it 'creates communication email with the resource' do
          user_idp_plan.start_review!

          expect do
            user_idp_plan.approve!
          end.to change(CommunicationEmail, :count).by(1)

          communication_email = CommunicationEmail.last
          expect(communication_email.communication).to eq(communication)
          expect(communication_email.user).to eq(user)
          expect(communication_email.campaign_user).to eq(campaign_user)
          expect(communication_email.communication_email_resources.first.resource).to eq(user_idp_plan)
        end
      end

      context 'when no communication exists' do
        it 'does not create any communication emails' do
          user_idp_plan.start_review!

          expect do
            user_idp_plan.approve!
          end.not_to change(CommunicationEmail, :count)
        end
      end

      context 'when communication email already exists' do
        before do
          communication
          email = create(:communication_email,
                         communication: communication,
                         user: user,
                         campaign_user: campaign_user)
          create(:communication_email_resource,
                 communication_email: email,
                 resource: user_idp_plan)
        end

        it 'does not create another communication email' do
          user_idp_plan.start_review!

          expect do
            user_idp_plan.approve!
          end.not_to change(CommunicationEmail, :count)
        end
      end

      context 'when an active CommunicationDelivery exists' do
        let(:project) { user_idp_plan.campaign.project }
        let(:client) { project.client }
        let!(:delivery) do
          create(:communication_delivery, :idp_template_approved,
                 client: client, project: project, campaign: user_idp_plan.campaign)
        end

        before { client.client_feature.update!(use_new_communication_center: true) }

        it 'creates a communication email sourced from the delivery' do
          user_idp_plan.start_review!

          expect do
            user_idp_plan.approve!
          end.to change(CommunicationEmail, :count).by(1)

          expect(CommunicationEmail.last.communication_delivery).to eq(delivery)
        end
      end
    end

    context 'when plan is rejected' do
      let(:communication) do
        create(:communication, kind: :idp_template_rejected, campaign_id: user_idp_plan.campaign_id)
      end

      context 'when communication exists' do
        before { communication }

        it 'creates communication email with the resource' do
          user_idp_plan.start_review!

          expect do
            user_idp_plan.reject!
          end.to change(CommunicationEmail, :count).by(1)

          communication_email = CommunicationEmail.last
          expect(communication_email.communication).to eq(communication)
          expect(communication_email.user).to eq(user)
          expect(communication_email.campaign_user).to eq(campaign_user)
          expect(communication_email.communication_email_resources.first.resource).to eq(user_idp_plan)
        end
      end

      context 'when an active CommunicationDelivery exists' do
        let(:project) { user_idp_plan.campaign.project }
        let(:client) { project.client }
        let!(:delivery) do
          create(:communication_delivery, :idp_template_rejected,
                 client: client, project: project, campaign: user_idp_plan.campaign)
        end

        before { client.client_feature.update!(use_new_communication_center: true) }

        it 'creates a communication email sourced from the delivery' do
          user_idp_plan.start_review!

          expect do
            user_idp_plan.reject!
          end.to change(CommunicationEmail, :count).by(1)

          expect(CommunicationEmail.last.communication_delivery).to eq(delivery)
        end
      end
    end

    describe 'status workflow transitions' do
      context 'from not_started' do
        before do
          user_idp_plan.update(approval_status: :not_started)
        end

        it 'can transition to draft' do
          expect { user_idp_plan.draft! }.to change(user_idp_plan, :approval_status).from('not_started').to('draft')
        end
      end

      context 'from draft' do
        before { user_idp_plan.update(approval_status: :draft) }

        it 'can transition to pending_approval' do
          expect do
            user_idp_plan.submit_for_approval!
          end.to change(user_idp_plan, :approval_status).from('draft').to('pending_approval')
        end

        it 'can transition to approved' do
          expect { user_idp_plan.approve! }.to change(user_idp_plan, :approval_status).from('draft').to('approved')
        end
      end

      context 'from pending_approval' do
        before do
          user_idp_plan.update(approval_status: :pending_approval)
        end

        it 'can transition to in_review' do
          expect { user_idp_plan.start_review! }.to change(
            user_idp_plan, :approval_status
          ).from('pending_approval').to('in_review')
        end
      end

      context 'from in_review' do
        before do
          user_idp_plan.update(approval_status: :in_review)
        end

        it 'can transition to approved' do
          expect { user_idp_plan.approve! }.to change(user_idp_plan, :approval_status).from('in_review').to('approved')
        end

        it 'can transition to rejected' do
          expect { user_idp_plan.reject! }.to change(user_idp_plan, :approval_status).from('in_review').to('rejected')
        end
      end

      context 'from approved' do
        before do
          user_idp_plan.update(approval_status: :approved)
        end

        it 'can to draft' do
          expect { user_idp_plan.draft! }.to change(user_idp_plan, :approval_status).from('approved').to('draft')
        end
      end

      context 'from rejected' do
        before do
          user_idp_plan.update(approval_status: :rejected)
        end

        it 'can transition to draft' do
          expect { user_idp_plan.draft! }.to change(user_idp_plan, :approval_status).from('rejected').to('draft')
        end

        it 'can transition to approved' do
          expect { user_idp_plan.approve! }.to change(user_idp_plan, :approval_status).from('rejected').to('approved')
        end

        it 'can transition to pending_approval' do
          expect { user_idp_plan.submit_for_approval! }.to change(
            user_idp_plan, :approval_status
          ).from('rejected').to('pending_approval')
        end

        it 'can not transition to in_review' do
          expect { user_idp_plan.start_review! }.to raise_error(Workflow::NoTransitionAllowed)
        end
      end
    end
  end

  describe '#unread_comments_count_by' do
    let(:user) { create(:user) }
    let(:campaign_user) { create(:campaign_user, user: user) }
    let(:user_idp_plan) do
      create(:user_idp_plan, user: user, campaign_id: campaign_user.campaign_id)
    end
    let!(:another_user) { create(:user) }
    let!(:comment1) { create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user) }
    let!(:comment2) { create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user) }
    let!(:read_comment_by_another_user) do
      create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user, read_by_user_ids: [another_user.id])
    end
    it 'returns the count of unread comments for the user' do
      expect(user_idp_plan.reload.unread_comments_count_by(another_user)).to eq(2)
    end

    context 'when some unread comments have replies' do
      let!(:reply1) { create(:user_idp_comment, user_idp_plan: user_idp_plan, created_by: user, parent: comment1) }

      it 'returns total accumulation of unread comments and unread replies' do
        expect(user_idp_plan.reload.unread_comments_count_by(another_user)).to eq(3)
      end
    end
  end

  describe '#editable?' do
    let(:user_idp_plan) { create(:user_idp_plan) }

    {
      editable: %i[draft rejected],
      non_editable: %i[in_review approved]
    }.each do |editability, statuses|
      expected_result = editability == :editable

      context "#{editability} statuses" do
        statuses.each do |status|
          context "when status is #{status}" do
            before { user_idp_plan.update(approval_status: status) }

            it "returns #{expected_result}" do
              expect(user_idp_plan.editable?).to be expected_result
            end
          end
        end
      end
    end
  end

  describe '#manager_editable?' do
    let(:user_idp_plan) { create(:user_idp_plan) }

    {
      manager_editable: %i[in_review],
      non_manager_editable: %i[draft approved]
    }.each do |editability, statuses|
      expected_result = editability == :manager_editable

      context "#{editability} statuses" do
        statuses.each do |status|
          context "when status is #{status}" do
            before { user_idp_plan.update(approval_status: status) }

            it "returns #{expected_result}" do
              expect(user_idp_plan.manager_editable?).to be expected_result
            end
          end
        end
      end
    end
  end

  describe 'user_document file size validation' do
    let(:user_idp_plan) { create(:user_idp_plan) }

    context 'when file exceeds size limit (5MB or more)' do
      let(:oversized_document_blob) do
        ActiveStorage::Blob.create_and_upload!(
          io: StringIO.new('A' * (5.megabytes + 1)), # Just over 5MB
          filename: 'oversized_document.pdf',
          content_type: 'application/pdf'
        )
      end

      it 'is invalid and shows size error' do
        user_idp_plan.user_document.attach(oversized_document_blob)
        expect(user_idp_plan).not_to be_valid
        expect(user_idp_plan.errors[:user_document]).to include('size 5 MB is not between required range')
      end
    end
  end
end
