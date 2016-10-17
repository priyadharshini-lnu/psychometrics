#
# Example:
#
# 1. Client send: { action_name: page_create }
# 2. Need to implement method `create` in module Actions::Page
#     action :create do |data, current_user, report|
#
#     end
# 3. include Actions::Page
#
module Reports
  class Channel < ApplicationCable::Channel
    include Actions::Report
    include Actions::Page
    include Actions::Module
    include Pundit
    include Administration::Policies

    def subscribed
      report = ::Report.includes(pages: [:modules]).find(params['report_id'])
      transmit({
        action: 'report_data',
        data: ReportSerializer.new(report).to_hash(include: '**')
      })
    end

    def pundit_user
      current_user
    end
  end
end
