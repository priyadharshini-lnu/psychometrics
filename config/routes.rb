require 'sidekiq/web'
Rails.application.routes.draw do
  mount Rswag::Ui::Engine => '/api-docs'
  mount Rswag::Api::Engine => '/api-docs'
  mount ActionCable.server => '/cable'

  # Administration panel
  #
  namespace :administration do
    get 'dashboard', to: 'home#index'

    resource :profiles, only: [:update, :edit]

    scope module: :administrator do
      resource :sessions, only: [:new, :create], path: '', path_names: { new: 'sign_in', destroy: 'sign_out' }, as: :session do
        delete 'sign_out', to: 'sessions#destroy', as: :destroy
      end
      resource :passwords, as: :password
      resource :invitations, only: [:update], as: :invitation do
        get 'accept', to: 'invitations#edit'
      end
    end

    namespace :imports do
      resource :users, only: [:new, :create]
      resource :hris, only: [:new, :create], controller: :hris
      scope module: :assessments do
        resource :results, only: [:new, :create]
      end
    end

    resources :imports, only: [:new, :create]


    concern :commentable do
      resources :comments
    end

    concern :client_editable do
      member do
        get :copy
        get :sidebar
        patch :archive
        patch :toggle_status
      end
    end
    ### CLIENTS
    resources :clients do
      member do
        get :copy
        get :sidebar
        patch :toggle_status
        get :license
      end

      collection do
        get :export
      end
      scope module: :clients do
        resources :users do
          # user_id means membership_id in this case
          scope module: :users do
            resources :assigns, only: [:index, :new, :create, :destroy] do
              get :reports, on: :collection
              put :reset, on: :member
            end
            resources :reports, only: [:destroy] do
              get :preview, on: :member
            end
            resources :assigns_reports, only: %i[new create destroy] do
              put :regenerate, on: :member
              put :toggle_user_access, on: :member
            end
            resources :assign_assessments, only: %i[new create]
          end

          member do
            patch :toggle_status
            get :sidebar
            get :reset_password
            get :spoof
          end
          collection do
            get :admins
            get :export
            get :export_completion_status
            post :assign_multiple
          end

          resources :api_keys, except: %i[destroy edit update show] do
            member do
              patch :toggle_status
            end
          end
        end
        resources :project_admins do
          member do
            patch :toggle_status
            get :sidebar
            get :reset_password
            get :spoof
          end
          collection do
            get :new_step_1
            post :new_step_2
            post :assign_multiple
          end
        end
        resources :client_admins do
          member do
            patch :toggle_status
            get :sidebar
            get :reset_password
            get :spoof
          end
          collection do
            get :new_step_1
            post :new_step_2
            post :assign_multiple
          end
        end
        resources :reports, only: %i[index] do
          get :export
        end
        namespace :reports do
          resources :regenerates, only: %i[new create]
        end
        resource :assign_reports, only: %i[new create edit update]
        resource :assign_assessments, only: %i[new create edit update]
        resources :statistics, only: [:index]

        resources :projects, concerns: :client_editable do
          collection do
            get :export
          end
          member do
            post :search_users
          end
          # resource :designs, only: [:edit, :update]
          scope module: :projects do
            resources :campaigns, concerns: :client_editable do
              collection do
                get :export
              end
              scope module: :campaigns do
                resources :sub_campaigns, concerns: :client_editable do
                  collection do
                    get :export
                  end
                end
              end
            end
            resources :threesixty_campaigns, concerns: :client_editable do
              collection do
                get :assessments
                get :factors
              end
            end
          end
        end
        resources :campaigns, concerns: :client_editable, only: [:index, :edit, :update, :destroy]
        get '/projects/:project_id/threesixty_campaigns/:id/*all', to: 'projects/threesixty_campaigns#show', constraints: { all: /.*/ }
        get '/projects/:project_id/threesixty_campaigns/:id/', to: 'projects/threesixty_campaigns#show'

        resources :sub_campaigns, concerns: :client_editable, only: [:index, :edit, :update, :destroy]

        resources :licenses, only: %i[index show new create edit update] do
          resources :license_usages, only: [:index]
          patch :toggle_status, on: :member
          get :overview, on: :collection
        end
        resources :assessments, only: [:index, :destroy] do
          get :export_results
          get :export_normed_results
          get :export_hogan_results
        end
        resources :datasheet_rows, except: %i[show edit update]

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
          end
          resources :evaluations, only: [:show, :update, :destroy] do
            member do
              get :upload_media_url
              put :upload_callback
              post :upload_media_dev
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
        end

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
        get 'export_completion_status'
        delete 'reset'
        delete 'reset_nominations'
        delete 'remove_user'
      end
    end

    ### ASSESSMENTS
    resources :assessments do
      member do
        get :copy
        get :sidebar
        patch :toggle_status
        get :preview
        post :preview
        get :reports
        get :export
        put :save
        patch :toggle_archive
      end
      scope module: 'assessments' do
        resources :assigns, only: [:new, :create] do
          collection do
            get :step1
            get :step2
            post :finish
            post :form
            post :selected_users
            post :not_selected_users
          end
        end
        resource :builders, only: [:update]
        resource :scoring, only: [:update], controller: :scoring
      end
    end
    ### END ASSESSMENTS

    ### DIMENSIONS
    resources :dimensions do
      member do
        get :copy
        get :sidebar
        patch :toggle_status
      end
      ### FACTORS
      resources :factors do
        member do
          get :copy
          get :sidebar
          patch :toggle_status
        end
        ### SUB-FACTORS
        resources :sub_factors do
          member do
            get :sidebar
          end
        end
        ### END SUB-FACTORS
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

    ### USERS
    resources :users, except: [:create] do
      member do
        patch :toggle_status
        get :sidebar
        get :reset_password
      end
      collection do
        post :create_superadmin
        get :export
      end
    end
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
          get :new_assign
        end
      end
      resources :blocks do
        member do
          get :copy
          get :sidebar
          patch :toggle_status
          get :new_assign
          get :preview
        end
      end
    end
    ### END TEMPLATES

    resources :reports do
      member do
        get :copy
        get :sidebar
        patch :toggle_status
        get :preview
        put :regenerate
        post :upload_data_sheet
        patch :toggle_archive
      end
      collection do
        get :hogan_reports
      end
      scope module: 'reports' do
        resource :builders, only: [:update]
      end
    end

    resources :report_families, except: [:show] do
      member do
        get :sidebar
      end
      scope module: :report_families do
        resources :reports, only: %i[index destroy new create]
      end
    end

    resources :bulk_reports, only: %i[new create] do
      get :download, on: :member
    end

    resources :libraries

    put '/factors_norms/update', to: 'factors_norms#update'

    resources :communications, only: [:index, :new, :create, :destroy, :show] do
      member do
        get :download_history, defaults: { format: :csv }
        get :copy
        get :sidebar
        patch :toggle_status
      end

      match :new_form, on: :collection, via: [:post, :patch, :put]
    end

    namespace :translations do
      resources :assessments, only: [] do
        post :export
        get :new
        post :import
      end
      resources :reports, only: [] do
        post :export
        get :new
        post :import
      end
    end

    resources :products do
      member do
        get :copy
        get :sidebar
        patch :toggle_status
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

  namespace :ecommerce do
    root to: 'products#index'
    resources :products, only: [] do
      member do
        post :add_to_cart
        delete :remove_from_cart
      end
    end
    resource :carts, only: [:show, :update]
    resource :orders, only: [:new, :create] do
      get :success
    end
    scope module: :users do
      resource :sessions, only: [:new, :create], path: '', path_names: { new: 'sign_in', destroy: 'sign_out' }, as: :session do
        delete 'sign_out', to: 'sessions#destroy', as: :destroy
      end
      resource :registrations, only: [:new, :create], as: :registration
    end
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
                            passwords: 'passwords' }
  # Manager's panel
  #
  constraints(subdomain: /^(?!(#{Settings.subdomain})$)(.+)$/i) do
    namespace :managers do
      resources :dashboard, only: [:index]
      resources :assigns, only: [:index]
      resources :notifications, only: [:index]
      resources :statistics, only: [:index]
      resources :assessments, only: [:index] do
        resources :tasks do
          member do
            get :change_status
          end
          resources :comments, only: [:create]
        end
      end

      resources :users, only: [:index] do
        resources :reports, only: [:show]
      end
    end

    namespace :anonym do
      get 'clients/:client_id/assessments/:assessment_id/pass', to: 'assessments#pass', as: :assessment_pass
    end

    resources :assigns, only: %i(index update) do
      get :pass, on: :member
      get :assessment, on: :member
      post :accept_privacy, on: :collection
      member do
        get :upload_media_url
        put :upload_callback
        post :upload_media_dev
        delete :remove_media
      end
    end

    scope module: :threesixty do
      resources :campaigns, only: %i(show index) do
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
          get :download, on: :member
        end
        resources :assessments, only: %i(index)
        resources :users_results, only: %i[update] do
          member do
            get :upload_media_url
            put :upload_callback
            post :upload_media_dev
            delete :remove_media
          end
        end
        collection do
          post :change_locale
        end
      end
    end
    namespace :mindmill do
      resources :assigns, only: [] do
        member do
          get :pass
          get :results
        end
      end
    end
    namespace :hogan do
      resources :assigns, only: [] do
        member do
          get :redirect
          get :results
          put :pass
        end
      end
    end

    resources :reports, only: %i(show) do
      get :export, on: :member
    end
    resource :profiles, only: %i(update edit)
    patch 'users/update_details', to: 'users#update_details'

    get 'survey_instructions', to: 'home#survey_instructions'
    get 'sso/:user_id/:sso_token', to: 'home#sso'
    get 'assessment_completed', to: 'home#assessment_completed'
    root to: 'threesixty/campaigns#index'
  end

  Sidekiq::Web.use Rack::Auth::Basic do |username, password|
    # Protect against timing attacks: (https://codahale.com/a-lesson-in-timing-attacks/)
    # - Use & (do not use &&) so that it doesn't short circuit.
    # - Use `secure_compare` to stop length information leaking
    ActiveSupport::SecurityUtils.secure_compare(username, 'staging') &
        ActiveSupport::SecurityUtils.secure_compare(password, 'tte')
  end if Rails.env.production?
  mount Sidekiq::Web, at: '/sidekiq'

  root to: 'administration/administrator/sessions#new'

  constraints format: :json do
    namespace :api do
      namespace :v1 do
        resources :projects, only: [] do
          resources :users, only: %i[create update] do
            post :sso, on: :member

            resources :campaigns, only: [:index, :create]
            resources :assessments, only: [:index]
            resources :reports, only: [:index] do
              get :results, on: :member
              get :pdf, on: :member
            end
          end
          resources :campaigns, only: [] do
            post :duplicate, on: :member
          end
        end
      end
    end
  end
end
