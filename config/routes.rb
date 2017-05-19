require 'sidekiq/web'
Rails.application.routes.draw do
  mount ActionCable.server => '/cable'
  # Administration panel
  #
  namespace :administration do
    root to: 'home#index'
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
          scope module: :users do
            resources :assigns, only: [:index, :new, :create, :destroy] do
              get :destroy_report, on: :member
              get :reports, on: :collection
            end
            resources :reports, only: [:destroy] do
              get :preview, on: :member
            end
          end
          member do
            patch :toggle_status
            get :sidebar
            get :reset_password
            get :spoof
          end
          collection do
            get :export
            post :assign_multiple
          end
        end
        resources :reports, only: [:index, :destroy, :new, :create]
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

        resource :licenses, only: [:show, :edit, :update]
        resources :assessments, only: [:index, :destroy] do
          get :export_results
        end
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
    resources :users, except: [:new, :create] do
      member do
        patch :toggle_status
        get :sidebar
        get :reset_password
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
          get :configure
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
      end
      scope module: 'reports' do
        resource :builders, only: [:update]
      end
    end

    resources :report_families, except: [:show] do
      member do
        get :sidebar
      end
    end

    resources :libraries

    put '/factors_norms/update', to: 'factors_norms#update'

    resources :communications do
      member do
        get :copy
        get :sidebar
        patch :toggle_status
        match :edit_form, via: [:post, :patch, :put]
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
             controllers: { registrations: 'users/registrations', invitations: 'users/invitations' }
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

    resources :assessments, only: [:index] do
      member do
        get :pass
      end
    end
    resources :reports, only: [:show]
    resource :profiles, only: [:update, :edit]
    resources :assigns, only: [:update]
    get 'survey_instructions', to: 'home#survey_instructions'
    root to: 'assessments#index'
  end

  Sidekiq::Web.use Rack::Auth::Basic do |username, password|
    # Protect against timing attacks: (https://codahale.com/a-lesson-in-timing-attacks/)
    # - Use & (do not use &&) so that it doesn't short circuit.
    # - Use `secure_compare` to stop length information leaking
    ActiveSupport::SecurityUtils.secure_compare(username, 'staging') &
        ActiveSupport::SecurityUtils.secure_compare(password, 'sumatosoft')
  end if Rails.env.production?
  mount Sidekiq::Web, at: '/sidekiq'

  root to: 'administration/administrator/sessions#new'
end
