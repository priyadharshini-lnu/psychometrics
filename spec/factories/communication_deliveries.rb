# frozen_string_literal: true

FactoryBot.define do
  factory :communication_delivery do
    trigger_type { :manual }
    delivery_rule { :send_now }
    recipients { :all }

    transient do
      client { create(:tenancy) }
      project { create(:project, parent: client) }
    end

    campaign { create(:campaign, project: project) }

    communication_template do
      create(:communication_template, kind: :invitation, level: :campaign,
                                       client: client, project: project, campaign: campaign)
    end

    association :created_by, factory: :superadmin
    association :updated_by, factory: :superadmin

    trait :workshop_invite_reminder do
      delivery_rule { nil }
      delivery_interval_number { 1 }
      delivery_interval_period { 'days' }
      campaign_assessment_group { create(:campaign_assessment_group, campaign: campaign) }

      communication_template do
        create(:communication_template, kind: :workshop_invite_reminder, level: :campaign,
                                         client: client, project: project, campaign: campaign)
      end
    end

    trait :report_available do
      delivery_rule { nil }
      recipients { nil }

      communication_template do
        create(:communication_template, kind: :report_available, level: :campaign,
                                         client: client, project: project, campaign: campaign)
      end
    end

    trait :completion do
      delivery_rule { nil }

      communication_template do
        create(:communication_template, kind: :completion, level: :campaign,
                                         client: client, project: project, campaign: campaign)
      end
    end

    trait :magic_link_email do
      delivery_rule { nil }
      recipients { nil }
      campaign { nil }

      communication_template do
        create(:communication_template, kind: :magic_link_email, level: :project,
                                         client: client, project: project, campaign: nil)
      end

      after(:build) { |delivery, evaluator| delivery.project = evaluator.project }
    end

    # Combine with one of the idp_* / development_action_deadline_missed traits below to build a
    # project-scoped delivery instead of the default campaign-scoped one (these are the only kinds,
    # besides magic_link_email, that allow project scope -- see CommunicationDelivery::PROJECT_SCOPABLE_KINDS).
    trait :project_scoped do
      campaign { nil }

      after(:build) { |delivery, evaluator| delivery.project = evaluator.project }
    end

    trait :idp_template_assigned do
      delivery_rule { nil }
      recipients { nil }

      communication_template do
        create(:communication_template, kind: :idp_template_assigned, level: campaign ? :campaign : :project,
                                         client: client, project: project, campaign: campaign)
      end
    end

    trait :idp_template_approved do
      delivery_rule { nil }
      recipients { nil }

      communication_template do
        create(:communication_template, kind: :idp_template_approved, level: campaign ? :campaign : :project,
                                         client: client, project: project, campaign: campaign)
      end
    end

    trait :idp_template_rejected do
      delivery_rule { nil }
      recipients { nil }

      communication_template do
        create(:communication_template, kind: :idp_template_rejected, level: campaign ? :campaign : :project,
                                         client: client, project: project, campaign: campaign)
      end
    end

    trait :idp_deadline_missed do
      delivery_rule { nil }
      recipients { nil }

      communication_template do
        create(:communication_template, kind: :idp_deadline_missed, level: campaign ? :campaign : :project,
                                         client: client, project: project, campaign: campaign)
      end
    end

    trait :development_action_deadline_missed do
      delivery_rule { nil }
      recipients { nil }

      communication_template do
        create(:communication_template, kind: :development_action_deadline_missed,
                                         level: campaign ? :campaign : :project,
                                         client: client, project: project, campaign: campaign)
      end
    end

    trait :workshop_invite do
      delivery_rule { nil }
      recipients { nil }
      campaign_assessment_group { create(:campaign_assessment_group, campaign: campaign) }

      communication_template do
        create(:communication_template, kind: :workshop_invite, level: :campaign,
                                         client: client, project: project, campaign: campaign)
      end
    end

    trait :workshop_booked do
      delivery_rule { nil }
      recipients { nil }
      campaign_assessment_group { create(:campaign_assessment_group, campaign: campaign) }

      communication_template do
        create(:communication_template, kind: :workshop_booked, level: :campaign,
                                         client: client, project: project, campaign: campaign)
      end
    end

    trait :workshop_cancelled do
      delivery_rule { nil }
      recipients { nil }
      campaign_assessment_group { create(:campaign_assessment_group, campaign: campaign) }

      communication_template do
        create(:communication_template, kind: :workshop_cancelled, level: :campaign,
                                         client: client, project: project, campaign: campaign)
      end
    end

    trait :workshop_upcoming_reminder do
      delivery_rule { nil }
      recipients { nil }
      campaign_assessment_group { create(:campaign_assessment_group, campaign: campaign) }

      communication_template do
        create(:communication_template, kind: :workshop_upcoming_reminder, level: :campaign,
                                         client: client, project: project, campaign: campaign)
      end
    end

    trait :assessment_center_booking_summary do
      delivery_rule { nil }
      recipients { :selected }
      trigger_type { :scheduled }
      delivery_start_date { Date.current }
      delivery_end_date { Date.current + 30.days }
      delivery_time_of_day { '00:01' } # earlier than rails_helper's frozen time-of-day in every configured Time.zone
      delivery_timezone { 'UTC' }
      delivery_frequency { 'daily' }

      communication_template do
        create(:communication_template, kind: :assessment_center_booking_summary, level: :campaign,
                                         client: client, project: project, campaign: campaign)
      end
    end
  end
end
