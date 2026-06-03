# frozen_string_literal: true

module EndUser
  class SystemCheckSessionsController < ApplicationController
    skip_before_action :verify_authenticity_token

    before_action :set_campaign_user
    before_action :set_system_check_session, except: %i[create requirements_status]
    before_action :set_system_check_record, only: %i[upload_media_url complete_multipart_upload update]
    before_action :validate_system_check_enabled, only: %i[create requirements_status]

    def requirements_status
      result = SystemCheckSessions::GetSystemCheckStatus.call!(
        session_id: stored_session_id,
        campaign_user: @campaign_user
      )

      render json: result
    end

    def show
      render json: serialize_session(@system_check_session)
    end

    def create
      system_check_session = current_user.system_check_sessions.create!
      store_session_id(system_check_session.id)
      render json: serialize_session(system_check_session), status: :created
    end

    def add_record
      record = @system_check_session.system_check_records.create!(record_params)
      render json: serialize_record(record), status: :created
    end

    def update
      @system_check_record.data = @system_check_record.data.to_h.merge(record_params[:data].to_h)
      @system_check_record.update!(record_params.except(:data))
      render json: serialize_record(@system_check_record), status: :ok
    end

    def complete
      @system_check_session.finish!

      render json: serialize_session(@system_check_session)
    end

    def results
      records = @system_check_session.latest_records_by_check_type

      render json: {
        session: serialize_session(@system_check_session),
        records: records.transform_values { |record| serialize_record(record) }
      }
    end

    def upload_media_url
      file_name = "#{SecureRandom.uuid}_#{@system_check_record.check_type}.webm"
      duration = params[:duration].to_i
      SystemCheckRecords::GetMultipartUploadUrls.call(@system_check_record, file_name, duration: duration) do
        on(:ok) { |data| render json: data }
        on(:error) { |error| render json: { error: error }, status: :unprocessable_entity }
      end
    end

    def complete_multipart_upload
      SystemCheckRecords::ProcessMediaUpload.call(@system_check_record, {
        asset_key: params[:asset_key],
        upload_id: params[:upload_id],
        parts: params[:parts],
        file_size: params[:file_size],
        content_type: params[:content_type],
        checksum: params[:checksum],
        test_phrase: params[:test_phrase],
        locale: params[:locale],
        transcribed_text: params[:transcribed_text],
        face_detection_ratio: params[:face_detection_ratio]
      }) do
        on(:ok) { |record| render json: serialize_record(record) }
        on(:error) { |error| render json: { error: error }, status: :unprocessable_entity }
      end
    end

    private

    def campaign
      @campaign ||= Campaign.visible_to_end_user.find(params[:campaign_id])
    end

    def set_campaign_user
      @campaign_user = current_user.campaign_users.find_by!(campaign: campaign)
    end

    def set_system_check_session
      @system_check_session = current_user.system_check_sessions.find(stored_session_id)
    end

    def set_system_check_record
      @system_check_record = @system_check_session.system_check_records.find(params[:id])
    end

    def validate_system_check_enabled
      return if campaign.system_check_enabled?

      render json: { error: I18n.t('enduser.system_check_not_enabled') }, status: :unprocessable_entity
    end

    def record_params
      params.permit(:check_type, :passed, data: {})
    end

    def serialize_session(session)
      EndUser::SystemCheckSessionSerializer.new.serialize(session)
    end

    def serialize_record(record)
      EndUser::SystemCheckRecordSerializer.new(context: { campaign_user: @campaign_user }).serialize(record)
    end

    def store_session_id(session_id)
      cookies.signed[:system_check_session_id] = {
        value: session_id,
        expires: 30.days.from_now,
        httponly: true,
        secure: Settings.protocol == 'https',
        same_site: Settings.protocol == 'https' ? :none : :lax
      }
    end

    def stored_session_id
      cookies.signed[:system_check_session_id]
    end
  end
end
