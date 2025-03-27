# frozen_string_literal: true

FactoryBot.define do
  factory :admin_job_record, class: AdminJobRecord do
    operation { :import_users }
    data { {} }
  end
end
