Rails.application.routes.draw do
  get "profiles/show"
  # https://guides.rubyonrails.org/routing.html
  resources :communities

  resources :submissions do
    resources :comments
  end

  devise_for :users

  root "submissions#index"

  resources :profiles, only: :show

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
end
