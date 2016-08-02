module Actions
  module Action
    def action(route)
      controller  = name.downcase.split('::').last
      action_name = "#{controller}_#{route}"
      define_method action_name do |request|
        assessment = Assessment.find_by_id(params['assessment_id'])
        if policy(assessment).open_channel?
          begin
            data            = yield(request['data'], current_administrator, assessment)
            response        = {
                type:         'success',
                notification: { level: 'success', message: I18n.t("administration.cable.notification.#{action_name}", data) },
                action:       action_name,
                request_id:   request['request_id']
            }
            response[:data] = data if data
            transmit(response)
          rescue Exception => e
            Rails.logger.error("#{e.message}\n")
            Rails.logger.error(e.backtrace.join("\n"))
            transmit(notification: { level: 'error', message: e.message }, 'action': action_name, type: 'error')
          end
        end
      end
    end
  end
end
