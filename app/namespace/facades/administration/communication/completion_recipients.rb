# frozen_string_literal: true

module Facades
  module Administration
    class Communication
      module CompletionRecipients
        RECIPIENT_TYPES = %w[all selected selected_admins selected_assessors].freeze

        def show_selected_admin_recipients?
          form.kind == 'completion' && form.model.selected_admins_recipients?
        end

        def show_selected_assessor_recipients?
          form.kind == 'completion' && form.model.selected_assessors_recipients?
        end

        def assessor_recipients
          fetch_assessor_users
        end

        def recipient_type_options
          return ::Communication.recipients.slice(*RECIPIENT_TYPES) if form.kind == 'completion'

          ::Communication.recipients.except('selected_admins', 'selected_assessors')
        end

        def recipient_type_label_key(recipient_type_key)
          return ".#{recipient_type_key}" unless form.kind == 'completion'

          "admin.completion_recipients_#{recipient_type_key}"
        end

        private

        def fetch_assessor_users
          return User.none if form.campaign.blank?

          User.distinct.joins(:assessors).where(disabled: false, assessors: { campaign_id: form.campaign_id })
        end
      end
    end
  end
end
