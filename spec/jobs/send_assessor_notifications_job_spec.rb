# frozen_string_literal: true

require 'rails_helper'

describe SendAssessorNotificationsJob, type: :job do
  let(:assessor) { create(:assessor) }
  let(:assessor_relationship) { create(:relationship, name: 'Assessor', type: :global) }
  let(:campaign) { create(:campaign) }
  let!(:job_track_record) { create(:last_job_run, :completed_yesterday, name: described_class.name) }

  def create_assessor_assessment(default_assessor = assessor, default_campaign = campaign)
    create(:user_assessment, assessor: default_assessor, relationship: assessor_relationship,
            campaign: default_campaign)
  end

  it 'sends notification email for created assessor assessments' do
    assessment1 = create_assessor_assessment
    assessment2 = create_assessor_assessment

    expect(AssessorNotificationMailer).to receive(:new_assignment).
      with(assessor.id, [assessment1.id, assessment2.id]).
      and_return(double(deliver_later: true))

    expect do
      described_class.perform_now
    end.to change { EventDelivery.count }.by(1)

    event_delivery = EventDelivery.find_by(resource: assessor)
    expect(event_delivery.event_type).to eq('new_assessor_assessment')
    expect(event_delivery.sent_at).to eq(Time.zone.now)
    expect(event_delivery.meta).to include('user_assessment_ids' => [assessment1.id, assessment2.id])
  end

  it 'groups notifications by assessor and sends separate emails' do
    assessor2 = create(:assessor)
    assessment1 = create_assessor_assessment
    assessment2 = create_assessor_assessment(assessor2)

    expect(AssessorNotificationMailer).to receive(:new_assignment).
      with(assessor.id, [assessment1.id]).
      and_return(double(deliver_later: true))
    expect(AssessorNotificationMailer).to receive(:new_assignment).
      with(assessor2.id, [assessment2.id]).
      and_return(double(deliver_later: true))

    described_class.perform_now

    event_delivery1 = EventDelivery.find_by(resource: assessor)
    event_delivery2 = EventDelivery.find_by(resource: assessor2)

    expect(event_delivery1.sent_at).to be_within(1.second).of(Time.zone.now)
    expect(event_delivery1.meta).to include('user_assessment_ids' => [assessment1.id])
    expect(event_delivery2.sent_at).to be_within(1.second).of(Time.zone.now)
    expect(event_delivery2.meta).to include('user_assessment_ids' => [assessment2.id])
  end

  it 'only processes pending assessments which are not processed' do
    pending_assessment = create_assessor_assessment

    delivered_assessment = Timecop.freeze(2.days.ago) do
      create_assessor_assessment
    end

    expect(delivered_assessment.created_at).to be_before(job_track_record.started_at)

    expect(AssessorNotificationMailer).to receive(:new_assignment).
      with(assessor.id, [pending_assessment.id]).
      and_return(double(deliver_later: true))

    described_class.perform_now

    event_delivery = EventDelivery.find_by(resource: assessor)
    expect(event_delivery.event_type).to eq('new_assessor_assessment')
    expect(event_delivery.sent_at).to be_within(1.second).of(Time.zone.now)
    expect(event_delivery.meta).to include('user_assessment_ids' => [pending_assessment.id])
  end

  it 'creates event_delivery for each assessors for which notification is sent' do
    assessor2 = create(:assessor)
    assessor3 = create(:assessor)
    assessments = [create_assessor_assessment, create_assessor_assessment(assessor2),
                   create_assessor_assessment(assessor3)]

    assessments.each do |assessment|
      expect(AssessorNotificationMailer).to receive(:new_assignment).
        with(assessment.assessor.id, [assessment.id]).
        and_return(double(deliver_later: true))
    end

    described_class.perform_now

    assessments.each do |assessment|
      event_delivery = EventDelivery.find_by(resource: assessment.assessor)
      expect(event_delivery.event_type).to eq('new_assessor_assessment')
      expect(event_delivery.sent_at).to be_within(1.second).of(Time.zone.now)
      expect(event_delivery.meta).to include('user_assessment_ids' => [assessment.id])
    end
  end

  it 'updates the job track record' do
    older_started_at = job_track_record.started_at
    older_finished_at = job_track_record.finished_at

    described_class.perform_now

    expect(job_track_record.reload.started_at).to be_after(older_started_at)
    expect(job_track_record.reload.finished_at).to be_after(older_finished_at)
  end
end
