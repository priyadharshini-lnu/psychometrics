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

    ### CLIENTS
    resources :clients do
      member do
        get :copy
        get :sidebar
        patch :toggle_status
        get :license
      end
      scope module: :clients do
        resources :users do
          scope module: :users do
            resources :assigns, only: [:index, :new, :create, :destroy]
            resources :reports, only: [] do
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
          end
        end
        resource :designs, only: [:edit, :update]
        resources :reports, only: [:index]
        resources :statistics, only: [:index]
        resources :assessments, only: [:index] do
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
        get :preview
        get :reports
      end
      scope module: 'assessments' do
        scope module: 'assigns' do
          resource :finish, controller: :finish, only: [:show], path: 'assign/finish'
          resource :step1, controller: :step1, only: [:show, :update], path: 'assign/step1'
          resource :step2, controller: :step2, only: [:show, :update], path: 'assign/step2' do
            get 'selected_users'
            get 'not_selected_users'
          end
        end
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
  end

  constraints(subdomain: /^(?!(www|#{Settings.subdomain})$)(.+)$/i) do
    devise_for :users,
               path: 'users',
               as: :devise,
               name: :user,
               singular: :user,
               to: 'User',
               class_name: 'User',
               controllers: { registrations: 'users/registrations' }

    # Manager's panel
    #
    namespace :managers do
      resources :dashboard, only: [:index]
      resources :assigns, only: [:index]
      resources :notifications, only: [:index]
      resources :statistics, only: [:index]
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
end
