# frozen_string_literal: true

class LambdaNotificationsController < ActionController::Base
  skip_before_action :verify_authenticity_token

  def url_to_pdf
    if %w[SubscriptionConfirmation UnsubscribeConfirmation].include?(request.headers['x-amz-sns-message-type'])
      puts('SNS subscription/unsubcription details', JSON.parse(request.raw_post))
      return head :ok
    end

    hash, = JWT.decode(request.raw_post, Rails.application.secrets.aws.dig(:lambda, :signing_secret), 'HS256')
    data = hash['data']
    user_report = UserReport.find(data['user_report_id'])
    if data['update_record']
      user_report.update_column(:pdf, data['file_name'])
      user_report.prepared!
    end
    update_admin_job_progress(data)
    notify_user(data) if data['notify_user_id']

    head :ok
  end

  private

  def update_admin_job_progress(data)
    return unless data['admin_job_record_id']

    AdminJobRecord.find_by(id: data['admin_job_record_id'])&.increment_completed_tasks!
  end

  def notify_user(data)
    content_disposition = "attachment; filename=\"#{data['file_name']}\""
    file_url = Aws::S3::Presigner.new.presigned_url(:get_object,
                                                    bucket: Rails.application.secrets.directory,
                                                    key: data['file_path'],
                                                    expires_in: 10.minutes.to_i,
                                                    response_content_disposition: content_disposition).to_s
    ActionCable.server.broadcast "notification_channel_for_#{data['notify_user_id']}",
                                 type: 'success',
                                 message: I18n.t('jobs.threesixty.reports.download.message'),
                                 description: I18n.t(
                                   'jobs.threesixty.reports.download.description',
                                   url: file_url
                                 )
  end
end
