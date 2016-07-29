module Actions
  module Action
    def action(action_name, &block)
      action_name = "#{name.downcase.split('::').last}_#{action_name}"
      define_method action_name do |request|
        assessment = Assessment.find_by_id(params['id']) || Assessment.last
        if policy(assessment).open_channel?
          begin
            response = block.call(request['data'], current_administrator, assessment) || {}
            transmit({
                type: 'success',
                data: response,
                notification: { level: 'success', message: I18n.t("administration.cable.notification.#{action_name}") },
                action: action_name,
                request_id: request['request_id']
            })
          rescue Exception => e
            # add success of error
            Rails.logger.error("#{e.message}\n")
            Rails.logger.error(e.backtrace.join("\n"))
            transmit(notification: { level: 'error', message: e.message }, 'action': action_name, type: 'error')
          end
        end
      end
    end
  end
end