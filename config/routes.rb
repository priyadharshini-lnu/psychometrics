Rails.application.routes.draw do
  devise_for :administrators, path: 'administration/administrators', as: :devise,
             name: :administrator, singular: :administrator, to: 'User',
             class_name: 'User'
  devise_for :users, path: 'users', as: :devise,
             name: :user, singular: :user, to: 'User',
             class_name: 'User'

  namespace :administration do
    root to: 'home#index'
    resource :profiles

    resources :dimensions do
      member do
        get :copy
        patch 'toggle/status', action: 'toggle_status'
      end
    end

    resources :users do
      member do
        patch 'toggle/status', action: 'toggle_status'
        get 'sidebar', action: 'sidebar'
      end
    end

  end

  root to: 'home#index'
end
