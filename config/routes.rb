# frozen_string_literal: true

require 'sidekiq/web'
require 'sidekiq/cron/web'

Rails.application.routes.draw do
  mount Rswag::Ui::Engine => '/api-docs'
  mount Rswag::Api::Engine => '/api-docs'
  mount ActionCable.server => '/cable'

  get 'oracle_dashboards', to: 'oracle_dashboards#show', as: :oracle_dashboards

  get '/oracle_proxy/*all' => 'oracle_proxy#all'
  options '/oracle_proxy/*all' => 'oracle_proxy#all'
  post '/oracle_proxy/*all' => 'oracle_proxy#all'
  put '/oracle_proxy/*all' => 'oracle_proxy#all'

  get '/s/:id' => 'shortener/shortened_urls#show', as: :shortened
  post '/lambda_notifications/url_to_pdf'
  post '/lambda_notifications/zip_s3_files'

  get '/maintenance', to: 'maintenance#index', as: :maintenance

  get '/admin', to: 'administration/app#dashboard', as: :admin
  get '/admin/meet/:room_id', to: 'administration/app#dashboard', as: :admin_meeting

  # TODO: remove this once we move Threesixty use common campaign type route
  # rubocop:disable Style/FormatStringToken
  get '/admin/clients/:clientId/projects/:projectId/threesixty_campaigns/:id/*all',
      to: redirect('/administration/clients/%{clientId}/projects/%{projectId}/threesixty_campaigns/%{id}/%{all}')
  get '/admin/clients/:clientId/projects/:projectId/threesixty_campaigns/:id',
      to: redirect('/administration/clients/%{clientId}/projects/%{projectId}/threesixty_campaigns/%{id}')
  # rubocop:enable Style/FormatStringToken

  get '/admin/*all', to: 'administration/app#dashboard'
  get '/global_config', to: 'apps#global_config'
  get '/async_requests/status', to: 'async_requests#status'

  concern :media_uploades do
    member do
      match :upload_media_url, via: %i[post get]
      put :upload_callback
      delete :remove_media
      put :complete_multipart_upload
      put :mark_as_user_selected_take
      put :update_meta_data
    end
  end

  concern :taggable do
    post :add_tag
    post :remove_tag
  end

  concern :sheet_management do
    collection do
      get :get_columns
      post :add_column
      put :update_column
      put :update_columns_order
      delete :remove_columns
    end
  end

  concern :sheet_row_management do
    collection do
      delete :bulk_delete
      put :import
      get :export
    end
  end

  namespace :assessors do
    get 'assessment_centers', to: 'workshops#index', as: :assessment_centers

    constraints(proc { |request| request.format.pdf? || request.format.html? }) do
      resources :campaigns, only: [] do
        resources :user_reports, only: [] do
          member do
            get :pdf_preview
          end
        end
      end
    end

    resources :evaluations, only: %i[show] do
      get :subject_assessment
      member do
        get :new_response
      end
      resources :results, controller: 'users_results', only: %i[update], concerns: :media_uploades do
        member do
          post :scoring
        end
      end
    end

    constraints(proc { |request| request.format.html? }) do
      get '/', to: 'users#dashboard', as: :dashboard, constraints: { format: :html }
      get '*all', to: 'users#dashboard', constraints: { all: /.*/, format: :html }
    end

    resources :campaigns, only: [:index] do
      resources :user_reports, only: [] do
        member do
          get :download
        end
      end
      resources :users, only: %i[index show]
      resources :evaluations, only: %i[show] do
        member do
          get :evaluate
        end
      end
      resources :score_moderations, only: %i[show] do
        member do
          get :assessor_assessments
          get :reports
          get :assessment_with_results
        end
      end
    end

    resources :campaigns, only: [] do
      resources :user_reports, only: [:show]
    end
  end

  # Administration panel
  #
  namespace :administration do
    get 'user_availabilities', to: 'user_availabilities#index', as: :user_availabilities
    get 'dashboards/:id/oracle_analytics_embed', to: 'dashboards#oracle_analytics_embed'
    post 'dashboards/:id/get_embed_token', to: 'dashboards#get_embed_token'

    get 'dashboards', to: 'dashboards#index', as: :dashboard
    get 'dashboards/*all', to: 'dashboards#index', constraints: { all: /.*/ }
    post 'breadcrumbs', to: 'breadcrumbs#index'

    resource :profiles, only: %i[update edit]

    resources :meeting_rooms, only: [] do
      get :token, on: :member
    end

    resources :audit_logs do
      collection do
        get :actions
      end
    end

    scope module: :administrator do
      resource :sessions, only: %i[new create], path: '',
               path_names: { new: 'sign_in', destroy: 'sign_out' }, as: :session do
        get 'sign_out', to: 'sessions#destroy', as: :destroy
      end
      resource :passwords, as: :password
      resource :invitations, only: [:update], as: :invitation do
        get 'accept', to: 'invitations#edit'
      end
      resource :password_expired, only: %i[show update], controller: :password_expired
    end

    namespace :imports do
      resource :users, only: %i[new create]
      resource :hris, only: %i[new create], controller: :hris
      scope module: :assessments do
        resource :results, only: %i[new create]
      end
    end

    resources :imports, only: %i[new create]

    concern :client_editable do
      member do
        get :copy
        get :sidebar
        patch :archive
        patch :toggle_status
      end
    end

    resources :new_campaigns, only: [] do
      scope module: :campaigns do
        resources :sms_invites, only: %i[index create update destroy] do
          collection do
            post :import
            get :search
            get :download_example_import_file
          end
        end
        resources :sms_records, only: %i[create]

        resources :sheets, concerns: :sheet_management
        resources :sheet_rows, concerns: :sheet_row_management

        resources :stats, only: %i[index] do
          collection do
            post :timeseries
          end
        end

        resources :registration_codes do
          member do
            get :download_qrcode
          end
        end

        resources :admins do
          member do
            get :spoof
            get :reset_password
          end
        end

        resources :reports, only: %i[create destroy] do
          collection do
            get :report_families
            get :assessments_and_reports
            get :other
            post :regenerate
            post :bulk_download
          end
          member do
            post :export
            patch :toggle_user_access
            patch :toggle_assessor_access
            patch :toggle_auto_assign
            patch :toggle_user_dashboard
            patch :toggle_main_report
          end
        end
        resources :user_reports do
          member do
            get :pdf_preview
            get :download
            put :approve
            put :start_qc
            put :abort_qc
            put :send_for_approval
            put :request_changes
            put :remove_approval
            patch :toggle_user_access
            get :webhook_payload
            get :possible_webhook_events
            put :upload_file
            delete :remove_file
          end
          collection do
            post :regenerate
            get :dashboard
            post :bulk_download
          end
        end
        resources :text_module_overrides do
          collection do
            post :approve
          end
          member do
            delete :disapprove
          end
        end
        resources :users do
          resources :user_reports
          member do
            patch :toggle_status
            post :extend_time
            get :webhook_payload
          end
          collection do
            post :import
            post :assign_reports_and_assessments
            get :export_reports_and_assessments
            get :export
            get :export_completion_status
            get :export_compact_completion_status
            post :search
          end
        end

        resources :assessors do
          collection do
            post :import
            get :available_assessments
            get :lead_assessor_assessment
            post :create_all
          end
          member do
            get :spoof
          end

          scope module: :assessors do
            resources :user_assessments, only: %i[index create] do
              member do
                put :reset
                put :rescore
                put :reset_progress
              end
              collection do
                delete :bulk_delete
              end
            end
          end
        end

        resources :universal_links, only: %i[show update] do
          member do
            put :enable
            put :regenerate
          end
        end
        resources :assessments, only: %i[create destroy] do
          member do
            get :export_raw_results
            get :export_scoring_results
            get :export_normed_results
            get :export_raw_factor_scores
            get :export_external_results
            get :export_occupations
            post :import_results
            get :norms
            post :update_norm
            post :update_mettl_schedule
            put :update_content_variation
            put :update_assessor_form
            put :update_available_locales
            post :rescore_responses
            put :update_prework
            put :update_workshop_activity
            put :toggle_require_scheduling
            put :toggle_auto_assign
            put :schedule_assessment
            post :normalize_factor_scores
          end
          collection do
            get :other
          end
        end
        resources :user_assessments, only: [:destroy] do
          member do
            post :update_norm
            post :update_mettl_schedule
            post :rescore_response
            post :reset
            post :reset_progress
            post :update_additional_time
            post :normalize_factor_scores
            get :webhook_payload
            put :schedule_assessment
            put :toggle_require_scheduling
            put :update_content_variation
            put :update_simulation_time_extension
          end
        end

        resources :campaign_assessment_groups, only: %i[index create update destroy] do
          collection do
            post :update_positions
          end
        end
        resources :campaign_assessments, only: %i[update] do
          collection do
            post :update_positions
          end
          member do
            put :update_external_config
          end
        end
      end
    end

    resources :projects, :new_projects do
      scope module: :projects do
        resources :sheets, concerns: :sheet_management
        resources :sheet_rows, concerns: :sheet_row_management
        resources :saml_settings, only: %i[create update] do
          collection do
            post :test_saml
          end
        end
        resources :smtp_settings, only: %i[update] do
          collection do
            post :send_test_email
            post :validate_settings
          end
        end
        resources :security_settings, only: %i[update]
        resources :integrations, only: %i[index create update destroy] do
          collection do
            post :load_mettl_assessments
          end
        end
      end

      resources :new_campaigns, only: [], constraints: proc { |request| %w[csv json].include?(request.format) } do
        scope module: :campaigns do
          resources :registration_codes
        end
      end

      scope module: :projects do
        resources :new_campaigns do
          collection do
            get :templates_and_assessment
            post :search_users
          end

          get 'users/:id/spoof', to: '/administration/campaigns/users#spoof'

          member do
            get :fetch_campaign_options
            get :fetch_campaign_instructions
            get :fetch_descriptions
            put :update_campaign_options
            get :pdf_password
            get '*all', to: 'new_campaigns#show', constraints: { all: /.*/ }
          end
        end
      end
    end

    resources :projects do
      member do
        post :search_users
      end
    end

    resources :workshops, only: %i[] do
      resources :users, controller: 'workshops/users' do
        collection do
          post :search_subjects
          post :search_assessors
        end
      end
    end

    ### CLIENTS
    resources :clients do
      member do
        get :edit
        get :copy
        get :sidebar
        patch :toggle_status
        get :license
      end

      collection do
        get :export
      end
      scope module: :clients do
        resources :projects, concerns: :client_editable do
          scope module: :projects do
            resources :new_campaigns

            resources :threesixty_campaigns, concerns: :client_editable do
              collection do
                get :factors
              end
            end
          end
        end
        get '/projects/:project_id/threesixty_campaigns/:id/*all',
            to: 'projects/threesixty_campaigns#show', constraints: { all: /.*/ }
        get '/projects/:project_id/threesixty_campaigns/:id/', to: 'projects/threesixty_campaigns#show'
        resources :sheet_rows, except: %i[show edit update]
      end
    end

    ### END CLIENTS
    resources :threesixty_campaigns do
      scope module: 'threesixty_campaigns' do
        resources :subjects do
          collection do
            get :download_example_import_file
            post :create_all
            post :search
            post :import
          end
          member do
            get :preview_report
          end

          resource :reports, only: [:show] do
            get :download, on: :member
            post :regenerate, on: :member
          end
          resources :evaluations, only: %i[show update destroy] do
            member do
              get :upload_media_url
              put :upload_callback
              delete :remove_media
            end
          end
        end
        resources :evaluators do
          collection do
            get :download_example_import_file
            post :import
            post :create_all
          end
        end

        resource :options do
          get :participant_options
          get :report_options
          get :message_options
        end

        resources :email_templates do
          member do
            get :send_test_email
          end
        end
        resources :instruction_templates

        resources :email_schedules do
          collection do
            get :schedulable_templates
            post :recipient_by_criteria
          end
          member do
            get :download, constraints: { format: :csv }
          end
        end

        resources :users, only: [:update]

        resources :managers
        resources :relationships do
          collection do
            get :fetch_with_usage
          end
        end

        resources :participants do
          member do
            get :spoof
          end
        end
        resources :nomination_requirements do
          collection do
            put :save
          end
        end
      end
      member do
        get :export_threesixty_scores
        get :export_results
        post :import_results
        get :export_completion_status
        delete :reset
        delete :reset_nominations
        delete :remove_user
        post :rescore_assessment
        post :regenerate_reports
        post :bulk_download
      end
    end

    ### ASSESSMENTS
    get '/assessments/active' => 'assessments#index'
    get '/assessments/archived' => 'assessments#index'
    get '/assessments/trash' => 'assessments#index'
    get '/assessments/:id/edit' => 'assessments#index'
    resources :assessments do
      member do
        get :copy
        get :sidebar
        patch :toggle_status
        get :preview
        post :preview
        get :reports
        put :save
        patch :toggle_archive
        get :scoring, to: 'assessments#show', constraints: { all: /.*/ }
        get :resources, to: 'assessments#show', constraints: { all: /.*/ }
        get :assessments
        get :questions
        get :factors
        post :upload_data_sheet
        delete :soft_delete
        put :restore
        post :import_questions
        get :import_questions_sample_file
      end

      collection do
        get :pearson_norms
        get :projects
        get :external_assessments
      end

      scope module: 'assessments' do
        resource :builders, only: %i[show update]
        resource :scoring, only: [:update], controller: :scoring
        resource :agiles, only: %i[show update]
      end
    end
    ### END ASSESSMENTS

    ### DIMENSIONS
    resources :dimensions do
      member do
        get :copy
        get :sidebar
        patch :toggle_status
        get :translations
        post :export_translations
        post :import_translations
      end
      ### FACTORS
      resources :factors do
        member do
          get :copy
          get :sidebar
          patch :toggle_status
        end
      end
      ### END FACTORS
      ### OCCUPATIONS
      resources :occupations do
        member do
          get :copy
          get :sidebar
          patch :toggle_status
        end
        ### FACTORS
        resources :factors, controller: :occupations_factors do
          member do
            get :copy
            get :sidebar
            patch :toggle_status
          end
        end
        ### END FACTORS
      end
      ### END OCCUPATIONS
      ### INNOVATION STYLES
      resources :innovation_styles do
        member do
          get :copy
          get :sidebar
          patch :toggle_status
        end
        ### FACTORS
        resources :factors, controller: :innovation_styles_factors do
          member do
            get :copy
            get :sidebar
            patch :toggle_status
          end
        end
      end
      ### END INNOVATION STYLES
    end
    ### END DIMENSIONS

    ### USERS constraints
    resources :users, only: [] do
      member do
        get :spoof
      end
      collection do
        post :search_admins
      end
    end
    get '/users/*all' => 'users#index', constraints: proc { |request| request.format == 'html' }, as: :users
    ### END USERS

    ### NORMS
    resources :norms do
      member do
        get :copy
        patch :toggle_status
        get :sidebar
        get :editor
        get :export
      end
    end
    ### END NORMS

    ### TEMPLATES
    namespace :templates do
      resources :questions do
        member do
          get :copy
          get :sidebar
          patch :toggle_status
        end
      end
      resources :blocks do
        member do
          get :copy
          get :sidebar
          patch :toggle_status
          get :preview
        end
      end
    end
    ### END TEMPLATES

    ### Reports
    get '/reports/active' => 'reports#index'
    get '/reports/archived' => 'reports#index'
    get '/reports/trash' => 'reports#index'
    get '/reports/:id/edit' => 'reports#index'
    resources :reports do
      member do
        get :preview
        post :upload_data_sheet
        put :remap_assessment
      end
      scope module: 'reports' do
        resource :builders, only: %i[show update]
      end
    end

    get 'report_approvals', to: 'report_approvals#app', as: :report_approvals
    get 'report_approvals/*all', to: 'report_approvals#app', constraints: { all: /.*/, format: :html }

    resources :report_families, only: [:index] do
      scope module: :report_families do
        resources :reports, only: %i[index]
      end
    end

    resources :bulk_reports, only: %i[new create] do
      get 'download(/:index)', to: 'bulk_reports#download', on: :member, as: :download
    end

    resources :libraries

    put '/factors_norms/update', to: 'factors_norms#update'
    put '/factors_norms/update_percentile_norm', to: 'factors_norms#update_percentile_norm'

    resources :admin_jobs, only: %i[index] do
      collection do
        put :read_all
      end
      member do
        put :read
      end
    end

    resources :communications, only: %i[index new create destroy show] do
      member do
        get :download_history, defaults: { format: :csv }
        get :copy
        get :sidebar
        patch :toggle_status
      end

      match :new_form, on: :collection, via: %i[post patch put]
    end

    namespace :translations do
      resources :assessments, only: [] do
        post :export
        get :new
        post :import
      end
      resources :questions, only: [] do
        post :export
        post :import
      end
      resources :reports, only: [] do
        post :export
        get :new
        post :import
      end
    end

    resources :campaign_templates
    root to: 'clients#index'
  end
  #
  # END: Administration panel

  namespace :system do
    resources :reports, only: [:index]
    resources :memberships, only: [:index]
  end

  namespace :webhooks do
    resource :examus, only: %i[create]
    post '/saville/results', to: 'saville#results', as: :saville
    post 'sms_histories', to: 'sms_histories#status', as: :sms_histories
    post '/:project_id/iiht/results', to: 'iiht#results', as: :iiht
    post '/:project_id/mettl/completion_notification', to: 'mettl#completion_notification',
                                                            as: :mettl_completion_notification
    post '/:project_id/mettl/results', to: 'mettl#results', as: :mettl_results_notification
    post '/:project_id/simulation/progress_notification', to: 'simulation#progress_notification',
as: :simulation_progress_notification
  end

  devise_scope :user do
    get 'users/sign_up/success', to: 'users/registrations#success'
    get 'users/sign_in_link', to: 'users/magic_links#sign_in_link'
    get 'users/magic_links/sign_in', to: 'users/magic_links#send_magic_link'
    post 'users/magic_links/sign_in', to: 'users/magic_links#send_magic_link'
  end

  devise_for :users,
             path: 'users',
             as: :devise,
             name: :user,
             singular: :user,
             to: 'User',
             class_name: 'User',
             controllers: { registrations: 'users/registrations',
                            sessions: 'users/sessions',
                            invitations: 'users/invitations',
                            passwords: 'passwords',
                            password_expired: 'users/password_expired',
                            magic_links: 'users/magic_links',
                            unlocks: 'users/unlocks' }

  namespace 'passwordless' do
    devise_for :users,
               controllers: { sessions: 'devise/passwordless/sessions' }
  end

  # Manager's panel
  #
  get 'transcribe/pre_sign_url', to: 'transcribe#pre_sign_url'

  constraints(subdomain: /^(?!(#{Settings.subdomain})$)(.+)$/i) do
    scope module: :users do
      resources :mobile_number_verifications, only: [] do
        collection do
          post :send_verification_code
          post :verify
        end
      end
    end

    resources :highlights, only: %i[update]

    scope module: :end_user do
      resources :campaigns, only: %i[show] do
        collection do
          get :join_with_code
          get :join_with_token
        end
        get 'assessments/:assessment_id', to: 'users#redirect_to_user_assessment', as: :campaign_assessment

        get :insights
        put :reset_practice_campaign
      end
      get 'assessment_centers/:id', to: 'workshops#show', as: :workshop_page
      get :dashboard, to: 'users#dashboard'
      get :workshop, to: 'users#workshop'
      get 'policy/:version', to: 'users#policy'
      post :accept_privacy, to: 'users#accept_privacy'
      get 'anonym/error', to: 'anonyms#error'
      get 'anonym/:assessment_key', to: 'anonyms#show', as: :anonym_pass
      delete 'anonym/:assessment_key', to: 'anonyms#restart', as: :anonym_restart
      get 'anonym/:assessment_key/restart', to: 'anonyms#restart'
      get :workshop_invites, to: 'workshop_invited_subjects#invites', defaults: { format: :json }
      get :workshop_bookings, to: 'workshop_invited_subjects#bookings', defaults: { format: :json }

      get 'iiht/:campaign_id/:assessment_id', to: 'iiht_user_assessments#redirect', as: :iiht_assessment_redirect
      get 'mettl/assessment/:mettl_assessment_id', to: 'mettl_user_assessments#redirect', as: :mettl_assessment_redirect

      resources :meeting_rooms, only: [] do
        get :token, on: :member
      end

      resources :workshop_invites, only: [] do
        member do
          post :book
          get :fetch_booking
          get :fetch_invite
          post :reschedule_or_request_reschedule
          post :cancel_or_request_cancellation
        end
      end

      resources :hogan_user_assessments, only: [] do
        member do
          get :redirect
          post :pass
        end
      end

      resources :user_reports do
        member do
          get :pdf_preview
        end
      end

      resources :saville_user_assessments, only: [] do
        member do
          post :pass
          get :redirect
        end
      end

      resources :pearson_user_assessments, only: [] do
        member do
          post :pass
          get :redirect
        end
      end

      resources :iiht_user_assessments, only: [] do
        member do
          post :pass
        end
      end

      resources :mettl_user_assessments, only: [] do
        member do
          post :pass
        end
      end

      resources :simulation_user_assessments, only: [] do
        member do
          post :pass
          get :redirect
        end
      end

      resources :agile_user_assessments, only: %i[show update] do
        member do
          post :events
          put :set_language
        end
      end

      resources :user_assessments do
        resources :users_results, only: %i[index update], concerns: :media_uploades
        member do
          get :assessment
          get :pass
          get :begin
          get :validate_session
          post :upload_user_verification_image_url
          put :user_verification_image_upload_callback
        end
      end

      resources :campaign_users do
        member do
          post :begin_campaign
          post :continue_campaign
          get :proctoring_redirect
        end
      end

      resources :users do
        collection do
          post :change_locale
          patch :update_details
          patch :upload_photo
          patch :change_password
        end
      end

      resources :user_idp_development_actions, only: %i[index] do
        collection do
          get :user_idp_skills
          get :available_development_actions
          post :save_plan
          put :update_progress
        end
      end

      resources :user_idp_plans, only: [] do
        collection do
          get :summary
        end
      end
    end

    scope module: :threesixty do
      resources :threesixty_campaigns, only: %i[show index], controller: :campaigns, as: :campaigns do
        resources :nominations do
          post :search_evaluators
          get :request_approval
          get :send_evaluator_reminders
          put :update_status
          resources :evaluators do
            put :update_status
          end
        end
        resources :evaluations do
          put :update_status
          put :decline
        end
        resources :reports do
          put :update_status
          get :check_report, on: :member
          get :download, on: :member
        end
        resources :assessments, only: %i[index]

        collection do
          post :change_locale
        end
        member do
          get :options
        end
      end
      get 'system_checks/:assessment_id/:id', to: 'campaigns#system_checks'
    end

    resources :reports, only: %i[show] do
      get :export, on: :member
    end
    resource :profiles, only: %i[update edit]

    resources :job_roles, only: %i[index], controller: 'end_user/job_roles'
    resources :skills, only: %i[index], controller: 'end_user/skills'
    resources :idp_template_skills, only: %i[index], controller: 'end_user/idp_template_skills'
    resources :skill_gap_reports, only: %i[show], controller: 'end_user/skill_gap_reports'
    resources :user_idp_skills, only: %i[index create update], controller: 'end_user/user_idp_skills'
    resources :direct_reports, only: %i[index], controller: 'end_user/direct_reports' do
      put :update_status, on: :member
    end

    get 'survey_instructions', to: 'home#survey_instructions' # NOTE: does it use anywhere?
    get 'sso/:user_id/:sso_token', to: 'home#sso'
    get 'identify', to: 'home#identify', as: :identify
    get 'assessment_completed(/:campaign_id)', to: 'home#assessment_completed', as: :assessment_completed
    get 'upgrade', to: 'home#upgrade'
    get 'profile_details', to: 'end_user/users#dashboard'
    get 'change_password', to: 'end_user/users#dashboard'
    get 'meet/:room_id', to: 'end_user/users#dashboard', as: :meeting
    get 'invites', to: 'end_user/users#dashboard'
    get 'booking', to: 'end_user/users#dashboard'
    get 'invites/:id/booking', to: 'end_user/users#dashboard'
    get 'invites/:id/success', to: 'end_user/users#dashboard'
    get 'invites/:id/details', to: 'end_user/users#dashboard'
    get 'idp/*path', to: 'end_user/users#dashboard'
    get 'evaluation_session_exists', to: 'end_user/users#dashboard'
    root to: 'end_user/users#dashboard'
  end

  get 'media_players/audio', to: 'media_players#audio'
  get 'media_players/video', to: 'media_players#video'
  get 'evaluation_session_exists', to: 'end_user/users#dashboard'

  if Rails.env.production?
    authenticate :user, ->(u) { u.is?(:superadmin) } do
      mount Sidekiq::Web => '/sidekiq'
    end
  else
    mount Sidekiq::Web, at: '/sidekiq'
  end

  root to: 'administration/administrator/sessions#new', as: :admin_root

  constraints format: :json do
    namespace :api do
      namespace :v1 do
        resources :projects, only: %i[show create update] do
          resources :campaigns, only: %i[show create update] do
            get :assessments_reports, on: :member, action_name: 'get_assessments_reports'
            put :assessments_reports, on: :member
            resources :users, only: %i[indexs] do
              put :assessments_reports, on: :member
              get :results, on: :member
            end

            scope module: :campaigns do
              resources :assessments, only: %i[update destroy]
              resources :reports, only: %i[update destroy]
            end
          end

          resources :users, only: %i[index create update] do
            post :sso, on: :member
            collection do
              get :search
            end
            post 'campaigns' => 'campaigns#assign_user'
            resources :campaigns, only: %i[index] do
              patch '/', action: :update_campaign_user, on: :member
            end
            resources :assessments, only: %i[index update]
            resources :reports, only: %i[index update] do
              get :results, on: :member
              get :pdf, on: :member
            end
          end
          resources :campaigns, only: [] do
            post :duplicate, on: :member
          end
        end
        resources :reports, only: [] do
          get :dimensions, on: :member
        end
      end

      namespace :v2 do
        namespace :administration do
          jsonapi_resources :clients do
            jsonapi_relationships
            jsonapi_resources :client_privacy_settings, only: %i[index update]
            jsonapi_resources :client_auditlog_export_settings, only: %i[update] do
              member do
                post :test_connection
              end
              collection do
                get :create_or_get
              end
            end
            jsonapi_resources :admin_roles
            jsonapi_resources :skill_aliases
            jsonapi_resources :projects, only: %i[index create update]
            jsonapi_resources :licenses, only: %i[index create update] do
              jsonapi_resources :license_usages, only: %i[index] do
                member do
                  post :toggle_status
                end
              end
            end
            jsonapi_resources :idp_templates, only: %i[index], controller: 'clients/idp_templates'
          end
          jsonapi_resources :report_families do
            jsonapi_resources :report_families_reports
          end
          jsonapi_resources :projects, only: :show do
            jsonapi_resources :privacy_settings, only: %i[index update]
            member do
              get :workshop_status_export
              get :seach_user
              put :add_manager
            end
          end
          jsonapi_resources :memberships, only: %i[index create update show destroy] do
            get :spoof
            get :reset_password
            collection do
              get :available_permissions
              post :export
            end
          end
          jsonapi_resources :users do
            post :reset_password
            post :unlock_user_access
            get :roles
            scope module: :users do
              resource :uploads, only: %i[update]
            end
            collection do
              post :create_superadmin
              post :create_global_assessor
              post :change_password
              get :current_user_details
            end
            jsonapi_resources :api_keys, only: %i[index create update]
          end
          jsonapi_resources :campaign_templates
          jsonapi_resources :assessments, concerns: :taggable do
            post :toggle_archive
            post :copy
            post :restore
            post :remove_cache
            get :fetch_translations
            post :update_translations
            scope module: :assessments do
              resource :uploads, only: %i[update]
            end
            get :export_raw_factor_scores
            get :export_raw_results
            get :export_normed_results
            get :external_scores
          end
          jsonapi_resources :dimensions
          jsonapi_resources :norms do
            post :copy
            post :editor
          end
          jsonapi_resources :tags
          jsonapi_resources :external_assessments
          jsonapi_resources :external_reports
          jsonapi_resources :external_norms
          jsonapi_resources :dashboards, only: %i[index create update]
          jsonapi_resources :datasheet_rows do
            collection do
              get :datasheet_for_assessor
            end
          end
          jsonapi_resources :design_settings, only: %i[index update] do
            scope module: :design_settings do
              resource :uploads, only: %i[update]
            end
          end
          jsonapi_resources :projects do
            jsonapi_resources :webhooks do
              post :send_test
            end

            jsonapi_resources :project_assessments

            jsonapi_resources :registration_settings, only: %i[index update]
            jsonapi_resources :mettl_schedule_records

            jsonapi_resources :assessments do
              scope module: :assessments do
                jsonapi_resources :factors do
                  collection do
                    get :questions
                  end
                end
              end
            end
            jsonapi_resources :threesixty_campaigns do
              post :create_campaign, on: :collection
            end
          end
          jsonapi_resources :profile_settings, only: %i[index update]
          jsonapi_resources :dashboards, only: %i[index show create update] do
            patch :upload_image
            post :refresh
            collection do
              get :powerbi_capacities
            end
          end

          resources :campaigns, only: %i[update show] do
            scope module: :campaigns do
              jsonapi_resources :sms_histories, only: %i[index]
            end

            jsonapi_resources :report_approval_settings, only: %i[index create update destroy]
            jsonapi_resources :campaign_assessor_assessments, only: %i[index create update destroy]
            scope module: :campaigns do
              jsonapi_resources :factor_benchmark_scores do
                collection do
                  post :bulk_create
                end
              end
            end
            jsonapi_resources :workshops, only: %i[index show update] do
              member do
                post :change_status
                post :bulk_update_subjects
                delete :remove_workshop
              end
              collection do
                post :create_bulk_workshops
              end
              jsonapi_relationships
              jsonapi_resources :workshop_subjects, only: %i[show index create update destroy] do
                post :mark_cancelled, on: :member
              end
              jsonapi_resources :workshop_activities
              jsonapi_resources :workshop_resources
              jsonapi_resources :campaign_assessments, only: %i[index]
            end

            jsonapi_resources :campaign_assessments, only: %i[index]
            jsonapi_resources :campaign_scoring_variables, only: %i[index update]

            jsonapi_resources :workshop_subjects, only: %i[index] do
              member do
                post :update_subject_details_and_assessments
              end
              jsonapi_resources :user_assessments, only: %i[index]
              jsonapi_resources :campaign_assessor_assessments, only: %i[] do
                get :subject_assessor_assessments, on: :collection
              end
            end
            jsonapi_resources :workshop_invites, only: %i[index create destroy show] do
              jsonapi_relationships
              collection do
                get :import_subjects_from_campaign
                post :import_subjects_from_csv
              end
              jsonapi_resources :workshop_invited_subjects, only: %i[index create destroy]
            end
            jsonapi_resources :workshop_invited_subjects, only: %i[index] do
              member do
                post :reject_request
                post :accept_request
              end
            end
            jsonapi_resources :users, only: %i[index show], controller: 'campaigns/users' do
              member do
                get :assessors_scores
                get :active_idp_template
              end
            end

            jsonapi_resources :dimensions, controller: 'campaigns/dimensions' do
              collection do
                get :assessor_dimensions
              end
              member do
                get :factors
              end
            end

            jsonapi_resources :campaign_factor_groups, only: %i[index create update destroy] do
              collection do
                post :initialize_scoring
                post :update_positions
              end
            end
            jsonapi_resources :campaign_factors, only: %i[index create update destroy] do
              collection do
                post :update_positions
                get  :export
                post :import
                post :bulk_update
                post :remove_all
                get :validate_campaign_factor_deletion
              end
            end
            jsonapi_resources :campaign_user_scorings, only: %i[index] do
              member do
                post :rescore
                post :change_finalized_campaign_score
              end
              collection do
                get :campaign_scores
                get :export_scorings
                post :rescore_bulk
                post :change_finalized_campaign_score_bulk
                post :import_external_campaign_scorings
                get :import_external_scorings_sample_file
              end
            end
            jsonapi_resources :campaign_factor_values, only: %i[index] do
              collection do
                post :save_assessor_scoring_factor_value
              end
            end
            jsonapi_resources :campaign_assessor_assessment_factor_weights, only: %i[index] do
              collection do
                post :bulk_upsert
              end
            end
          end
          jsonapi_resources :workshops, only: %i[index] do
            jsonapi_relationships
          end

          jsonapi_resources :user_availability_dates, only: %i[index create update destroy]

          jsonapi_resources :reports do
            post :copy
            post :restore
            scope module: :reports do
              resource :uploads, only: %i[update]
            end
          end
          resources :user_reports, only: [] do
            jsonapi_resources :user_report_comments, only: %i[index create update destroy]
          end
          jsonapi_resources :report_approvals, only: %i[index] do
            collection do
              get :search_campaign
              get :search_report
              get :search_user
            end
          end
          resources :user_report_events, only: %i[index] do
            collection do
              get :export
            end
          end
          resources :workshop_facilitators, only: %i[] do
            collection do
              get :search_assessors
              get :search_managers
            end
          end
          resources :user_idp_plans, only: %i[create]
          jsonapi_resources :skills, only: %i[index]
        end
      end
    end
  end
end
