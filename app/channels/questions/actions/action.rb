module Questions
  module Actions
    module Action
      def action(route)
        controller  = name.downcase.split('::').last
        action_name = "#{controller}_#{route}"
        define_method action_name do |request|
          assessment = ::Question.find_by_id(params['question_id'])
          if policy(assessment).open_channel?
            begin
              data            = yield(request['data'], current_administrator, assessment)
              response        = {
                  type:         'success',
                  action:       action_name,
                  request_id:   request['request_id']
              }
              response[:data] = data if data
              # Skip notification if was passed params
              unless !!request.try(:[], 'data').try(:[], 'without_notification')
                response[:notification] = {
                  level: 'success',
                  message: I18n.t("administration.cable.notification.#{action_name}", data)
                }
              end

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
end
