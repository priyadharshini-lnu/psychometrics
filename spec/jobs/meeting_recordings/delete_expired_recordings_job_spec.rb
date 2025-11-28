# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MeetingRecordings::DeleteExpiredRecordingsJob, type: :job do
  let!(:project) { create(:project) }
  let!(:privacy_setting) do
    create(:privacy_setting, project_id: project.id, allow_video_call_recording: true,
   video_call_recording_expiry_in_seconds: 3600)
  end
  let!(:campaign) { create(:campaign, project_id: project.id) }
  let!(:workshop) { create(:workshop, campaign: campaign) }
  let!(:meeting_room) { create(:meeting_room, meetable: workshop) }

  before do
    allow(Settings).to receive(:storage).and_return(
      double('storage',
             dailyco_storage_service: :test,
             public_storage_service: :test,
             private_storage_service: :test)
    )
    PrivacySetting.where(project_id: project.id).where.not(id: privacy_setting.id).delete_all
  end

  it 'deletes expired meeting recordings' do
    expired_recording = create(:meeting_recording, meeting_room: meeting_room, created_at: 2.hours.ago)
    create(:meeting_recording, meeting_room: meeting_room, created_at: 10.minutes.ago)

    expect do
      described_class.perform_now
    end.to change { MeetingRecording.exists?(expired_recording.id) }.from(true).to(false)
  end

  it 'does not delete meeting recordings that are not expired' do
    valid_recording = create(:meeting_recording, meeting_room: meeting_room, created_at: 10.minutes.ago)

    expect do
      described_class.perform_now
    end.not_to change { MeetingRecording.exists?(valid_recording.id) }.from(true)
  end
end
