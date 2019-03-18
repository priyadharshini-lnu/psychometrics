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
          end
        end
        resources :campaigns, concerns: :client_editable, only: [:index, :edit, :update, :destroy]
        resources :sub_campaigns, concerns: :client_editable, only: [:index, :edit, :update, :destroy]

        resources :licenses, only: %i[index show new create edit update] do
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

    ### ASSESSMENTS
    resources :assessments do
      member do
        get :copy
        get :sidebar
        patch :toggle_status
        post :preview
        get :preview
        post :preview
        get :reports
        get :export
        put :save
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
  constraints(subdomain: /^(?!(www|#{Settings.subdomain})$)(.+)$/i) do
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
      post :accept_privacy, on: :collection
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

    resources :reports, only: %i(show)
    resource :profiles, only: %i(update edit)
    get 'survey_instructions', to: 'home#survey_instructions'
    get 'sso/:user_id/:sso_token', to: 'home#sso'
    root to: 'assigns#index'
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
