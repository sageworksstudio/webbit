class Submission < ApplicationRecord
  # Relationships
  belongs_to :user
  belongs_to :community
  has_one_attached :media

  # Validations
  validates :title, presence: true
  validates :body, length: { maximum: 8000 }
end
